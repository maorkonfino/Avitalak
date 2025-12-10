import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET - קבלת רשימת המתנה
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const date = searchParams.get('date')

    const where: any = {
      active: true,
    }

    // משתמש רגיל רואה רק את שלו
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }

    if (serviceId) {
      where.serviceId = serviceId
    }

    if (date) {
      where.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      }
    }

    const waitlist = await prisma.waitlist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' },
        { createdAt: 'asc' }, // First come, first served
      ],
    })

    return NextResponse.json(waitlist)
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת רשימת המתנה' },
      { status: 500 }
    )
  }
}

// POST - הוספה לרשימת המתנה
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { serviceId, date, timeSlot } = body

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: 'חסרים פרטים נדרשים' },
        { status: 400 }
      )
    }

    // אם timeSlot לא נשלח - יוצרים רשומה לכל היום
    if (!timeSlot) {
      // בדיקה אם כבר נרשם לאותו תאריך
      const existing = await prisma.waitlist.findFirst({
        where: {
          userId: session.user.id,
          serviceId,
          date: new Date(date),
          active: true,
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'כבר נרשמת לרשימת המתנה לתאריך זה' },
          { status: 409 }
        )
      }

      const waitlistEntry = await prisma.waitlist.create({
        data: {
          userId: session.user.id,
          serviceId,
          date: new Date(date),
          timeSlot: 'ANY', // כל השעות
        },
        include: {
          service: true,
        },
      })

      return NextResponse.json(waitlistEntry, { status: 201 })
    }

    // בדיקה אם כבר ברשימת המתנה
    const existing = await prisma.waitlist.findFirst({
      where: {
        userId: session.user.id,
        serviceId,
        date: new Date(date),
        timeSlot,
        active: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'כבר נרשמת לרשימת המתנה עבור זמן זה' },
        { status: 409 }
      )
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        userId: session.user.id,
        serviceId,
        date: new Date(date),
        timeSlot,
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(waitlistEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating waitlist entry:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת רשומה ברשימת המתנה' },
      { status: 500 }
    )
  }
}

