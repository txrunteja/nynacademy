-- Faculty (8)
insert into faculty (id, name, phone, subjects) values
('11111111-1111-1111-1111-111111111001', 'Aarav Sharma', '9000000001', '{"Math","Physics"}'),
('11111111-1111-1111-1111-111111111002', 'Riya Verma', '9000000002', '{"Chemistry","Biology"}'),
('11111111-1111-1111-1111-111111111003', 'Neha Iyer', '9000000003', '{"English","Social Science"}'),
('11111111-1111-1111-1111-111111111004', 'Kabir Mehta', '9000000004', '{"Math","Computer Science"}'),
('11111111-1111-1111-1111-111111111005', 'Meera Nair', '9000000005', '{"Biology","Chemistry"}'),
('11111111-1111-1111-1111-111111111006', 'Dev Patel', '9000000006', '{"Physics","Math"}'),
('11111111-1111-1111-1111-111111111007', 'Ananya Rao', '9000000007', '{"English","Math"}'),
('11111111-1111-1111-1111-111111111008', 'Vikram Singh', '9000000008', '{"Computer Science","Physics"}')
on conflict (id) do nothing;

-- Students (17: 6 online, 11 offline)
insert into students (id, name, phone, mode, assigned_faculty_id, subjects) values
('22222222-2222-2222-2222-222222222001', 'Student 1', '9100000001', 'online', '11111111-1111-1111-1111-111111111001', '{"Math"}'),
('22222222-2222-2222-2222-222222222002', 'Student 2', '9100000002', 'online', '11111111-1111-1111-1111-111111111002', '{"Chemistry"}'),
('22222222-2222-2222-2222-222222222003', 'Student 3', '9100000003', 'online', '11111111-1111-1111-1111-111111111003', '{"English"}'),
('22222222-2222-2222-2222-222222222004', 'Student 4', '9100000004', 'online', '11111111-1111-1111-1111-111111111004', '{"Computer Science"}'),
('22222222-2222-2222-2222-222222222005', 'Student 5', '9100000005', 'online', '11111111-1111-1111-1111-111111111005', '{"Biology"}'),
('22222222-2222-2222-2222-222222222006', 'Student 6', '9100000006', 'online', '11111111-1111-1111-1111-111111111006', '{"Physics"}'),
('22222222-2222-2222-2222-222222222007', 'Student 7', '9100000007', 'offline', '11111111-1111-1111-1111-111111111001', '{"Math"}'),
('22222222-2222-2222-2222-222222222008', 'Student 8', '9100000008', 'offline', '11111111-1111-1111-1111-111111111002', '{"Chemistry"}'),
('22222222-2222-2222-2222-222222222009', 'Student 9', '9100000009', 'offline', '11111111-1111-1111-1111-111111111003', '{"English"}'),
('22222222-2222-2222-2222-222222222010', 'Student 10', '9100000010', 'offline', '11111111-1111-1111-1111-111111111004', '{"Computer Science"}'),
('22222222-2222-2222-2222-222222222011', 'Student 11', '9100000011', 'offline', '11111111-1111-1111-1111-111111111005', '{"Biology"}'),
('22222222-2222-2222-2222-222222222012', 'Student 12', '9100000012', 'offline', '11111111-1111-1111-1111-111111111006', '{"Physics"}'),
('22222222-2222-2222-2222-222222222013', 'Student 13', '9100000013', 'offline', '11111111-1111-1111-1111-111111111007', '{"English"}'),
('22222222-2222-2222-2222-222222222014', 'Student 14', '9100000014', 'offline', '11111111-1111-1111-1111-111111111008', '{"Computer Science"}'),
('22222222-2222-2222-2222-222222222015', 'Student 15', '9100000015', 'offline', '11111111-1111-1111-1111-111111111001', '{"Math"}'),
('22222222-2222-2222-2222-222222222016', 'Student 16', '9100000016', 'offline', '11111111-1111-1111-1111-111111111002', '{"Chemistry"}'),
('22222222-2222-2222-2222-222222222017', 'Student 17', '9100000017', 'offline', '11111111-1111-1111-1111-111111111003', '{"English"}')
on conflict (id) do nothing;

insert into batches (id, name, faculty_id, student_ids, subject) values
('33333333-3333-3333-3333-333333333001', 'Batch A', '11111111-1111-1111-1111-111111111001', '{"22222222-2222-2222-2222-222222222007","22222222-2222-2222-2222-222222222015"}', 'Math'),
('33333333-3333-3333-3333-333333333002', 'Batch B', '11111111-1111-1111-1111-111111111002', '{"22222222-2222-2222-2222-222222222008","22222222-2222-2222-2222-222222222016"}', 'Chemistry')
on conflict (id) do nothing;

insert into schedules (id, type, student_id, batch_id, faculty_id, subject, start_time, end_time, mode, recurrence, status, notes)
values
('44444444-4444-4444-4444-444444444001', 'individual', '22222222-2222-2222-2222-222222222001', null, '11111111-1111-1111-1111-111111111001', 'Math', now() + interval '1 hour', now() + interval '2 hours', 'online', 'once', 'scheduled', null),
('44444444-4444-4444-4444-444444444002', 'individual', '22222222-2222-2222-2222-222222222002', null, '11111111-1111-1111-1111-111111111002', 'Chemistry', now() + interval '3 hours', now() + interval '4 hours', 'online', 'once', 'scheduled', null),
('44444444-4444-4444-4444-444444444003', 'individual', '22222222-2222-2222-2222-222222222007', null, '11111111-1111-1111-1111-111111111001', 'Math', now() + interval '5 hours', now() + interval '6 hours', 'offline', 'weekly', 'scheduled', null),
('44444444-4444-4444-4444-444444444004', 'batch', null, '33333333-3333-3333-3333-333333333001', '11111111-1111-1111-1111-111111111001', 'Math', now() + interval '7 hours', now() + interval '8 hours', 'offline', 'weekly', 'scheduled', null),
('44444444-4444-4444-4444-444444444005', 'batch', null, '33333333-3333-3333-3333-333333333002', '11111111-1111-1111-1111-111111111002', 'Chemistry', now() + interval '9 hours', now() + interval '10 hours', 'offline', 'weekly', 'scheduled', null)
on conflict (id) do nothing;

insert into leads (name, phone, source, status, notes, follow_up_date) values
('Lead 1', '9200000001', 'justdial', 'new', 'Requested callback', current_date + 1),
('Lead 2', '9200000002', 'sulekha', 'contacted', 'Interested in Science classes', current_date + 2),
('Lead 3', '9200000003', 'other', 'converted', 'Joined batch A', null);

insert into social_posts (platform, content, scheduled_date, status) values
('Instagram', 'New batch starting this Monday. Enroll now!', current_date + 1, 'scheduled'),
('Facebook', 'Topper story of the month.', null, 'draft'),
('WhatsApp', 'Weekend revision workshop announcement.', current_date, 'posted');
