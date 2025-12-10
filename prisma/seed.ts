import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@avitalak.co.il' },
    update: {},
    create: {
      email: 'admin@avitalak.co.il',
      name: 'אביטל אברמוב קונפינו',
      phone: '054-6714655',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'לקוחה לדוגמה',
      phone: '050-1234567',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('✅ Test user created:', user.email)

  // Services with icons and availability
  const services = [
    // גבות
    {
      name: 'מיקרובליידינג גבות',
      nameEn: 'Microblading',
      description: 'טכניקת שיער לשיער לגבות טבעיות וממולאות',
      duration: 120,
      price: 1200,
      category: 'גבות',
      icon: 'Eye',
      availableDays: '0,1,2,3,4', // ראשון-חמישי
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      name: 'פאודר גבות',
      nameEn: 'Powder Brows',
      description: 'גבות מושלמות עם אפקט איפור עדין',
      duration: 90,
      price: 1000,
      category: 'גבות',
      icon: 'Eye',
      availableDays: '0,1,2,3,4',
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      name: 'הרמת גבות',
      nameEn: 'Brow Lamination',
      description: 'החלקה וסידור גבות לאפקט מושלם',
      duration: 45,
      price: 150,
      category: 'גבות',
      icon: 'Eye',
      availableDays: '0,1,2,3,4,5', // ראשון-שישי
      startTime: '09:00',
      endTime: '18:00',
    },
    {
      name: 'צביעת גבות',
      nameEn: 'Brow Tinting',
      description: 'צביעה מקצועית לגבות מושלמות',
      duration: 30,
      price: 80,
      category: 'גבות',
      icon: 'Eye',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '19:00',
    },
    {
      name: 'סידור גבות',
      nameEn: 'Brow Shaping',
      description: 'עיצוב וסידור גבות בשעווה או פינצטה',
      duration: 20,
      price: 60,
      category: 'גבות',
      icon: 'Eye',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '19:00',
    },

    // ריסים
    {
      name: 'הרמת ריסים',
      nameEn: 'Lash Lift',
      description: 'הרמה וסלסול לריסים טבעיים ויפים',
      duration: 60,
      price: 200,
      category: 'ריסים',
      icon: 'Eye',
      availableDays: '0,1,2,3,4',
      startTime: '09:00',
      endTime: '18:00',
    },
    {
      name: 'הדבקת ריסים',
      nameEn: 'Lash Extensions',
      description: 'ריסים מלאכותיים לנפח מקסימלי',
      duration: 120,
      price: 350,
      category: 'ריסים',
      icon: 'Eye',
      availableDays: '0,1,2,3,4',
      startTime: '09:00',
      endTime: '16:00',
    },
    {
      name: 'מילוי ריסים',
      nameEn: 'Lash Refill',
      description: 'מילוי והשלמת ריסים קיימים',
      duration: 90,
      price: 250,
      category: 'ריסים',
      icon: 'Eye',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '18:00',
    },

    // ציפורניים
    {
      name: 'בניית ציפורניים בג׳ל',
      nameEn: 'Gel Nail Extensions',
      description: 'בניית ציפורניים באורך רצוי בג׳ל איכותי',
      duration: 120,
      price: 250,
      category: 'ציפורניים',
      icon: 'Hand',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '19:00',
    },
    {
      name: 'לק ג׳ל טבעי',
      nameEn: 'Natural Gel Polish',
      description: 'לק ג׳ל על ציפורן טבעית',
      duration: 60,
      price: 120,
      category: 'ציפורניים',
      icon: 'Hand',
      availableDays: '0,1,2,3,4,5,6', // כל השבוע
      startTime: '09:00',
      endTime: '20:00',
    },
    {
      name: 'מניקור רוסי',
      nameEn: 'Russian Manicure',
      description: 'מניקור יבש מקצועי עם קיוטיקל נקי',
      duration: 90,
      price: 150,
      category: 'ציפורניים',
      icon: 'Hand',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '19:00',
    },
    {
      name: 'הסרת בניה',
      nameEn: 'Gel Removal',
      description: 'הסרת בניית ציפורניים קודמת',
      duration: 30,
      price: 50,
      category: 'ציפורניים',
      icon: 'Hand',
      availableDays: '0,1,2,3,4,5,6',
      startTime: '09:00',
      endTime: '20:00',
    },

    // חבילות
    {
      name: 'חבילת גבות וריסים',
      nameEn: 'Brows & Lashes Package',
      description: 'הרמת גבות + הרמת ריסים במחיר מיוחד',
      duration: 120,
      price: 320,
      category: 'חבילות',
      icon: 'Star',
      availableDays: '0,1,2,3,4',
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      name: 'חבילת מיקרובליידינג ומילוי',
      nameEn: 'Microblading Package',
      description: 'מיקרובליידינג + טיפול מילוי אחד',
      duration: 240,
      price: 1500,
      category: 'חבילות',
      icon: 'Star',
      availableDays: '0,1,2',
      startTime: '09:00',
      endTime: '15:00',
    },
    {
      name: 'חבילת פינוק מלא',
      nameEn: 'Full Pampering Package',
      description: 'גבות + ריסים + ציפורניים',
      duration: 180,
      price: 500,
      category: 'חבילות',
      icon: 'Star',
      availableDays: '0,1,2,3',
      startTime: '10:00',
      endTime: '16:00',
    },

    // מיוחדים
    {
      name: 'טיפול כלה מלא',
      nameEn: 'Bridal Package',
      description: 'טיפול מקיף לכלה: גבות, ריסים, ציפורניים',
      duration: 240,
      price: 800,
      category: 'מיוחדים',
      icon: 'Star',
      availableDays: '3,4', // רביעי וחמישי בלבד
      startTime: '10:00',
      endTime: '15:00',
    },
    {
      name: 'ייעוץ אישי',
      nameEn: 'Personal Consultation',
      description: 'ייעוץ מקצועי לבחירת הטיפולים המתאימים',
      duration: 30,
      price: 0,
      category: 'מיוחדים',
      icon: 'Star',
      availableDays: '0,1,2,3,4,5',
      startTime: '09:00',
      endTime: '19:00',
    },
    {
      name: 'תיקון מיקרובליידינג',
      nameEn: 'Microblading Touch-up',
      description: 'תיקון וריענון מיקרובליידינג קיים',
      duration: 60,
      price: 400,
      category: 'מיוחדים',
      icon: 'Star',
      availableDays: '0,1,2,3,4',
      startTime: '09:00',
      endTime: '18:00',
    },
    {
      name: 'הסרת פיגמנט',
      nameEn: 'Pigment Removal',
      description: 'הסרת פיגמנט ישן או לא רצוי',
      duration: 90,
      price: 500,
      category: 'מיוחדים',
      icon: 'Star',
      availableDays: '1,3', // שני ורביעי בלבד
      startTime: '10:00',
      endTime: '16:00',
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    })
  }

  console.log(`✅ Created ${services.length} services`)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: admin@avitalak.co.il / admin123')
  console.log('   User:  user@test.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
