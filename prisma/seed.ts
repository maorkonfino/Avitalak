import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
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
  console.log('✅ Admin user ready')

  // Services mirrored from avitalak.co.il
  const services = [
    // ── גבות ─────────────────────────────────────────────────────────────
    {
      name: 'מיקרובליידינג טיפול 1',
      description: 'טיפול מיקרובליידינג מלא - שיטת שיער לשיער לגבות טבעיות',
      duration: 180, price: 1888, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '17:00',
    },
    {
      name: 'מיקרובליידינג טיפול 2',
      description: 'טיפול מעקב / תלמידות',
      duration: 90, price: 1, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '17:00',
    },
    {
      name: 'הרמת גבות',
      description: 'הרמה וסידור גבות לתיקון צמיחה הפוכה ועיבוי',
      duration: 30, price: 240, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'גבות + שפם',
      description: 'סידור גבות וסידור שפם',
      duration: 20, price: 80, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'שפם',
      description: 'סידור שפם בלבד',
      duration: 10, price: 30, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'סידור גבות + צבע',
      description: 'סידור גבות כולל צביעה',
      duration: 30, price: 100, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'גבות (ללא שפם)',
      description: 'סידור גבות בלבד',
      duration: 15, price: 70, category: 'גבות', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },

    // ── ריסים ────────────────────────────────────────────────────────────
    {
      name: 'הרמת ריסים',
      description: 'הרמה וסלסול ריסים טבעיים',
      duration: 60, price: 355, category: 'ריסים', icon: 'Eye',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'צביעת ריסים',
      description: 'צביעת ריסים בצבע כהה',
      duration: 15, price: 40, category: 'ריסים', icon: 'Eye',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },

    // ── ציפורניים ────────────────────────────────────────────────────────
    {
      name: "לק ג'ל מבנה אנטומי",
      description: "לק ג'ל עם תיקון מבנה אנטומי",
      duration: 90, price: 207, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'בניה',
      description: 'בניית ציפורניים משקמת',
      duration: 150, price: 355, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'מילוי בניה',
      description: 'מילוי בניית ציפורניים',
      duration: 90, price: 230, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: "הסרת לק ג'ל ומניקור",
      description: "הסרת לק ג'ל ומניקור",
      duration: 40, price: 118, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'הסרת בנייה ומניקור',
      description: 'הסרת בנייה ומניקור',
      duration: 75, price: 155, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '19:00',
    },
    {
      name: 'בניה ארוכה (מעל 2 ס"מ)',
      description: 'בניית ציפורניים ארוכות מעל 2 ס"מ',
      duration: 150, price: 384, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'מילוי בניה ארוכה (מעל 2 ס"מ)',
      description: 'מילוי בניה ארוכה מעל 2 ס"מ',
      duration: 120, price: 284, category: 'ציפורניים', icon: 'Hand',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },

    // ── חבילות ───────────────────────────────────────────────────────────
    {
      name: "לק ג'ל מבנה אנטומי + גבות ושפם",
      description: "לק ג'ל מבנה אנטומי עם סידור גבות ושפם",
      duration: 110, price: 287, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'בניה + גבות ושפם',
      description: 'בניית ציפורניים עם סידור גבות ושפם',
      duration: 140, price: 435, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'מילוי בניה + גבות ושפם',
      description: 'מילוי בניה עם סידור גבות ושפם',
      duration: 110, price: 310, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: "לק ג'ל מבנה אנטומי + ציורים",
      description: "לק ג'ל מבנה אנטומי עם ציורים",
      duration: 120, price: 272, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'מילוי בניה + ציורים',
      description: 'מילוי בניה עם ציורים',
      duration: 120, price: 295, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'הרמת ריסים + סידור גבות',
      description: 'הרמת ריסים עם סידור גבות',
      duration: 75, price: 435, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '17:00',
    },
    {
      name: 'הרמת גבות + סידור גבות',
      description: 'הרמת גבות עם סידור גבות',
      duration: 60, price: 315, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'הרמת ריסים + הרמת גבות',
      description: 'הרמת ריסים עם הרמת גבות',
      duration: 90, price: 590, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '17:00',
    },
    {
      name: 'דיל משתלם! הרמת ריסים + הרמת גבות + סידור גבות',
      description: 'חבילת שלושה טיפולים במחיר מיוחד',
      duration: 105, price: 590, category: 'חבילות', icon: 'Star',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '17:00',
    },
    {
      name: "לק גל מבנה אנטומי + גבות שפם + צבע",
      description: "לק גל מבנה אנטומי עם סידור גבות, שפם וצביעה",
      duration: 120, price: 289, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'מילוי בניה + גבות שפם + צבע',
      description: 'מילוי בניה עם סידור גבות, שפם וצביעה',
      duration: 120, price: 299, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },
    {
      name: 'בניה + גבות שפם + צבע',
      description: 'בניה עם סידור גבות, שפם וצביעה',
      duration: 150, price: 409, category: 'חבילות', icon: 'Package',
      availableDays: '0,1,2,3,4,5', startTime: '09:00', endTime: '18:00',
    },

    // ── מיוחדים ──────────────────────────────────────────────────────────
    {
      name: "לק גל מבנה אנטומי - עבודת קטלוג",
      description: "לק גל מבנה אנטומי לצורך עבודת קטלוג",
      duration: 150, price: 466, category: 'מיוחדים', icon: 'Gem',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '16:00',
    },
    {
      name: 'מילוי בניה - עבודת קטלוג',
      description: 'מילוי בניה לצורך עבודת קטלוג',
      duration: 150, price: 502, category: 'מיוחדים', icon: 'Gem',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '16:00',
    },
    {
      name: 'בניה - עבודת קטלוג',
      description: 'בניה לצורך עבודת קטלוג',
      duration: 180, price: 585, category: 'מיוחדים', icon: 'Gem',
      availableDays: '0,1,2,3,4', startTime: '09:00', endTime: '15:00',
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    })
  }

  console.log(`✅ ${services.length} services seeded`)
  console.log('\n📝 Admin login:')
  console.log('   Email:    admin@avitalak.co.il')
  console.log('   Password: admin123')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
