# Supabase Setup Guide

This guide will help you connect your Budgemon app to Supabase.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `budgemon` (or any name you prefer)
   - Database Password: (create a strong password and save it)
   - Region: Choose the closest region to your users
5. Click "Create new project" and wait for it to be set up

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Open the file `db/supabase-schema.sql` from this project
3. Copy all the SQL code and paste it into the SQL Editor
4. Click "Run" to execute the schema
5. You should see success messages for all tables, policies, and triggers

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 4: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you'll need it in the next step)

## Step 5: Set Up Environment Variables

1. Create a file named `.env.local` in the root of your project (same directory as `package.json`)
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Replace `your_project_url_here` with your Project URL from Step 3
4. Replace `your_anon_key_here` with your anon/public key from Step 3
5. Replace `your_gemini_api_key_here` with your Gemini API key from Step 4

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

## Step 6: Verify Setup

1. Make sure your `.env.local` file is in the root directory
2. Restart your Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your app and try to sign up with a new account
4. You should be able to create an account and log in

## Features Now Connected to Supabase

✅ User authentication (sign up, log in, password reset)  
✅ User profiles  
✅ Pet companion selection  
✅ Game currency  
✅ Transactions (income and expenses)  
✅ Payment cards  
✅ Shop inventory and equipped items  
✅ Chat messages with companion  
✅ AI-powered transaction parsing with Gemini  

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Make sure the variable names start with `NEXT_PUBLIC_` for client-side variables
- Restart your dev server after creating/modifying `.env.local`

### "Gemini API key not configured" error
- Make sure `GEMINI_API_KEY` is set in your `.env.local` file
- The Gemini API key does NOT need `NEXT_PUBLIC_` prefix (it's server-side only)
- Restart your dev server after adding the key

### Authentication not working
- Check that Row Level Security (RLS) policies were created (they're in the schema)
- Verify your API keys are correct
- Check the browser console for error messages

### Database errors
- Make sure you ran the complete schema SQL
- Check the Supabase dashboard → Database → Tables to verify all tables exist
- Check Supabase dashboard → Database → Logs for any error messages

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `anon` key is safe to use in client-side code (it's designed for that)
- All data access is protected by Row Level Security (RLS) policies

## Next Steps

After setup, you can:
- Customize user profile fields
- Add more shop items in the Supabase dashboard
- View and manage user data in Supabase dashboard → Table Editor
- Set up email templates for authentication in Supabase Settings → Auth

