import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get available days
    const availableDays = service.availableDays.split(',').map(Number)
    const [startHour, startMinute] = service.startTime.split(':').map(Number)
    const [endHour, endMinute] = service.endTime.split(':').map(Number)

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Find next available slot
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    currentDate.setDate(currentDate.getDate() + 1) // Start from tomorrow

    // Search up to 90 days ahead
    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() + dayOffset)
      
      const dayOfWeek = checkDate.getDay()
      
      // Skip if service not available on this day
      if (!availableDays.includes(dayOfWeek)) {
        continue
      }

      // Try each time slot for this day
      let hour = startHour
      let minute = startMinute

      while (hour < endHour || (hour === endHour && minute < endMinute)) {
        const slotStart = new Date(checkDate)
        slotStart.setHours(hour, minute, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + service.duration)

        // Check if this slot conflicts with any appointment
        const hasConflict = appointments.some(apt => {
          const aptStart = new Date(apt.date)
          const aptEnd = new Date(apt.endDate)
          
          return (
            (slotStart >= aptStart && slotStart < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotStart <= aptStart && slotEnd >= aptEnd)
          )
        })

        if (!hasConflict) {
          // Found available slot!
          const year = checkDate.getFullYear()
          const month = String(checkDate.getMonth() + 1).padStart(2, '0')
          const day = String(checkDate.getDate()).padStart(2, '0')
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
          
          return NextResponse.json({
            date: `${year}-${month}-${day}`,
            time: timeStr,
            dateTime: slotStart.toISOString()
          })
        }

        // Move to next slot (30 minutes)
        minute += 30
        if (minute >= 60) {
          minute = 0
          hour++
        }
      }
    }

    // No available slot found
    return NextResponse.json(
      { error: 'לא נמצא תור פנוי ב-90 הימים הקרובים' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error finding next available slot:', error)
    return NextResponse.json(
      { error: 'Failed to find available slot', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

