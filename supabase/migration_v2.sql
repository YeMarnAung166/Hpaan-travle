-- =============================================================
-- Hpa-An Travel v2: Database Migration
-- Run this in Supabase SQL Editor
-- =============================================================

-- 0.1: Add rating columns to destinations
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- 0.2: Add rating + detail columns to businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS price_range text,
  ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- 0.3: Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  title_my text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  content_my text NOT NULL DEFAULT '',
  image text,
  published boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- 0.4: Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  title_my text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  content_my text NOT NULL DEFAULT '',
  image text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 0.5: Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id bigint REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  check_in date,
  check_out date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 0.6: Rating trigger functions
CREATE OR REPLACE FUNCTION update_destination_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE destinations
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM destination_reviews WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id)),
      review_count = (SELECT COUNT(*) FROM destination_reviews WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id))
  WHERE id = COALESCE(NEW.destination_id, OLD.destination_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE businesses
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM business_reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)),
      review_count = (SELECT COUNT(*) FROM business_reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id))
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_destination_review_rating ON destination_reviews;
CREATE TRIGGER trg_destination_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON destination_reviews
  FOR EACH ROW EXECUTE FUNCTION update_destination_rating();

DROP TRIGGER IF EXISTS trg_business_review_rating ON business_reviews;
CREATE TRIGGER trg_business_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON business_reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- RLS policies (public read, authenticated write for bookings)
CREATE POLICY "Content pages are public" ON content_pages
  FOR SELECT USING (true);

CREATE POLICY "Blog posts are public" ON blog_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Seed initial content pages
INSERT INTO content_pages (slug, title, content) VALUES
  ('contact', 'Contact Us', 'Get in touch with us.'),
  ('privacy', 'Privacy Policy', 'Our privacy policy.'),
  ('terms', 'Terms of Service', 'Our terms of service.')
ON CONFLICT (slug) DO NOTHING;
