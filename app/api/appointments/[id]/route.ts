import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const data = await request.json()

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "תור לא נמצא" },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role !== 'ADMIN' && appointment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "אין הרשאה" },
        { status: 403 }
      )
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data,
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

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון התור" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Get the appointment with service details
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "תור לא נמצא" },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role !== 'ADMIN' && appointment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "אין הרשאה" },
        { status: 403 }
      )
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id }
    })

    // Check waitlist for this time slot
    const appointmentDate = new Date(appointment.date)
    const timeSlot = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
    
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        serviceId: appointment.serviceId,
        date: {
          gte: new Date(appointmentDate.toDateString()),
          lt: new Date(new Date(appointmentDate.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        timeSlot,
        active: true,
        notified: false,
      },
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (waitlistEntry) {
      // Mark as notified
      await prisma.waitlist.update({
        where: { id: waitlistEntry.id },
        data: { notified: true },
      })
      
      console.log(`📧 התפנה תור! התראה נשלחת ל-${waitlistEntry.user.email}`)
      // TODO: שליחת מייל בפועל
    }

    return NextResponse.json({ 
      message: "התור בוטל בהצלחה",
      waitlistNotified: !!waitlistEntry
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json(
      { error: "שגיאה במחיקת התור" },
      { status: 500 }
    )
  }
}

