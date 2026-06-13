-- TenderZM schema

CREATE TABLE IF NOT EXISTS tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuing_body TEXT NOT NULL,       -- e.g. Ministry of Health, Zambia Revenue Authority
  category TEXT NOT NULL,           -- construction, IT, goods, consulting, services
  tender_number TEXT,
  description TEXT,
  closing_date DATE NOT NULL,
  published_date DATE DEFAULT CURRENT_DATE,
  value_zmw NUMERIC(14,2),          -- estimated value, optional
  location TEXT DEFAULT 'Lusaka',
  is_government BOOLEAN DEFAULT TRUE,
  contact_email TEXT,
  contact_phone TEXT,
  document_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tender_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  company_name TEXT,
  categories TEXT[],                -- categories they want alerts for
  subscription_tier TEXT DEFAULT 'free',   -- free, pro
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
