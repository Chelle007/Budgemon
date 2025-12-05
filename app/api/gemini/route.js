import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Subscription', 'Income', 'Other', 'General'];

export async function POST(request) {
  try {
    const { message, cards = [], transactions = [] } = await request.json();

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context about available cards with balances
    const totalCardBalance = cards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const cardsList = cards.length > 0 
      ? `User's cards/accounts:\n${cards.map(c => `- ${c.name}: $${(parseFloat(c.balance) || 0).toFixed(2)}`).join('\n')}\nTotal balance across all cards: $${totalCardBalance.toFixed(2)}`
      : 'No cards/accounts set up yet';

    // Build transaction history context (last 50 transactions)
    const recentTransactions = transactions.slice(0, 50);
    const transactionHistory = recentTransactions.length > 0
      ? `Recent transaction history:\n${recentTransactions.map(t => 
          `- ${t.date}: ${t.title} | $${Math.abs(t.amount).toFixed(2)} ${t.amount < 0 ? '(expense)' : '(income)'} | Category: ${t.category || 'General'}`
        ).join('\n')}`
      : 'No transaction history available';

    // Calculate some stats for context
    const totalExpenses = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = recentTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryTotals = {};
    recentTransactions.filter(t => t.amount < 0).forEach(t => {
      const cat = t.category || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
    });

    const prompt = `You are Lumi, a friendly and helpful financial companion assistant. You help users track their spending and answer questions about their finances.

Your tasks:
1. If the user is LOGGING a new transaction (expense or income), extract the details
2. If the user is ASKING a question about their spending/finances/card balances, provide a helpful answer using the data below

${cardsList}

${transactionHistory}

Summary stats:
- Total balance (all cards): $${totalCardBalance.toFixed(2)}
- Total expenses (from history): $${totalExpenses.toFixed(2)}
- Total income (from history): $${totalIncome.toFixed(2)}
- Spending by category: ${Object.entries(categoryTotals).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join(', ') || 'None'}

Return ONLY a valid JSON object with this structure:
{
  "isTransaction": boolean,  // true ONLY if user is adding a NEW transaction
  "isQuery": boolean,  // true if user is asking a question about their finances/history
  "type": "expense" | "income" | null,  // for new transactions only
  "title": string | null,  // for new transactions: short title like "Coffee", "Salary"
  "amount": number | null,  // for new transactions: the amount
  "category": string | null,  // One of: ${CATEGORIES.join(', ')}
  "card": string | null,  // card name if mentioned
  "queryResponse": string | null  // for queries: your friendly, helpful response about their finances
}

Rules:
1. For NEW transactions: set isTransaction=true, extract title/amount/category/type
2. For QUESTIONS about finances (e.g., "how much did I spend on food?", "what was my last purchase?"): set isQuery=true, provide queryResponse
3. If asking about spending, calculate from the transaction history provided
4. Be friendly and encouraging in queryResponse - you're Lumi, a supportive companion!
5. If the message is just casual conversation (hi, hello, etc.), set isQuery=true and respond warmly
6. Categories: ${CATEGORIES.join(', ')}

User message: "${message}"

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let parsedResponse;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    console.log('Gemini parsed response:', JSON.stringify(parsedResponse, null, 2));

    // Parse amount - handle both number and string responses
    let parsedAmount = null;
    if (parsedResponse.amount !== null && parsedResponse.amount !== undefined) {
      const numAmount = typeof parsedResponse.amount === 'number' 
        ? parsedResponse.amount 
        : parseFloat(parsedResponse.amount);
      if (!isNaN(numAmount)) {
        parsedAmount = numAmount;
      }
    }

    const normalized = {
      isTransaction: parsedResponse.isTransaction === true || parsedResponse.isTransaction === 'true',
      isQuery: parsedResponse.isQuery === true || parsedResponse.isQuery === 'true',
      type: parsedResponse.type === 'expense' || parsedResponse.type === 'income' ? parsedResponse.type : null,
      title: parsedResponse.title || 'New Transaction',
      amount: parsedAmount,
      category: parsedResponse.category && CATEGORIES.includes(parsedResponse.category) ? parsedResponse.category : 'General',
      card: parsedResponse.card || null,
      queryResponse: parsedResponse.queryResponse || null,
    };

    console.log('Normalized response:', JSON.stringify(normalized, null, 2));
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message with Gemini' },
      { status: 500 }
    );
  }
}

