-- ============================================================================
-- WealthFlow AI — Stage 2 Schema
-- Multi-tenant SaaS schema for a lead-gen / CRM / workflow platform.
-- Idempotent: every object is created with CREATE ... IF NOT EXISTS and each
-- column addition guards on NOT EXISTS, so this file can be re-applied safely.
--
-- Responsible-AI note: this is a marketing / lead-management / CRM tool. It
-- stores no investment advice, no securities recommendations, no return
-- promises, and no inferred net-worth / assets / income of prospects. Any
-- financial content is educational only. Leads carry explicit consent /
-- do-not-contact / unsubscribed flags so outreach can always be stopped.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Pipeline statuses (shared). Mirrors the Kanban/table CRM pipeline.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'NEW', 'CONTACTED', 'REPLIED', 'QUALIFIED', 'MEETING_BOOKED',
      'MEETING_COMPLETED', 'CLIENT', 'NURTURE', 'LOST', 'DO_NOT_CONTACT'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  website     text,
  firm_type   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Users (global; org membership through team_members)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text,
  name          text NOT NULL,
  google_id     text UNIQUE,
  role          user_role NOT NULL DEFAULT 'member',
  email_verified boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Team membership (org isolation the primary axis)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'member',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_org  ON team_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members (user_id);

-- ---------------------------------------------------------------------------
-- Ideal Client Profile (one per org, the configured ICP)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ideal_client_profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  -- The 10 ICP onboarding fields (Stage 3 wizard persists here)
  target_location  text,
  target_industry  text,
  revenue_range    text,
  employee_range   text,
  titles           text,
  avg_portfolio    text,
  firm_type        text,
  pain_points      text,
  buying_signals   text,
  objections       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Stage 3: ICP onboarding wizard fields (idempotent additions).
