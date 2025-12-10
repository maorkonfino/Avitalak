-- בדוק כמה שירותים יש
SELECT COUNT(*) as total_services FROM "Service";

-- הצג את כל השירותים
SELECT id, name, price, category, active FROM "Service" ORDER BY category, name;

