# אביטל אברמוב קונפינו - מערכת ניהול תורים

אתר מתקדם לניהול תורים עבור טיפולי יופי - ציפורניים, גבות וריסים.

## תכונות

- 🔐 **מערכת משתמשים** - הרשמה, התחברות ותפקידים (משתמש/מנהל)
- 📅 **קביעת תורים חכמה** - מערכת קביעת תורים מתקדמת עם חסימת זמנים
- 📊 **פאנל ניהול** - לוח שנה, ניהול תורים, ניהול שירותים
- 📋 **רשימת המתנה** - הצטרפות לרשימת המתנה כשאין מקום פנוי
- 📧 **התראות אימייל** - תזכורות ועדכונים אוטומטיים
- 🎨 **עיצוב מודרני** - UI/UX מתקדם עם Tailwind CSS

## טכנולוגיות

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Authentication**: NextAuth.js
- **Calendar**: React Big Calendar
- **Deployment**: Vercel/Render

## התקנה מקומית

1. שכפל את הפרויקט:
\`\`\`bash
git clone <repository-url>
cd avitalak-app
\`\`\`

2. התקן תלויות:
\`\`\`bash
npm install
\`\`\`

3. הגדר משתני סביבה:
צור קובץ `.env.local` עם הערכים הבאים:
\`\`\`env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
\`\`\`

4. הגדר את הדאטאבייס:
\`\`\`bash
npx prisma generate
npx prisma db push
npx prisma db seed
\`\`\`

5. הרץ את השרת:
\`\`\`bash
npm run dev
\`\`\`

6. פתח בדפדפן: `http://localhost:3000`

## משתמשי ברירת מחדל

**מנהל:**
- אימייל: `admin@test.com`
- סיסמה: `admin123`

**משתמש רגיל:**
- אימייל: `user@test.com`
- סיסמה: `user123`

## פריסה ל-Production

### Vercel (מומלץ)

1. התחבר ל-[Vercel](https://vercel.com)
2. ייבא את הפרויקט מ-GitHub
3. הגדר משתני סביבה:
   - `DATABASE_URL` - חיבור ל-Supabase
   - `NEXTAUTH_URL` - כתובת האתר
   - `NEXTAUTH_SECRET` - מפתח סודי

4. לחץ Deploy!

### Supabase Database

1. צור פרויקט חדש ב-[Supabase](https://supabase.com)
2. העתק את ה-PostgreSQL connection string
3. עדכן את `DATABASE_URL` ב-Vercel
4. הרץ migrations:
\`\`\`bash
npx prisma migrate deploy
npx prisma db seed
\`\`\`

### Render

1. התחבר ל-[Render](https://render.com)
2. צור Web Service חדש
3. חבר את ה-GitHub repository
4. הגדר:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Environment Variables: הוסף את כל המשתנים

## מבנה הפרויקט

\`\`\`
avitalak-app/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes
│   ├── admin/             # פאנל מנהל
│   ├── dashboard/         # אזור אישי
│   └── page.tsx           # דף הבית
├── components/            # קומפוננטות React
│   └── ui/               # Shadcn UI components
├── lib/                   # Utilities ו-helpers
├── prisma/               # Database schema ו-seeds
│   ├── schema.prisma
│   └── seed.ts
├── public/               # קבצים סטטיים
└── package.json
\`\`\`

## סקריפטים

- `npm run dev` - הרצת שרת פיתוח
- `npm run build` - בנייה ל-production
- `npm start` - הרצת production build
- `npx prisma studio` - פתיחת Prisma Studio
- `npx prisma db seed` - הרצת seed למילוי נתוני בסיס

## רישיון

© 2024 אביטל אברמוב קונפינו. כל הזכויות שמורות.
