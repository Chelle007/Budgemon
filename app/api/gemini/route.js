import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Subscription', 'Income', 'Other', 'General'];

export async function POST(request) {
  try {
    const { message, cards = [], transactions = [], conversationHistory = [], petType = 'lumi' } = await request.json();

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

    // Build conversation history context (last 10 messages for context)
    const recentMessages = conversationHistory.slice(-10);
    const conversationContext = recentMessages.length > 0
      ? `Recent conversation history:\n${recentMessages.map(m => 
          `${m.sender === 'user' ? 'User' : 'Lumi'}: ${m.text}`
        ).join('\n')}\n`
      : '';

    const petPersonality = petType === 'luna' 
      ? 'You are Luna, a sassy and no-nonsense financial companion. You are direct, sometimes sarcastic, but ultimately care about the user\'s financial well-being. You use emojis sparingly and have a more serious tone.'
      : 'You are Lumi, a friendly and supportive financial companion. You are encouraging, positive, and use emojis frequently. You\'re always cheering the user on and being helpful.';

    const prompt = `${petPersonality} You ONLY help users with finance, budgeting, and money management topics. You do NOT answer questions about other topics.

${conversationContext}

Your tasks:
1. If the user is LOGGING a new transaction (expense or income), extract the details
2. If the user is ASKING a question about their spending/finances/card balances, provide a helpful answer using the data below
3. If the user asks about NON-FINANCE topics (science, history, math, coding, etc.), politely redirect them back to finance topics

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
  "queryResponse": string | null,  // for queries: your friendly, helpful response about their finances
  "transactionResponse": string | null  // for successful transactions: your friendly, personalized response confirming the transaction was saved. Match your personality (${petType === 'luna' ? 'sassy and direct' : 'friendly and encouraging'}). Keep it concise - 1-2 sentences max!
}

Rules:
1. For NEW transactions: set isTransaction=true, extract title/amount/category/type, and provide a personalized transactionResponse that confirms the transaction was recorded. Match your personality: ${petType === 'luna' ? 'Be sassy and direct, use fewer emojis' : 'Be friendly and encouraging, use emojis frequently'}. CRITICAL: transactionResponse MUST be 1-2 sentences max - keep it concise and to the point!
2. For QUESTIONS about finances (e.g., "how much did I spend on food?", "what was my last purchase?"): set isQuery=true, provide queryResponse
3. If asking about spending, calculate from the transaction history provided
4. Be friendly and encouraging in queryResponse - you're Lumi, a supportive companion!
5. If the message is just casual conversation (hi, hello, etc.), set isQuery=true and respond warmly
6. Categories: ${CATEGORIES.join(', ')}
7. IMPORTANT: If the user asks about non-finance topics (biology, astronomy, physics, history, coding, recipes, etc.), set isQuery=true and respond with something like "Sorry, I'm only able to answer finance-related questions! Feel free to ask me about your spending, savings, or budget! 😊"
8. CRITICAL - Card requirement: When the user is logging a NEW transaction, you MUST check if they EXPLICITLY mentioned which card/account to use. 
   - The "card" field should ONLY be set to a card name if the user EXPLICITLY mentioned it in their message (e.g., "coffee $5 on Visa", "bought groceries with my Chase card", "spent $20 using my Cash card")
   - DO NOT infer, assume, or default to any card (including "cash", "Cash", or any other card name)
   - Examples of what NOT to do:
     * User says "coffee $5" → DO NOT set card="Cash" or card="cash" → Instead: set isTransaction=false, isQuery=true, card=null, ask which card
     * User says "bought groceries $50" → DO NOT infer any card → Instead: set isTransaction=false, isQuery=true, card=null, ask which card
     * User says "salary $1000" → DO NOT assume cash → Instead: set isTransaction=false, isQuery=true, card=null, ask which card
   - If they DID explicitly specify a card: set isTransaction=true, extract all details including the card name (must match one from the cards list)
   - If they did NOT explicitly specify a card: set isTransaction=false, isQuery=true, and card=null. Provide a friendly queryResponse asking them which card they want to use. List the available cards from the cards list above. Example: "I'd be happy to record that transaction! Which card would you like to use? You have: [list cards]. Please let me know! 😊"
   - NEVER set card to "cash", "Cash", or any other value unless the user explicitly mentioned that exact card name in their message
9. Remember the conversation context - if the user is responding to a previous question you asked (like which card to use), use that context to understand their response. If they're providing a card name in response to your question, extract it and set isTransaction=true with the card specified

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

    // Validate card - only accept if it matches an actual card name AND was explicitly mentioned
    let validatedCard = null;
    if (parsedResponse.card) {
      const cardName = parsedResponse.card.trim();
      const matchedCard = cards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
      if (matchedCard) {
        // Additional check: if card is "Cash" (case-insensitive), verify user mentioned it
        const messageLower = message.toLowerCase();
        const cardNameLower = cardName.toLowerCase();
        const cashVariants = ['cash', 'cash card', 'using cash', 'with cash', 'on cash'];
        const hasCashMention = cashVariants.some(variant => messageLower.includes(variant));
        
        // If it's a cash card but user didn't mention cash, reject it (it was inferred)
        if (cardNameLower === 'cash' && !hasCashMention) {
          console.log(`Card "Cash" was inferred but not mentioned by user - rejecting`);
          validatedCard = null;
        } else {
          validatedCard = matchedCard.name;
        }
      } else {
        // Card was specified but doesn't match - treat as missing card
        console.log(`Card "${cardName}" specified but doesn't match any available cards`);
        validatedCard = null;
      }
    }

    const normalized = {
      isTransaction: parsedResponse.isTransaction === true || parsedResponse.isTransaction === 'true',
      isQuery: parsedResponse.isQuery === true || parsedResponse.isQuery === 'true',
      type: parsedResponse.type === 'expense' || parsedResponse.type === 'income' ? parsedResponse.type : null,
      title: parsedResponse.title || 'New Transaction',
      amount: parsedAmount,
      category: parsedResponse.category && CATEGORIES.includes(parsedResponse.category) ? parsedResponse.category : 'General',
      card: validatedCard,
      queryResponse: parsedResponse.queryResponse || null,
      transactionResponse: parsedResponse.transactionResponse || null,
    };

    // If transaction is detected but card is missing or invalid, force it to be a query
    if (normalized.isTransaction && !normalized.card && normalized.amount !== null) {
      console.log('Transaction detected but card missing - converting to query');
      normalized.isTransaction = false;
      normalized.isQuery = true;
      if (!normalized.queryResponse) {
        const cardNames = cards.map(c => c.name).join(', ');
        normalized.queryResponse = `I'd be happy to record that transaction! Which card would you like to use? You have: ${cardNames}. Please let me know! 😊`;
      }
    }

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

