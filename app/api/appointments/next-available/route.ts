import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'חסר מזהה שירות' },
        { status: 400 }
      )
    }

    // מציאת השירות
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'שירות לא נמצא' },
        { status: 404 }
      )
    }

    // ימים זמינים
    const availableDays = service.availableDays.split(',').map(Number)
    
    // שעות זמינות
    const [startHour, startMinute] = service.startTime.split(':').map(Number)
    const [endHour, endMinute] = service.endTime.split(':').map(Number)

    // קבלת כל התורים הקיימים (מהיום ואילך, ללא מבוטלים)
    const currentTime = new Date()
    const appointments = await prisma.appointment.findMany({
      where: {
        serviceId,
        date: {
          gte: currentTime,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // יצירת סט של זמנים תפוסים (כולל כל משך התור)
    const bookedSlots = new Set<string>()
    
    appointments.forEach(apt => {
      const startDate = new Date(apt.date)
      const endDate = new Date(apt.endDate)
      
      // חסום את כל השעות בטווח התור
      let current = new Date(startDate)
      while (current < endDate) {
        const key = `${current.toISOString().split('T')[0]}_${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
        bookedSlots.add(key)
        current.setMinutes(current.getMinutes() + 30)
      }
    })

    // חיפוש התור הראשון הפנוי
    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate())
    let searchDate = new Date(today)
    searchDate.setDate(searchDate.getDate() + 1) // התחל ממחר
    searchDate.setHours(0, 0, 0, 0)

    const maxDaysToSearch = 60 // חפש עד 60 יום קדימה

    for (let dayOffset = 0; dayOffset < maxDaysToSearch; dayOffset++) {
      const currentDate = new Date(searchDate)
      currentDate.setDate(currentDate.getDate() + dayOffset)
      
      const dayOfWeek = currentDate.getDay()
      
      // בדוק אם היום זמין לשירות
      if (!availableDays.includes(dayOfWeek)) {
        continue
      }

      // בדוק כל שעה ביום
      let hour = startHour
      let minute = startMinute

      while (hour < endHour || (hour === endHour && minute < endMinute)) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const dateStr = currentDate.toISOString().split('T')[0]
        
        // בדוק אם כל משך השירות פנוי
        let allSlotsFree = true
        let checkTime = new Date(`${dateStr}T${timeSlot}:00`)
        const serviceEndTime = new Date(checkTime)
        serviceEndTime.setMinutes(serviceEndTime.getMinutes() + service.duration)
        
        // בדוק כל חצי שעה בטווח השירות
        while (checkTime < serviceEndTime) {
          const checkKey = `${checkTime.toISOString().split('T')[0]}_${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`
          if (bookedSlots.has(checkKey)) {
            allSlotsFree = false
            break
          }
          checkTime.setMinutes(checkTime.getMinutes() + 30)
        }

        // אם כל הזמן פנוי - זהו!
        if (allSlotsFree) {
          return NextResponse.json({
            date: dateStr,
            time: timeSlot,
            dateTime: new Date(`${dateStr}T${timeSlot}:00`).toISOString(),
          })
        }

        // עבור לשעה הבאה
        minute += 30
        if (minute >= 60) {
          minute = 0
          hour++
        }
      }
    }

    // לא נמצא תור פנוי
    return NextResponse.json(
      { error: 'לא נמצא תור פנוי ב-60 הימים הקרובים' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error finding next available slot:', error)
    return NextResponse.json(
      { error: 'שגיאה בחיפוש תור פנוי' },
      { status: 500 }
    )
  }
}

