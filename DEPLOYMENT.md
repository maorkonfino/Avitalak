# מדריך העלאה ל-Production

מדריך מפורט להעלאת הפרויקט ל-Vercel + Supabase

## חלק 1: הגדרת Supabase (Database)

### 1.1 יצירת פרויקט

1. לך ל-[Supabase](https://supabase.com) והתחבר
2. לחץ "New Project"
3. בחר ארגון או צור חדש
4. מלא פרטים:
   - **Project Name**: `avitalak-booking`
   - **Database Password**: שמור את הסיסמה! (תצטרך אותה)
   - **Region**: `Frankfurt (eu-central-1)` - הכי קרוב לישראל
5. לחץ "Create new project" והמתן ~2 דקות

### 1.2 קבלת Connection String

1. בפרויקט, לך ל-**Settings** → **Database**
2. גלול ל-**Connection string** → **URI**
3. לחץ על הכפתור **Copy** ליד Connection pooling
4. **חשוב**: החלף את `[YOUR-PASSWORD]` בסיסמה שבחרת!

דוגמה:
\`\`\`
postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
\`\`\`

שמור את ה-string הזה - תצטרך אותו ב-Vercel!

### 1.3 הגדרת Database Schema

אחרי ה-deployment הראשון ב-Vercel, תצטרך להריץ:

\`\`\`bash
# מהמחשב המקומי שלך
DATABASE_URL="your-supabase-connection-string" npx prisma db push
DATABASE_URL="your-supabase-connection-string" npx prisma db seed
\`\`\`

---

## חלק 2: העלאה ל-Vercel

### 2.1 התחברות והגדרה ראשונית

1. לך ל-[Vercel](https://vercel.com) והתחבר עם GitHub
2. לחץ **Add New...** → **Project**
3. ייבא את ה-repository שלך:
   - חפש את `avitalak-booking-system`
   - לחץ **Import**

### 2.2 הגדרות Build

Vercel אמור לזהות אוטומטית את ההגדרות האלה:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 2.3 הוספת Environment Variables

לחץ על **Environment Variables** והוסף:

#### 1. DATABASE_URL
```
postgresql://postgres.xxx:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
*(ה-connection string מ-Supabase!)*

#### 2. NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
*(תוכל לעדכן אחר כך לדומיין שלך)*

#### 3. NEXTAUTH_SECRET
יצור סיסמה חזקה:
```bash
openssl rand -base64 32
```
או השתמש ב-[Generator](https://generate-secret.vercel.app/32)

העתק את התוצאה והוסף כ-`NEXTAUTH_SECRET`

### 2.4 Deploy!

1. לחץ **Deploy** והמתן ~2-3 דקות
2. אחרי ה-deployment הראשון, עדכן את `NEXTAUTH_URL`:
   - לך ל-**Settings** → **Environment Variables**
   - ערוך את `NEXTAUTH_URL` ל-URL האמיתי שקיבלת
   - **Redeploy** את הפרויקט

### 2.5 הרצת Database Setup

אחרי ה-deployment הראשון:

\`\`\`bash
# מהמחשב המקומי
cd /Users/maorko/Development/avitalak-app

# הגדר את DATABASE_URL
export DATABASE_URL="your-supabase-connection-string"

# הרץ migrations
npx prisma generate
npx prisma db push

# מלא נתונים ראשוניים
npx prisma db seed
\`\`\`

זה יצור את כל הטבלאות ויוסיף:
- משתמש מנהל (admin@test.com / admin123)
- משתמש רגיל (user@test.com / user123)
- כל השירותים
- הגדרות מערכת

---

## חלק 3: הגדרת Domain מותאם אישית (אופציונלי)

### 3.1 קניית דומיין

אם יש לך דומיין (לדוגמה: avitalak.com):

1. ב-Vercel, לך ל-**Settings** → **Domains**
2. הוסף את הדומיין שלך
3. עקוב אחרי ההוראות לעדכון DNS
4. עדכן את `NEXTAUTH_URL` לדומיין החדש

---

## חלק 4: בדיקות לאחר ההעלאה

### ✅ רשימת בדיקות

- [ ] האתר פתוח ומוצג נכון
- [ ] ההתחברות עובדת (admin@test.com / admin123)
- [ ] אפשר לקבוע תור
- [ ] פאנל המנהל נגיש
- [ ] התמונות (לוגו, תמונות) נטענות
- [ ] כל השירותים מוצגים
- [ ] הלוח שנה עובד

### בדיקת Database

לך ל-[Supabase Dashboard](https://supabase.com/dashboard) → **Table Editor**
ובדוק שיש:
- Users (2 לפחות)
- Services (~15)
- Settings (1)

---

## טיפים ופתרון בעיות

### אם ה-build נכשל:

1. בדוק ב-Vercel Logs מה השגיאה
2. בעיות נפוצות:
   - `DATABASE_URL` לא מוגדר → הוסף ב-Environment Variables
   - `NEXTAUTH_SECRET` חסר → יצור והוסף
   - Prisma schema issues → הרץ `npx prisma generate` מקומית

### אם הדף לא נטען:

1. בדוק את ה-Console (F12) לשגיאות
2. וודא ש-`NEXTAUTH_URL` תואם ל-URL האמיתי
3. נסה לעשות **Redeploy** ב-Vercel

### Database connection errors:

1. וודא שה-password ב-`DATABASE_URL` נכון
2. בדוק שה-IP של Vercel מורשה ב-Supabase (בדרך כלל זה אוטומטי)
3. השתמש ב-**Connection pooling** URL מ-Supabase (לא Direct)

### Performance:

- Vercel מאכסן ב-Edge Network → מהיר מאוד
- Supabase Frankfurt → זמן תגובה טוב לישראל (~50ms)
- אם יש בעיות ביצועים, שקול Caching

---

## עדכונים עתידיים

כשיש שינויים בקוד:

\`\`\`bash
# מקומית
git add .
git commit -m "תיאור השינוי"
git push

# Vercel יעשה deploy אוטומטי!
\`\`\`

---

## תמיכה וקישורים

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

**בהצלחה! 🚀**

אם יש בעיות - פתח issue או שלח הודעה.


