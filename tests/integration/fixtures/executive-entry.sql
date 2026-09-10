-- Minimal relationship fixture, not a substitute for full migration/RLS QA.
CREATE ROLE entry_qa_reader NOLOGIN;
CREATE TABLE attractions (
  attraction_id bigint PRIMARY KEY, province_id bigint, district_id bigint, attraction_type_id bigint
);
CREATE TABLE visits (visit_id uuid PRIMARY KEY, created_at timestamptz NOT NULL);
CREATE TABLE certificates (
  certificate_id uuid PRIMARY KEY, visit_id uuid REFERENCES visits, generated_at timestamptz
);
CREATE TABLE satisfaction_surveys (
  survey_id uuid PRIMARY KEY, visit_id uuid REFERENCES visits, submitted_at timestamptz
);
-- Match 20260521120000_database_foundation_hardening.sql cardinalities.
CREATE UNIQUE INDEX uq_certificates_visit ON certificates(visit_id);
CREATE UNIQUE INDEX uq_satisfaction_surveys_visit ON satisfaction_surveys(visit_id);
CREATE TABLE checkin_entry_sessions (
  entry_session_id uuid PRIMARY KEY, attraction_id_snapshot bigint NOT NULL REFERENCES attractions,
  entry_channel text NOT NULL, evidence_scope text NOT NULL, visit_id uuid UNIQUE REFERENCES visits,
  created_at timestamptz NOT NULL
);
INSERT INTO attractions VALUES (4,1,11,2),(5,2,22,3);
INSERT INTO visits VALUES ('20000000-0000-4000-8000-000000000001','2026-08-01T01:00:00+07:00');
INSERT INTO certificates VALUES ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','2026-08-01T02:00:00+07:00');
INSERT INTO satisfaction_surveys VALUES ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','2026-08-01T03:00:00+07:00');
INSERT INTO checkin_entry_sessions
SELECT ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  CASE WHEN n<=4 THEN 4 ELSE 5 END, CASE WHEN n%2=0 THEN 'nfc' ELSE 'qr' END,
  'field_claim', CASE WHEN n=1 THEN '20000000-0000-4000-8000-000000000001'::uuid END,
  '2026-08-01T00:00:00+07:00'::timestamptz FROM generate_series(1,7) n;
INSERT INTO checkin_entry_sessions VALUES
('10000000-0000-4000-8000-000000000008',4,'qr','field_claim',NULL,'2026-08-01T23:59:59.999999+07:00'),
('10000000-0000-4000-8000-000000000009',4,'qr','field_claim',NULL,'2026-08-02T00:00:00+07:00');
GRANT USAGE ON SCHEMA public TO entry_qa_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO entry_qa_reader;