-- Business/professional criteria only — no sensitive personal financial data
-- is required as an ICP precondition (see Responsible-AI note at top).
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS target_client_type text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS min_client_profile text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS services text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS calendar_url text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS email_account text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS outreach_tone text;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS followup_cadence_days integer NOT NULL DEFAULT 2;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS daily_send_limit integer NOT NULL DEFAULT 20;
ALTER TABLE ideal_client_profiles ADD COLUMN IF NOT EXISTS auto_followups boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- Lead sources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  kind            text NOT NULL DEFAULT 'manual',
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- ---------------------------------------------------------------------------
-- Leads (the CRM pipeline records) — multi-tenant on organization_id
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  company         text,
  email           text,
  phone           text,
  source          text,
  lead_score      integer NOT NULL DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  status          lead_status NOT NULL DEFAULT 'NEW',
  owner           uuid REFERENCES users(id) ON DELETE SET NULL,
  last_contact    timestamptz,
  next_action     text,
  notes           text,
  tags            text[] NOT NULL DEFAULT '{}',
  -- Consent / compliance flags (must be honoured by every outbound flow)
  consent_ok       boolean NOT NULL DEFAULT false,
  do_not_contact   boolean NOT NULL DEFAULT false,
  unsubscribed     boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_org       ON leads (organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status    ON leads (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_score     ON leads (organization_id, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email     ON leads (organization_id, email);
CREATE INDEX IF NOT EXISTS idx_leads_owner     ON leads (organization_id, owner);
CREATE INDEX IF NOT EXISTS idx_leads_dnc       ON leads (organization_id) WHERE do_not_contact OR unsubscribed;

-- ---------------------------------------------------------------------------
-- Lead scores (0-100 with component breakdown + human-readable explanation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_scores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score             integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  icp_fit           integer CHECK (icp_fit BETWEEN 0 AND 100),
  engagement        integer CHECK (engagement BETWEEN 0 AND 100),
  business_relevance integer CHECK (business_relevance BETWEEN 0 AND 100),
  intent_signals    integer CHECK (intent_signals BETWEEN 0 AND 100),
  data_confidence   integer CHECK (data_confidence BETWEEN 0 AND 100),
  explanation       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead ON lead_scores (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_org  ON lead_scores (organization_id);

-- ---------------------------------------------------------------------------
-- Prospects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prospects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  company         text,
  email           text,
  phone           text,
  title           text,
  linkedin_url    text,
  do_not_contact  boolean NOT NULL DEFAULT false,
  consent_ok      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prospects_org ON prospects (organization_id);

-- ---------------------------------------------------------------------------
-- Campaigns + steps (outbound sequences; human approval required before send)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','review','approved','active','paused','completed')),
  created_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns (organization_id);

CREATE TABLE IF NOT EXISTS campaign_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_order      integer NOT NULL DEFAULT 1,
  kind            text NOT NULL DEFAULT 'email' CHECK (kind IN ('email','task','wait')),
  subject         text,
  body            text,
  delay_days      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_steps_org    ON campaign_steps (organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_steps_camp   ON campaign_steps (campaign_id);

-- ---------------------------------------------------------------------------
-- Emails (outbound messages) + replies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emails (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id     uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  from_user       uuid REFERENCES users(id) ON DELETE SET NULL,
  to_address      text NOT NULL,
  subject         text,
  body            text,
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','pending_approval','approved','sent','failed','unsubscribed')),
  sent_at         timestamptz,
  -- Compliance: sent emails always carry an unsubscribe/opt-out mechanism
  unsubscribed    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emails_org  ON emails (organization_id);
CREATE INDEX IF NOT EXISTS idx_emails_lead ON emails (organization_id, lead_id);

CREATE TABLE IF NOT EXISTS email_replies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_id        uuid NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  from_address    text NOT NULL,
  subject         text,
  body            text,
  -- Classified reply type; negative/opt-out/stop honoured immediately
  classification  text NOT NULL DEFAULT 'unknown'
                  CHECK (classification IN ('unknown','question','unsubscribed','out_of_office','negative','positive','other')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_replies_org  ON email_replies (organization_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_email ON email_replies (email_id);

-- ---------------------------------------------------------------------------
-- Lead activities (timeline / audit of every touch)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  type            text NOT NULL,
  summary         text,
  meta            jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_activities_org  ON lead_activities (organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities (organization_id, lead_id);

-- ---------------------------------------------------------------------------
-- Funnels + form submissions + quiz responses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funnels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  kind            text NOT NULL DEFAULT 'lead_magnet',
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_funnels_org ON funnels (organization_id);

CREATE TABLE IF NOT EXISTS form_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  funnel_id       uuid REFERENCES funnels(id) ON DELETE SET NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  name            text,
  email           text,
  phone           text,
  data            jsonb NOT NULL DEFAULT '{}',
  consent_ok      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_form_submissions_org ON form_submissions (organization_id);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id         uuid REFERENCES form_submissions(id) ON DELETE SET NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  quiz_name       text,
  answers         jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_org ON quiz_responses (organization_id);

-- ---------------------------------------------------------------------------
-- Appointments / bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  calendar_link   text,
  status          text NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments (organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments (organization_id, lead_id);

-- ---------------------------------------------------------------------------
-- Clients + notes + tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  name            text NOT NULL,
  email           text,
  phone           text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients (organization_id);

CREATE TABLE IF NOT EXISTS notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE,
  author_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  body            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_org  ON notes (organization_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead ON notes (organization_id, lead_id);

CREATE TABLE IF NOT EXISTS tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  assignee_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text,
  due_at          timestamptz,
  completed       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_org     ON tasks (organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (organization_id, assignee_id);

-- ---------------------------------------------------------------------------
-- Subscriptions + usage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan             text NOT NULL DEFAULT 'starter'
                   CHECK (plan IN ('starter','growth','pro','enterprise')),
  status           text NOT NULL DEFAULT 'trialing'
                   CHECK (status IN ('trialing','active','past_due','canceled','incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  month           date NOT NULL,
  metric          text NOT NULL,
  value           bigint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, month, metric)
);
CREATE INDEX IF NOT EXISTS idx_usage_org ON usage (organization_id);

-- ---------------------------------------------------------------------------
-- Audit logs (security / compliance trail) — append-only in practice
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  action          text NOT NULL,
  ip              text,
  user_agent      text,
  meta            jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org  ON audit_logs (organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);

-- ---------------------------------------------------------------------------
-- Stage 5: Clerk identity mapping (auth is handled by Clerk; Postgres remains
-- the source of truth for users, organizations and org-scoped data).
--   * users.clerk_id is the Clerk user id ("user_xxx") — the join key used to
--     resolve a Clerk session into OUR user row on every server request.
--   * password_hash stays for legacy rows only (Clerk owns credentials now),
--     so it must be nullable and is never written by the app.
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- Password reset tokens (clear-text token never stored; only its hash is kept)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reset_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      text NOT NULL,
  expires_at      timestamptz NOT NULL,
  used            boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user  ON reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash  ON reset_tokens (token_hash);
