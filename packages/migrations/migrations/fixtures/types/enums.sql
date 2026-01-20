-- Custom types and enums for the dispatch system

-- User roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('responder', 'admin', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dispatch status
DO $$ BEGIN
  CREATE TYPE dispatch_status AS ENUM (
    'open',
    'acknowledged',
    'dispatched',
    'arrived',
    'resolved',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dispatch urgency
DO $$ BEGIN
  CREATE TYPE dispatch_urgency AS ENUM ('low', 'normal', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Responder status
DO $$ BEGIN
  CREATE TYPE responder_status AS ENUM (
    'responding',
    'arrived',
    'assisting',
    'cleared'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Audit event types
DO $$ BEGIN
  CREATE TYPE audit_event_type AS ENUM (
    'dispatch_created',
    'dispatch_updated',
    'dispatch_closed',
    'dispatch_reopened',
    'dispatch_escalated',
    'responder_joined',
    'responder_status_updated',
    'location_updated',
    'urgency_updated',
    'description_updated'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
