# Avital Ak — אביטל אברמוב קונפינו

אתר קביעת תורים ופאנל ניהול לקליניקה של אביטל.  
**Stack:** Next.js 15 · Prisma · PostgreSQL (Supabase) · NextAuth · Tailwind CSS · Vercel

---

## הרצה מקומית (Local Setup)

### 1. התקנת תלויות

```bash
cd Avitalak
npm install
```

### 2. הגדרת מסד הנתונים — Supabase (חינמי)

1. צרי חשבון חינמי ב-[supabase.com](https://supabase.com)
2. צרי **New Project**
3. לכי ל-**Settings → Database → Connection string**
4. העתיקי את **Transaction pooler** URI → זה יהיה `DATABASE_URL`
5. העתיקי את **Direct connection** URI → זה יהיה `DIRECT_URL`

### 3. יצירת קובץ `.env`

```bash
cp .env.example .env
# ערכי את הערכים עם הנתונים מ-Supabase
```

```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@...supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="הפיקי עם: openssl rand -base64 32"
```

### 4. יצירת הטבלאות + מילוי נתוני ברירת מחדל

```bash
npx prisma db push        # יוצר את הטבלאות
npm run db:seed           # ממלא שירותים + משתמשת מנהלת
```

### 5. הרצה

```bash
npm run dev
# → http://localhost:3000
```

**כניסת מנהלת:**  
Email: `admin@avitalak.co.il`  
Password: `admin123` ← שניי מיד אחרי ההתקנה!

---

## פריסה (Deployment) — Vercel + Supabase

### Supabase (מסד נתונים)
אותם שלבים כמו בסעיף Local — השתמשי באותו project.

### Vercel (אחסון)
1. הקוד כבר ב-GitHub: `github.com/maorkonfino/Avitalak`
2. היכנסי ל-[vercel.com](https://vercel.com) והתחברי עם GitHub
3. לחצי **New Project** ובחרי `Avitalak`
4. הוסיפי Environment Variables:
   - `DATABASE_URL` — Transaction pooler URL מ-Supabase
   - `DIRECT_URL` — Direct connection URL מ-Supabase
   - `NEXTAUTH_URL` — הדומיין שלך (`https://avitalak.vercel.app` או הדומיין שלך)
   - `NEXTAUTH_SECRET` — מחרוזת רנדומלית
5. לחצי **Deploy** ✓

### דומיין מותאם אישית
לאחר הפריסה, הגדירי `avitalak.co.il` ב-Vercel:  
**Settings → Domains → Add domain**

---

## מבנה הפרויקט

```
app/
  page.tsx              ← דף הבית
  admin/
    page.tsx            ← פאנל ניהול ראשי (עם סטטיסטיקות)
    appointments/       ← ניהול תורים (אישור / ביטול / השלמה)
    calendar/           ← לוח שנה drag-and-drop
    services/           ← ניהול שירותים ומחירים
    users/              ← ניהול לקוחות
    waitlist/           ← רשימת המתנה
    settings/           ← תבניות אימייל
  dashboard/
    book/               ← קביעת תור (לקוחות)
    appointments/       ← התורים שלי
    profile/            ← פרופיל אישי
  courses/              ← דף קורסים
  api/                  ← API routes
prisma/
  schema.prisma         ← מודל מסד הנתונים
  seed.ts               ← 31 שירותים מהאתר הנוכחי
```

---

## ניהול שירותים

כל השירותים מנוהלים דרך **פאנל ניהול → ניהול שירותים**:
- הוספה / עריכה / מחיקה
- הפעלה / השבתה
- ימים וזמנים זמינים לכל שירות
