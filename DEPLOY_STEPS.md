# 🚀 מדריך Deploy מהיר

## שלב 1️⃣: Supabase (Database)

### צעדים:
1. לך ל-https://supabase.com
2. התחבר עם GitHub
3. לחץ "New project"
4. מלא:
   - Name: `avitalak-booking`
   - Password: בחר סיסמה חזקה (שמור!)
   - Region: `Frankfurt (eu-central-1)`
   - Plan: `Free`
5. לחץ "Create new project"
6. המתן ~2 דקות
7. לך ל: Settings ⚙️ → Database → Connection string
8. גלול ל-"Connection Pooling"
9. העתק את ה-URI
10. החלף `[YOUR-PASSWORD]` בסיסמה שבחרת
11. שמור את ה-Connection String הזה!

---

## שלב 2️⃣: Vercel (Deploy)

### צעדים:
1. לך ל-https://vercel.com
2. התחבר עם GitHub
3. לחץ "Add New..." → "Project"
4. חפש את `avitalak-booking-system`
5. לחץ "Import"
6. לחץ על "Environment Variables"
7. הוסף 3 משתנים:

**DATABASE_URL**
```
[הדבק את ה-Connection String מ-Supabase]
```

**NEXTAUTH_URL**
```
https://your-project-name.vercel.app
```
(תעדכן אחר כך לדומיין האמיתי!)

**NEXTAUTH_SECRET**
הרץ בטרמינל:
```bash
openssl rand -base64 32
```
והדבק את התוצאה

8. לחץ "Deploy" והמתן ~3 דקות
9. שמור את ה-URL שקיבלת!
10. חזור ל-Settings → Environment Variables
11. ערוך את `NEXTAUTH_URL` ל-URL האמיתי
12. לחץ "Redeploy"

---

## שלב 3️⃣: Database Setup

### מהטרמינל שלך:

```bash
# הגדר את DATABASE_URL
export DATABASE_URL="[הדבק את ה-Connection String מ-Supabase]"

# הרץ migrations
npx prisma generate
npx prisma db push

# מלא נתונים ראשוניים
npx prisma db seed
```

---

## ✅ בדיקות

- [ ] האתר פתוח ועובד
- [ ] ניתן להתחבר (admin@test.com / admin123)
- [ ] ניתן לקבוע תור
- [ ] פאנל מנהל נגיש
- [ ] התמונות נטענות

---

## 🆘 בעיות?

### Build נכשל ב-Vercel:
- בדוק ש-`DATABASE_URL` מוגדר
- בדוק ש-`NEXTAUTH_SECRET` קיים

### Database connection error:
- וודא שהסיסמה ב-`DATABASE_URL` נכונה
- השתמש ב-"Connection Pooling" ולא "Direct"

### עמוד לא נטען:
- וודא ש-`NEXTAUTH_URL` תואם ל-URL האמיתי
- עשה Redeploy

---

**בהצלחה! 🎉**
