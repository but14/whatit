-- ============================================
-- IT DICTIONARY DATABASE SCHEMA
-- ============================================
-- This file contains the complete database schema for the IT Dictionary project
-- Run this in Supabase SQL Editor to create all tables

-- ============================================
-- 1. PROFILES (User Public Information)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES (Core Categories Table)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CATEGORY TRANSLATIONS (i18n for Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS category_translations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL, -- 'vi', 'en'
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

-- ============================================
-- 4. TERMS (Core Terms Table)
-- ============================================
CREATE TABLE IF NOT EXISTS terms (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL UNIQUE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TERM TRANSLATIONS (i18n for Terms - Main Content)
-- ============================================
CREATE TABLE IF NOT EXISTS term_translations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL, -- 'vi', 'en'
  title TEXT NOT NULL,
  definition JSONB, -- Rich text content from editor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(term_id, language_code)
);

-- ============================================
-- 6. TERM CATEGORIES (Many-to-Many: Terms <-> Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS term_categories (
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (term_id, category_id)
);

-- ============================================
-- 7. RELATED TERMS (Many-to-Many: Terms <-> Terms)
-- ============================================
CREATE TABLE IF NOT EXISTS related_terms (
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  related_term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (term_id, related_term_id),
  CHECK (term_id <> related_term_id) -- Prevent self-reference
);

-- ============================================
-- 8. TERM MEDIA (Images/Videos for Terms)
-- ============================================
CREATE TABLE IF NOT EXISTS term_media (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video'
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. COMMENTS (User Comments on Terms)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. USER TERM FAVORITES (Many-to-Many: Users <-> Terms)
-- ============================================
CREATE TABLE IF NOT EXISTS user_term_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, term_id)
);

-- ============================================
-- 11. TERM SUGGESTIONS (User Reports/Suggestions)
-- ============================================
CREATE TABLE IF NOT EXISTS term_suggestions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  term_id BIGINT NOT NULL REFERENCES terms(id),
  language_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  suggestion_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_term_translations_term_id ON term_translations(term_id);
CREATE INDEX IF NOT EXISTS idx_term_translations_language ON term_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_term_translations_title ON term_translations USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_term_categories_term_id ON term_categories(term_id);
CREATE INDEX IF NOT EXISTS idx_term_categories_category_id ON term_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_related_terms_term_id ON related_terms(term_id);
CREATE INDEX IF NOT EXISTS idx_comments_term_id ON comments(term_id);
CREATE INDEX IF NOT EXISTS idx_terms_slug ON terms(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_suggestions ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Everyone can read)
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read category_translations" ON category_translations FOR SELECT USING (true);
CREATE POLICY "Public can read terms" ON terms FOR SELECT USING (true);
CREATE POLICY "Public can read term_translations" ON term_translations FOR SELECT USING (true);
CREATE POLICY "Public can read term_categories" ON term_categories FOR SELECT USING (true);
CREATE POLICY "Public can read related_terms" ON related_terms FOR SELECT USING (true);
CREATE POLICY "Public can read term_media" ON term_media FOR SELECT USING (true);
CREATE POLICY "Public can read comments" ON comments FOR SELECT USING (true);

-- AUTHENTICATED WRITE POLICIES (Only logged in users can write)
-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Comments: Authenticated users can insert, update own, delete own
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Favorites: Authenticated users can manage own favorites
CREATE POLICY "Users can manage own favorites" ON user_term_favorites FOR ALL USING (auth.uid() = user_id);

-- Suggestions: Authenticated users can insert, public can insert (anonymous)
CREATE POLICY "Anyone can insert suggestions" ON term_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own suggestions" ON term_suggestions FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ADMIN POLICIES (For admin operations, you'll use service_role key in API routes)
-- Note: Admin operations (CRUD for terms, categories) should be done via API routes
-- using service_role key, not through RLS policies for security.

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_term_translations_updated_at BEFORE UPDATE ON term_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

