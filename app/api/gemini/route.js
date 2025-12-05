import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Subscription', 'Income', 'Other', 'General'];

export async function POST(request) {
  try {
    const { message, cards = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use gemini-pro which is widely available and stable
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt with context about available cards
    const cardsList = cards.length > 0 
      ? `Available cards: ${cards.map(c => c.name).join(', ')}`
      : 'No cards available';

    const prompt = `You are a financial assistant that helps parse user messages about expenses and income. 

Analyze the following user message and extract transaction information. Return ONLY a valid JSON object with the following structure:
{
  "isTransaction": boolean,  // true if this is about adding a transaction (expense or income)
  "type": "expense" | "income" | null,  // null if not a transaction
  "title": string,  // A short, descriptive title (e.g., "Coffee", "Salary", "Groceries")
  "amount": number | null,  // The amount as a number (null if not found)
  "category": string | null,  // One of: ${CATEGORIES.join(', ')} (null if not a transaction)
  "card": string | null  // The card name if mentioned, or null. Must match one of the available cards: ${cards.map(c => c.name).join(', ')}
}

Rules:
1. If the message is about spending money, buying something, or an expense, set type to "expense" and isTransaction to true
2. If the message is about receiving money, salary, income, or earning, set type to "income" and isTransaction to true
3. Extract the amount from the message (look for numbers with $ or currency symbols)
4. Infer the category from context (e.g., "coffee" or "lunch" = Food, "train" or "bus" = Transport, "netflix" = Subscription, etc.)
5. If a card name is mentioned, extract it and match it to the available cards list
6. If the message is just a conversation (not about transactions), set isTransaction to false
7. Default category to "General" if you can't determine a specific category
8. Default to "expense" type if it's clearly spending but type is ambiguous

User message: "${message}"
${cardsList}

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      // Fallback: try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    // Validate and normalize the response
    const normalized = {
      isTransaction: parsedResponse.isTransaction === true,
      type: parsedResponse.type === 'expense' || parsedResponse.type === 'income' ? parsedResponse.type : null,
      title: parsedResponse.title || 'New Transaction',
      amount: parsedResponse.amount && typeof parsedResponse.amount === 'number' ? parsedResponse.amount : null,
      category: parsedResponse.category && CATEGORIES.includes(parsedResponse.category) ? parsedResponse.category : 'General',
      card: parsedResponse.card || null,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message with Gemini' },
      { status: 500 }
    );
  }
}

