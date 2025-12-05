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

## Step 4: Set Up Environment Variables

1. Create a file named `.env.local` in the root of your project (same directory as `package.json`)
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace `your_project_url_here` with your Project URL from Step 3
4. Replace `your_anon_key_here` with your anon/public key from Step 3

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Verify Setup

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

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Make sure the variable names start with `NEXT_PUBLIC_`
- Restart your dev server after creating/modifying `.env.local`

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

