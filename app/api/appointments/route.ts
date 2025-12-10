import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const publicView = searchParams.get('public') === 'true'

    // Public view - only return occupied slots without user details
    if (publicView || !session?.user) {
      const appointments = await prisma.appointment.findMany({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        select: {
          id: true,
          date: true,
          endDate: true,
          serviceId: true,
          status: true,
        },
      })
      return NextResponse.json(appointments)
    }

    // Authenticated view - full details
    let where: any = {}

    // Regular users can only see their own appointments
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת התורים" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      )
    }

    const { serviceId, date, notes } = await request.json()

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "נא למלא את כל השדות הנדרשים" },
        { status: 400 }
      )
    }

    // Get service to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: "שירות לא נמצא" },
        { status: 404 }
      )
    }

    const startDate = new Date(date)
    const endDate = new Date(startDate.getTime() + service.duration * 60000)

    // Check for conflicts
    const conflicts = await prisma.appointment.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { date: { lte: startDate } },
              { endDate: { gt: startDate } }
            ]
          },
          {
            AND: [
              { date: { lt: endDate } },
              { endDate: { gte: endDate } }
            ]
          },
          {
            AND: [
              { date: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          }
        ]
      }
    })

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "התור חופף לתור קיים" },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        serviceId,
        date: startDate,
        endDate,
        notes,
        status: 'PENDING'
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "שגיאה ביצירת התור" },
      { status: 500 }
    )
  }
}

