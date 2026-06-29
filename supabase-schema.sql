-- Content Pages (for Travel Tips, History, Privacy, Terms, Contact)
CREATE SEQUENCE IF NOT EXISTS content_pages_id_seq;

CREATE TABLE IF NOT EXISTS public.content_pages (
  id bigint NOT NULL DEFAULT nextval('content_pages_id_seq'::regclass),
  slug text NOT NULL UNIQUE,
  title text,
  title_my text,
  content text,
  content_my text,
  image text,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT content_pages_pkey PRIMARY KEY (id)
);

ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Blog Posts
CREATE SEQUENCE IF NOT EXISTS blog_posts_id_seq;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id bigint NOT NULL DEFAULT nextval('blog_posts_id_seq'::regclass),
  slug text NOT NULL UNIQUE,
  title text,
  title_my text,
  excerpt text,
  excerpt_my text,
  content text,
  content_my text,
  image text,
  author text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS: public can read published rows
CREATE POLICY "Public can read published content_pages"
  ON public.content_pages FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read published blog_posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- RLS: admins (via admin_users table) get full access
CREATE POLICY "Admins can manage content_pages"
  ON public.content_pages FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Admins can manage blog_posts"
  ON public.blog_posts FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Auto-update updated_at trigger (reuses the function if not yet created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_content_pages_updated_at'
  ) THEN
    CREATE TRIGGER set_content_pages_updated_at
      BEFORE UPDATE ON public.content_pages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER set_blog_posts_updated_at
      BEFORE UPDATE ON public.blog_posts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
