-- seed-dev.sql
-- Development seed data (DO NOT RUN IN PRODUCTION)

-- Create test users
INSERT INTO users (id, email, password_hash, role, allowed_regions, is_active)
VALUES
  ('usr_admin_001', 'admin@dispatch.local', '$2b$10$example_hash_admin', 'admin', '["us-west-1", "us-east-1"]'::jsonb, true),
  ('usr_resp_001', 'responder1@dispatch.local', '$2b$10$example_hash_resp1', 'responder', '["us-west-1"]'::jsonb, true),
  ('usr_resp_002', 'responder2@dispatch.local', '$2b$10$example_hash_resp2', 'responder', '["us-west-1"]'::jsonb, true),
  ('usr_viewer_001', 'viewer@dispatch.local', '$2b$10$example_hash_viewer', 'viewer', '["us-west-1"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Create test dispatches
INSERT INTO dispatches (
  id, client_id, region_id, submitter_id,
  location_lat, location_lon, location_description,
  description, urgency, status
)
VALUES
  (
    'dsp_test_001',
    'client_' || gen_random_uuid(),
    'us-west-1',
    'usr_resp_001',
    37.7749,
    -122.4194,
    'Downtown San Francisco',
    'Test dispatch - medical emergency',
    'high',
    'open'
  ),
  (
    'dsp_test_002',
    'client_' || gen_random_uuid(),
    'us-west-1',
    'usr_resp_001',
    37.7849,
    -122.4094,
    'Financial District',
    'Test dispatch - fire alarm',
    'normal',
    'acknowledged'
  )
ON CONFLICT (id) DO NOTHING;

-- Create test responder assignments
INSERT INTO responders (id, dispatch_id, responder_id, status)
VALUES
  ('resp_test_001', 'dsp_test_001', 'usr_resp_002', 'responding'),
  ('resp_test_002', 'dsp_test_002', 'usr_resp_001', 'arrived')
ON CONFLICT (id) DO NOTHING;

-- Create audit log entries
INSERT INTO audit_log (
  dispatch_id, region_id, event_type, actor_id,
  before_state, after_state
)
VALUES
  (
    'dsp_test_001',
    'us-west-1',
    'dispatch_created',
    'usr_resp_001',
    NULL,
    '{"status": "open", "urgency": "high"}'::jsonb
  ),
  (
    'dsp_test_002',
    'us-west-1',
    'dispatch_created',
    'usr_resp_001',
    NULL,
    '{"status": "open", "urgency": "normal"}'::jsonb
  ),
  (
    'dsp_test_002',
    'us-west-1',
    'dispatch_updated',
    'usr_resp_001',
    '{"status": "open"}'::jsonb,
    '{"status": "acknowledged"}'::jsonb
  )
;

-- Display summary
SELECT 'Seed data inserted successfully!' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS dispatch_count FROM dispatches;
SELECT COUNT(*) AS responder_count FROM responders;
SELECT COUNT(*) AS audit_entry_count FROM audit_log;
