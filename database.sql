-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campaign_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  campaign_id uuid,
  member_id uuid,
  channel text CHECK (channel = ANY (ARRAY['email'::text, 'sms'::text])),
  status text CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text])),
  error text,
  CONSTRAINT campaign_logs_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT campaign_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  event_date date,
  message_email text,
  message_sms text,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sending'::text, 'sent'::text, 'failed'::text])),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text,
  email text,
  phone text,
  message text,
  source_page text,
  handled boolean DEFAULT false,
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  city text,
  accept_privacy boolean NOT NULL DEFAULT false,
  accept_marketing boolean NOT NULL DEFAULT false,
  note text,
  source text DEFAULT 'membership_form'::text,
  birth_place text,
  fiscal_code text,
  document_front_url text,
  document_back_url text,
  CONSTRAINT members_pkey PRIMARY KEY (id)
);