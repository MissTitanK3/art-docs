-- Seed script for local Supabase development
-- This file is executed after all migrations during db reset
-- Sprint 0.5 Phase A Task 6

-- Insert test users (password: "password123" hashed with bcrypt)
-- bcrypt hash generated with: bcrypt.hash('password123', 10)
INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES
  ('usr_admin_001', 'admin@example.com', '$2a$10$rKxMQqAeug1BmbpLSvtjJONnHa9DK7Fwpfs73vYO/a8JikYWoKxcK', 'admin', '["97201", "97209", "80202", "80203", "02108", "02116"]'::jsonb),
  ('usr_responder_001', 'responder1@example.com', '$2a$10$rKxMQqAeug1BmbpLSvtjJONnHa9DK7Fwpfs73vYO/a8JikYWoKxcK', 'responder', '["97201", "97209", "97214"]'::jsonb),
  ('usr_responder_002', 'responder2@example.com', '$2a$10$rKxMQqAeug1BmbpLSvtjJONnHa9DK7Fwpfs73vYO/a8JikYWoKxcK', 'responder', '["80202", "80203", "80205"]'::jsonb),
  ('usr_responder_003', 'responder3@example.com', '$2a$10$rKxMQqAeug1BmbpLSvtjJONnHa9DK7Fwpfs73vYO/a8JikYWoKxcK', 'responder', '["02108", "02116", "02215"]'::jsonb),
  ('usr_viewer_001', 'viewer@example.com', '$2a$10$rKxMQqAeug1BmbpLSvtjJONnHa9DK7Fwpfs73vYO/a8JikYWoKxcK', 'viewer', '["97201", "97209", "80202", "80203", "02108", "02116"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert test dispatches
INSERT INTO dispatches (
  id, region_id, submitter_id, client_id,
  location_lat, location_lon, location_description, location_precision,
  description, urgency, status
) VALUES
  -- Portland, OR (97201 - Downtown)
  ('dsp_test_001', '97201', 'usr_responder_001', 'client_001',
   45.512230, -122.658722, 'Pioneer Courthouse Square', 'exact',
   'Person appears distressed near fountain', 'normal', 'open'),
  
  ('dsp_test_002', '97209', 'usr_responder_001', 'client_002',
   45.520488, -122.677597, 'Powell''s City of Books', 'block',
   'Someone fell on stairs, appears injured', 'critical', 'acknowledged'),
  
  -- Denver, CO (80202 - Downtown)
  ('dsp_test_003', '80202', 'usr_responder_002', 'client_003',
   39.739236, -104.990251, 'Union Station', 'exact',
   'Elderly person needs assistance with luggage', 'low', 'open'),
  
  ('dsp_test_004', '80203', 'usr_responder_002', 'client_004',
   39.754285, -104.996490, 'Coors Field area', 'neighborhood',
   'Large crowd gathering, someone collapsed', 'critical', 'escalated'),
  
  -- Boston, MA (02108 - Downtown)
  ('dsp_test_005', '02108', 'usr_responder_003', 'client_005',
   42.360081, -71.058884, 'Boston Common', 'block',
   'Person sleeping on bench in cold weather', 'normal', 'open')
ON CONFLICT (id) DO NOTHING;

-- Insert test responders
INSERT INTO responders (id, dispatch_id, responder_id, region_id, status) VALUES
  ('resp_test_001', 'dsp_test_002', 'usr_responder_001', '97209', 'responding'),
  ('resp_test_002', 'dsp_test_004', 'usr_responder_002', '80203', 'arrived')
ON CONFLICT (id) DO NOTHING;

-- Insert test audit log entries
INSERT INTO audit_log (
  dispatch_id, responder_entry_id, region_id, event_type, actor_id,
  before_state, after_state, changed_fields
) VALUES
  -- Dispatch created
  ('dsp_test_001', NULL, '97201', 'dispatch_created', 'usr_responder_001',
   NULL,
   '{"id": "dsp_test_001", "status": "open", "urgency": "normal"}'::jsonb,
   '["id", "status", "urgency"]'::jsonb),
  
  -- Responder joined
  ('dsp_test_002', 'resp_test_001', '97209', 'responder_joined', 'usr_responder_001',
   NULL,
   '{"id": "resp_test_001", "status": "responding"}'::jsonb,
   '["id", "status"]'::jsonb),
  
  -- Dispatch status updated
  ('dsp_test_002', NULL, '97209', 'dispatch_updated', NULL,
   '{"status": "open"}'::jsonb,
   '{"status": "acknowledged"}'::jsonb,
   '["status"]'::jsonb),
  
  -- Dispatch escalated
  ('dsp_test_004', NULL, '80203', 'dispatch_escalated', NULL,
   '{"status": "acknowledged"}'::jsonb,
   '{"status": "escalated"}'::jsonb,
   '["status"]'::jsonb);

-- Display seed data summary
DO $$
BEGIN
  RAISE NOTICE 'Seed data loaded successfully:';
  RAISE NOTICE '  - % users', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '  - % dispatches', (SELECT COUNT(*) FROM dispatches);
  RAISE NOTICE '  - % responders', (SELECT COUNT(*) FROM responders);
  RAISE NOTICE '  - % audit log entries', (SELECT COUNT(*) FROM audit_log);
END $$;
