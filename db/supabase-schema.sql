-- Budgemon Database Schema for Supabase
-- This schema includes all tables needed for the Budgemon budgeting application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Extended user profile information (Supabase Auth provides auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- USER SETTINGS TABLE
-- User preferences and settings
-- ============================================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'English',
  silent_mode BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- COMPANIONS TABLE
-- Pet companion selection and game currency
-- ============================================================================
CREATE TABLE companions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  pet_type TEXT NOT NULL CHECK (pet_type IN ('lumi', 'luna')),
  game_currency INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- CARDS TABLE
-- User's payment/debit cards
-- ============================================================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_number TEXT,
  cardholder_name TEXT,
  balance DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- Financial transactions (income and expenses)
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Positive for income, negative for expenses
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN (
    'Food', 'Shopping', 'Transport', 'Bills', 
    'Entertainment', 'Savings', 'Subscription', 'Income', 'Other', 'General'
  )),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- SHOP ITEMS TABLE
-- Available items in the pet shop
-- ============================================================================
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  icon TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('head', 'face', 'eyes', 'body', 'hand')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- USER INVENTORY TABLE
-- Items owned by users (junction table)
-- ============================================================================
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, shop_item_id)
);

-- ============================================================================
-- EQUIPPED ITEMS TABLE
-- Currently equipped items for user's pet
-- ============================================================================
CREATE TABLE equipped_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  head_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  face_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  eyes_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  body_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  hand_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- CHAT MESSAGES TABLE
-- Messages between user and companion
-- ============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- FRIENDS TABLE
-- Friendship relationships for leaderboard
-- ============================================================================
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- ============================================================================
-- INDEXES for better query performance
-- ============================================================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_shop_items_category ON shop_items(category);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipped_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Settings: Users can manage their own settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Companions: Users can manage their own companion
CREATE POLICY "Users can manage their own companion"
  ON companions FOR ALL
  USING (auth.uid() = user_id);

-- Cards: Users can manage their own cards
CREATE POLICY "Users can manage their own cards"
  ON cards FOR ALL
  USING (auth.uid() = user_id);

-- Transactions: Users can manage their own transactions
CREATE POLICY "Users can manage their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);

-- Shop Items: Everyone can read, only admins can modify (adjust as needed)
CREATE POLICY "Anyone can view shop items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (true);

-- User Inventory: Users can manage their own inventory
CREATE POLICY "Users can manage their own inventory"
  ON user_inventory FOR ALL
  USING (auth.uid() = user_id);

-- Equipped Items: Users can manage their own equipped items
CREATE POLICY "Users can manage their own equipped items"
  ON equipped_items FOR ALL
  USING (auth.uid() = user_id);

-- Chat Messages: Users can manage their own messages
CREATE POLICY "Users can manage their own messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id);

-- Friends: Users can view their own friendships
CREATE POLICY "Users can view their own friendships"
  ON friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
  ON friends FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companions_updated_at BEFORE UPDATE ON companions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipped_items_updated_at BEFORE UPDATE ON equipped_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Generate username from email (part before @)
  default_username := SPLIT_PART(NEW.email, '@', 1);
  
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_username
  );
  
  -- Create default companion (lumi)
  INSERT INTO public.companions (user_id, pet_type, game_currency)
  VALUES (NEW.id, 'lumi', 0);
  
  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default Cash card
  INSERT INTO public.cards (user_id, name, balance, color)
  VALUES (NEW.id, 'Cash', 0, '#10B981');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INITIAL DATA (Optional - seed data)
-- ============================================================================

-- Insert default shop items
INSERT INTO shop_items (name, price, icon, category, description) VALUES
  ('Boba Tea', 6, '🧋', 'hand', 'A refreshing boba tea for your pet'),
  ('Beige Hat', 12, '🧢', 'head', 'A stylish beige hat'),
  ('Sunglasses', 15, '🕶️', 'eyes', 'Cool sunglasses for your pet'),
  ('Magic Wand', 25, '🪄', 'hand', 'A magical wand for your pet'),
  ('Bunny Ears', 18, '🐰', 'head', 'Cute bunny ears'),
  ('Cool Bag', 30, '👜', 'body', 'A fashionable bag'),
  ('Ribbon', 8, '🎀', 'head', 'A pretty ribbon'),
  ('Santa Hat', 12, '🎅', 'head', 'A festive Santa hat'),
  ('Mustache', 10, '👨', 'face', 'A stylish mustache'),
  ('Mexican Hat', 10, '🇲🇽', 'head', 'A traditional Mexican hat'),
  ('Fez Hat', 11, '🎩', 'head', 'A classic fez hat');

