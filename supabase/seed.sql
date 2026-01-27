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

-- Insert test dispatches (ordered from newest to oldest)
INSERT INTO dispatches (
  id, region_id, submitter_id, client_id,
  location_lat, location_lon, location_description, location_precision,
  description, urgency, status, created_at
) VALUES
  -- Most recent (today, various times)
  ('dsp_test_001', '97201', 'usr_responder_001', 'client_001',
   45.512230, -122.658722, 'Pioneer Courthouse Square', 'exact',
   'Person appears distressed near fountain', 'normal', 'open',
   NOW() - INTERVAL '15 minutes'),
  
  ('dsp_test_002', '97209', 'usr_responder_001', 'client_002',
   45.520488, -122.677597, 'Powell''s City of Books', 'block',
   'Someone fell on stairs, appears injured', 'critical', 'acknowledged',
   NOW() - INTERVAL '45 minutes'),
  
  ('dsp_test_003', '80202', 'usr_responder_002', 'client_003',
   39.739236, -104.990251, 'Union Station', 'exact',
   'Elderly person needs assistance with luggage', 'low', 'open',
   NOW() - INTERVAL '1 hour 20 minutes'),
  
  ('dsp_test_004', '80203', 'usr_responder_002', 'client_004',
   39.754285, -104.996490, 'Coors Field area', 'neighborhood',
   'Large crowd gathering, someone collapsed', 'critical', 'escalated',
   NOW() - INTERVAL '2 hours 10 minutes'),
  
  ('dsp_test_005', '02108', 'usr_responder_003', 'client_005',
   42.360081, -71.058884, 'Boston Common', 'block',
   'Person sleeping on bench in cold weather', 'normal', 'open',
   NOW() - INTERVAL '3 hours 30 minutes'),

  -- Earlier today
  ('dsp_test_006', '97201', 'usr_responder_001', 'client_006',
   45.515230, -122.661722, 'SW 5th & Stark', 'exact',
   'Someone having a medical emergency', 'critical', 'open',
   NOW() - INTERVAL '4 hours 15 minutes'),
  
  ('dsp_test_007', '97201', 'usr_responder_001', 'client_007',
   45.517830, -122.663022, 'Transit Mall near Pioneer Square', 'block',
   'Lost child looking for parents', 'critical', 'acknowledged',
   NOW() - INTERVAL '5 hours 45 minutes'),
  
  ('dsp_test_008', '97209', 'usr_responder_001', 'client_008',
   45.523488, -122.680597, 'Pearl District near NW 10th', 'neighborhood',
   'Person asking for directions, seems confused', 'low', 'closed',
   NOW() - INTERVAL '7 hours'),
  
  ('dsp_test_009', '97214', 'usr_responder_001', 'client_009',
   45.516230, -122.651722, 'SE Belmont Street', 'block',
   'Bicycle accident, person down', 'critical', 'escalated',
   NOW() - INTERVAL '8 hours 30 minutes'),
  
  ('dsp_test_010', '97201', 'usr_responder_001', 'client_010',
   45.514530, -122.659922, 'SW Broadway & Morrison', 'exact',
   'Someone needs water and rest', 'low', 'open',
   NOW() - INTERVAL '10 hours'),
  
  -- Yesterday
  ('dsp_test_011', '80202', 'usr_responder_002', 'client_011',
   39.741236, -104.992251, '16th Street Mall', 'exact',
   'Person experiencing heat exhaustion', 'normal', 'open',
   NOW() - INTERVAL '1 day 2 hours'),
  
  ('dsp_test_012', '80203', 'usr_responder_002', 'client_012',
   39.756285, -104.994490, 'Near Capitol Building', 'block',
   'Elderly person fell, conscious but needs help', 'critical', 'acknowledged',
   NOW() - INTERVAL '1 day 4 hours'),
  
  ('dsp_test_013', '80205', 'usr_responder_002', 'client_013',
   39.762285, -104.989490, 'Five Points neighborhood', 'neighborhood',
   'Community wellness check needed', 'low', 'open',
   NOW() - INTERVAL '1 day 6 hours'),
  
  ('dsp_test_014', '80202', 'usr_responder_002', 'client_014',
   39.738236, -104.988251, 'LoDo district', 'block',
   'Person having panic attack', 'normal', 'acknowledged',
   NOW() - INTERVAL '1 day 8 hours'),
  
  ('dsp_test_015', '80203', 'usr_responder_002', 'client_015',
   39.753285, -104.997490, 'City Park area', 'exact',
   'Someone locked out of car with pet inside', 'normal', 'closed',
   NOW() - INTERVAL '1 day 12 hours'),
  
  ('dsp_test_016', '02108', 'usr_responder_003', 'client_016',
   42.358081, -71.056884, 'Government Center', 'exact',
   'Tourist needs medical attention', 'critical', 'escalated',
   NOW() - INTERVAL '1 day 14 hours'),
  
  ('dsp_test_017', '02116', 'usr_responder_003', 'client_017',
   42.349081, -71.075884, 'Back Bay near Copley', 'block',
   'Person asking for food assistance', 'low', 'open',
   NOW() - INTERVAL '1 day 18 hours'),
  
  ('dsp_test_018', '02215', 'usr_responder_003', 'client_018',
   42.346081, -71.100884, 'Fenway area', 'neighborhood',
   'Someone needs directions to shelter', 'low', 'closed',
   NOW() - INTERVAL '1 day 20 hours'),
  
  -- 2 days ago
  ('dsp_test_019', '02108', 'usr_responder_003', 'client_019',
   42.361081, -71.057884, 'Near TD Garden', 'block',
   'Person slipped on ice, possible injury', 'critical', 'acknowledged',
   NOW() - INTERVAL '2 days 1 hour'),
  
  ('dsp_test_020', '02116', 'usr_responder_003', 'client_020',
   42.350081, -71.076884, 'Newbury Street', 'exact',
   'Someone having difficulty breathing', 'critical', 'open',
   NOW() - INTERVAL '2 days 3 hours'),
  
  ('dsp_test_021', '97201', 'usr_responder_001', 'client_021',
   45.518230, -122.665722, 'Portland Art Museum area', 'block',
   'Person needs help carrying groceries', 'low', 'closed',
   NOW() - INTERVAL '2 days 5 hours'),
  
  ('dsp_test_022', '97209', 'usr_responder_001', 'client_022',
   45.525488, -122.682597, 'NW 23rd Avenue', 'exact',
   'Someone locked keys in car', 'low', 'open',
   NOW() - INTERVAL '2 days 8 hours'),
  
  ('dsp_test_023', '97214', 'usr_responder_001', 'client_023',
   45.518230, -122.648722, 'SE Hawthorne area', 'neighborhood',
   'Person experiencing homelessness needs resources', 'normal', 'open',
   NOW() - INTERVAL '2 days 10 hours'),
  
  ('dsp_test_024', '97201', 'usr_responder_001', 'client_024',
   45.513230, -122.660722, 'MAX station downtown', 'block',
   'Someone missed last train, stranded', 'low', 'acknowledged',
   NOW() - INTERVAL '2 days 14 hours'),
  
  ('dsp_test_025', '97209', 'usr_responder_001', 'client_025',
   45.524488, -122.679597, 'Pearl District park', 'exact',
   'Dog separated from owner', 'low', 'closed',
   NOW() - INTERVAL '2 days 16 hours'),
  
  -- 3 days ago
  ('dsp_test_026', '80202', 'usr_responder_002', 'client_026',
   39.740236, -104.991251, 'Larimer Square', 'exact',
   'Person having allergic reaction', 'critical', 'escalated',
   NOW() - INTERVAL '3 days 2 hours'),
  
  ('dsp_test_027', '80203', 'usr_responder_002', 'client_027',
   39.755285, -104.995490, 'State Capitol steps', 'block',
   'Someone experiencing mental health crisis', 'critical', 'acknowledged',
   NOW() - INTERVAL '3 days 4 hours'),
  
  ('dsp_test_028', '80205', 'usr_responder_002', 'client_028',
   39.763285, -104.987490, 'Curtis Park', 'neighborhood',
   'Child separated from group', 'critical', 'open',
   NOW() - INTERVAL '3 days 6 hours'),
  
  ('dsp_test_029', '80202', 'usr_responder_002', 'client_029',
   39.737236, -104.989251, 'REI flagship store area', 'block',
   'Hiker needs first aid supplies', 'normal', 'closed',
   NOW() - INTERVAL '3 days 10 hours'),
  
  ('dsp_test_030', '80203', 'usr_responder_002', 'client_030',
   39.752285, -104.998490, 'Cheesman Park', 'exact',
   'Person having seizure', 'critical', 'escalated',
   NOW() - INTERVAL '3 days 12 hours'),
  
  -- 4 days ago
  ('dsp_test_031', '02108', 'usr_responder_003', 'client_031',
   42.359081, -71.055884, 'Faneuil Hall area', 'exact',
   'Tourist fainted in crowd', 'critical', 'acknowledged',
   NOW() - INTERVAL '4 days 1 hour'),
  
  ('dsp_test_032', '02116', 'usr_responder_003', 'client_032',
   42.348081, -71.074884, 'Prudential Center', 'block',
   'Person needs help finding medication', 'normal', 'open',
   NOW() - INTERVAL '4 days 3 hours'),
  
  ('dsp_test_033', '02215', 'usr_responder_003', 'client_033',
   42.345081, -71.101884, 'Kenmore Square', 'neighborhood',
   'Someone experiencing chest pain', 'critical', 'escalated',
   NOW() - INTERVAL '4 days 7 hours'),
  
  ('dsp_test_034', '02108', 'usr_responder_003', 'client_034',
   42.362081, -71.059884, 'North End near Paul Revere House', 'block',
   'Elderly person needs escort across street', 'low', 'closed',
   NOW() - INTERVAL '4 days 9 hours'),
  
  ('dsp_test_035', '02116', 'usr_responder_003', 'client_035',
   42.351081, -71.077884, 'Symphony Hall area', 'exact',
   'Person locked out of hotel room', 'low', 'open',
   NOW() - INTERVAL '4 days 13 hours'),
  
  -- 5 days ago
  ('dsp_test_036', '97201', 'usr_responder_001', 'client_036',
   45.516230, -122.662722, 'Waterfront Park', 'exact',
   'Child with scraped knee, parent present', 'low', 'acknowledged',
   NOW() - INTERVAL '5 days 2 hours'),
  
  ('dsp_test_037', '80202', 'usr_responder_002', 'client_037',
   39.742236, -104.993251, 'Convention Center area', 'block',
   'Conference attendee feeling unwell', 'normal', 'open',
   NOW() - INTERVAL '5 days 5 hours'),
  
  ('dsp_test_038', '02108', 'usr_responder_003', 'client_038',
   42.357081, -71.054884, 'Quincy Market', 'exact',
   'Person having diabetic emergency', 'critical', 'escalated',
   NOW() - INTERVAL '5 days 8 hours'),
  
  ('dsp_test_039', '97209', 'usr_responder_001', 'client_039',
   45.526488, -122.683597, 'Forest Park trailhead', 'neighborhood',
   'Hiker twisted ankle on trail', 'normal', 'acknowledged',
   NOW() - INTERVAL '5 days 11 hours'),
  
  ('dsp_test_040', '80203', 'usr_responder_002', 'client_040',
   39.757285, -104.996490, 'Denver Zoo area', 'block',
   'Visitor experiencing heat stroke', 'critical', 'open',
   NOW() - INTERVAL '5 days 14 hours'),
  
  -- 6 days ago
  ('dsp_test_041', '02116', 'usr_responder_003', 'client_041',
   42.352081, -71.078884, 'Christian Science Plaza', 'exact',
   'Person needs wheelchair assistance', 'normal', 'closed',
   NOW() - INTERVAL '6 days 3 hours'),
  
  ('dsp_test_042', '97214', 'usr_responder_001', 'client_042',
   45.519230, -122.649722, 'Ladd''s Addition', 'neighborhood',
   'Cyclist with flat tire needs help', 'low', 'open',
   NOW() - INTERVAL '6 days 6 hours'),
  
  ('dsp_test_043', '80205', 'usr_responder_002', 'client_043',
   39.764285, -104.986490, 'RiNo Art District', 'block',
   'Person experiencing anxiety attack', 'normal', 'acknowledged',
   NOW() - INTERVAL '6 days 9 hours'),
  
  ('dsp_test_044', '02215', 'usr_responder_003', 'client_044',
   42.344081, -71.102884, 'BU Bridge area', 'exact',
   'Someone needs help changing flat tire', 'low', 'closed',
   NOW() - INTERVAL '6 days 12 hours'),
  
  ('dsp_test_045', '97201', 'usr_responder_001', 'client_045',
   45.519230, -122.664722, 'Portland State University', 'block',
   'Student having panic attack during exam', 'normal', 'open',
   NOW() - INTERVAL '6 days 15 hours'),
  
  -- 7 days ago
  ('dsp_test_046', '80202', 'usr_responder_002', 'client_046',
   39.743236, -104.994251, 'Civic Center Park', 'exact',
   'Person needs directions to shelter', 'low', 'acknowledged',
   NOW() - INTERVAL '7 days 4 hours'),
  
  ('dsp_test_047', '02108', 'usr_responder_003', 'client_047',
   42.363081, -71.060884, 'Old North Church area', 'neighborhood',
   'Tourist experiencing altitude sickness', 'normal', 'closed',
   NOW() - INTERVAL '7 days 8 hours'),
  
  ('dsp_test_048', '97209', 'usr_responder_001', 'client_048',
   45.527488, -122.684597, 'NW District apartments', 'block',
   'Person locked out, needs locksmith', 'low', 'open',
   NOW() - INTERVAL '7 days 11 hours'),
  
  ('dsp_test_049', '80203', 'usr_responder_002', 'client_049',
   39.758285, -104.999490, 'Museum of Nature & Science area', 'exact',
   'Child separated from school group', 'critical', 'escalated',
   NOW() - INTERVAL '7 days 14 hours'),
  
  ('dsp_test_050', '02116', 'usr_responder_003', 'client_050',
   42.353081, -71.079884, 'Boylston Street', 'block',
   'Marathon runner needs medical attention', 'critical', 'acknowledged',
   NOW() - INTERVAL '7 days 18 hours')
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
