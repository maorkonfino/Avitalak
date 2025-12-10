-- הוסף שירותים
INSERT INTO "Service" (id, name, "nameEn", description, duration, price, category, icon, "availableDays", "startTime", "endTime", "createdAt", "updatedAt")
VALUES 
('service_' || gen_random_uuid()::text, 'מיקרובליידינג', 'Microblading', 'עיצוב וכתיבת גבות בשיטת המיקרובליידינג המתקדמת למראה טבעי ומושלם', 120, 1200, 'גבות', 'Sparkles', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'מילוי מיקרובליידינג', 'Microblading Touch-up', 'טיפול מילוי למיקרובליידינג קיים', 90, 600, 'גבות', 'Sparkles', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'הרמת גבות', 'Brow Lift', 'טיפול הרמת גבות למראה מושלם ומעוצב', 60, 150, 'גבות', 'ArrowUp', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'הרמת ריסים', 'Lash Lift', 'טיפול הרמת ריסים טבעיים למראה פתוח ומרשים', 60, 150, 'ריסים', 'Eye', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'הרמת גבות + ריסים', 'Brow & Lash Lift', 'חבילה משולבת של הרמת גבות וריסים', 90, 250, 'חבילות', 'Package', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'בניית ציפורניים - ג''ל', 'Gel Nail Building', 'בניית ציפורניים משקמת עם לק ג''ל מבנה אנטומי', 90, 180, 'ציפורניים', 'Hand', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'מילוי ג''ל', 'Gel Fill', 'מילוי לבניית ציפורניים קיימת', 75, 150, 'ציפורניים', 'Hand', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'חבילת מיקרובליידינג ומילוי', 'Microblading Package', 'מיקרובליידינג + טיפול מילוי אחד (חיסכון של 200 ש"ח)', 240, 1600, 'חבילות', 'Package', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW()),
('service_' || gen_random_uuid()::text, 'חבילת הרמות מלאה', 'Full Lift Package', '3 טיפולי הרמת גבות + ריסים (חיסכון של 150 ש"ח)', 90, 600, 'חבילות', 'Package', '0,1,2,3,4', '09:00', '18:00', NOW(), NOW());

