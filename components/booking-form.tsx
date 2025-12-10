'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar, AlertCircle } from 'lucide-react'
import { WaitlistForm } from '@/components/waitlist-form'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  category: string
  availableDays: string
  startTime: string
  endTime: string
}

export function BookingForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [slotTaken, setSlotTaken] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [findingNextSlot, setFindingNextSlot] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  // טעינה אוטומטית של התור הפנוי הראשון כשבוחרים שירות
  useEffect(() => {
    if (selectedService && !selectedDate) {
      findNextAvailableSlot()
    }
  }, [selectedService])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const checkAvailability = async (date: string, time: string) => {
    if (!date || !time || !selectedService) return
    
    setCheckingAvailability(true)
    try {
      // Parse date and time as local time
      const [year, month, day] = date.split('-').map(Number)
      const [hour, minute] = time.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0)
      
      // מצא את משך השירות
      const service = services.find(s => s.id === selectedService)
      if (!service) return
      
      const serviceDuration = service.duration
      const serviceEndTime = new Date(dateTime)
      serviceEndTime.setMinutes(serviceEndTime.getMinutes() + serviceDuration)
      
      const response = await fetch(`/api/appointments?public=true`)
      if (response.ok) {
        const appointments = await response.json()
        
        // בדיקה אם יש חפיפה עם תור קיים
        const conflict = appointments.some((apt: any) => {
          const aptStart = new Date(apt.date)
          const aptEnd = new Date(apt.endDate)
          
          // חפיפה = התור החדש מתחיל לפני שהתור הקיים נגמר
          // והתור החדש נגמר אחרי שהתור הקיים התחיל
          return (
            (dateTime >= aptStart && dateTime < aptEnd) || // התחלה בתוך תור קיים
            (serviceEndTime > aptStart && serviceEndTime <= aptEnd) || // סיום בתוך תור קיים
            (dateTime <= aptStart && serviceEndTime >= aptEnd) // מכסה תור קיים לגמרי
          )
        })
        
        setSlotTaken(conflict)
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const findNextAvailableSlot = async () => {
    if (!selectedService) {
      setError('נא לבחור שירות תחילה')
      return
    }

    setFindingNextSlot(true)
    setError('')

    try {
      const response = await fetch(`/api/appointments/next-available?serviceId=${selectedService}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'לא נמצא תור פנוי')
      }

      const data = await response.json()
      
      // מילוי אוטומטי של התאריך תחילה
      setSelectedDate(data.date)
      
      // המתן לטעינת השעות התפוסות ואז קבע את השעה
      await loadBookedSlots(data.date)
      
      // עכשיו קבע את השעה - אחרי שהשעות התפוסות נטענו
      setSelectedTime(data.time)
      
      // גלילה לסיכום
      setTimeout(() => {
        const summaryElement = document.getElementById('booking-summary')
        if (summaryElement) {
          summaryElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFindingNextSlot(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== 'authenticated') {
      router.push('/login?callbackUrl=/dashboard/book')
      return
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      setError('נא למלא את כל השדות')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Parse date and time as local time
      const [year, month, day] = selectedDate.split('-').map(Number)
      const [hour, minute] = selectedTime.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService,
          date: dateTime.toISOString(),
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בקביעת התור')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // טעינת שעות תפוסות כשבוחרים תאריך
  useEffect(() => {
    if (selectedDate) {
      loadBookedSlots(selectedDate)
    } else {
      setBookedSlots([])
    }
  }, [selectedDate])

  // בדיקת זמינות כשמשנים תאריך או שעה
  useEffect(() => {
    if (selectedDate && selectedTime && !findingNextSlot) {
      // בדוק רק אם זה לא בתהליך של מציאת תור אוטומטי
      checkAvailability(selectedDate, selectedTime)
    } else {
      setSlotTaken(false)
    }
  }, [selectedDate, selectedTime, findingNextSlot])

  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const generateTimeSlots = () => {
    if (!selectedService || !selectedDate) return []
    
    const service = services.find(s => s.id === selectedService)
    if (!service) return []

    // Parse start and end times
    const [startHour, startMinute] = service.startTime.split(':').map(Number)
    const [endHour, endMinute] = service.endTime.split(':').map(Number)

    const slots = []
    let currentHour = startHour
    let currentMinute = startMinute

    // Parse selected date
    const [year, month, day] = selectedDate.split('-').map(Number)

    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // בדוק אם יש מספיק זמן פנוי עבור כל משך השירות
      let hasEnoughTime = true
      const requiredSlots = Math.ceil(service.duration / 30) // כמה חצאי שעות נדרשים
      
      for (let i = 0; i < requiredSlots; i++) {
        const checkHour = currentHour + Math.floor((currentMinute + i * 30) / 60)
        const checkMinute = (currentMinute + i * 30) % 60
        const checkTime = `${checkHour.toString().padStart(2, '0')}:${checkMinute.toString().padStart(2, '0')}`
        
        if (bookedSlots.includes(checkTime)) {
          hasEnoughTime = false
          break
        }
      }
      
      // בדוק גם שהשעה היא בעתיד (אם זה היום)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const selectedDateObj = new Date(year, month - 1, day)
      
      if (selectedDateObj.getTime() === today.getTime()) {
        const slotTime = new Date(year, month - 1, day, currentHour, currentMinute)
        if (slotTime <= now) {
          hasEnoughTime = false
        }
      }
      
      if (hasEnoughTime) {
        slots.push(time)
      }

      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
    }

    return slots
  }

  const loadBookedSlots = async (date: string) => {
    if (!date) return
    
    setLoadingSlots(true)
    try {
      // Parse date as local time (not UTC)
      const [year, month, day] = date.split('-').map(Number)
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
      
      const response = await fetch(`/api/appointments?public=true`)
      if (response.ok) {
        const appointments = await response.json()
        
        // מצא את כל השעות התפוסות ליום זה
        const booked: string[] = []
        
        appointments.forEach((apt: any) => {
          const aptStart = new Date(apt.date)
          const aptEnd = new Date(apt.endDate)
          
          // בדוק אם התור חופף ליום שנבחר
          if (aptStart <= endOfDay && aptEnd >= startOfDay) {
            // חסום את כל השעות בטווח התור
            let current = new Date(aptStart)
            
            while (current < aptEnd) {
              if (current >= startOfDay && current <= endOfDay) {
                const timeSlot = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
                if (!booked.includes(timeSlot)) {
                  booked.push(timeSlot)
                }
              }
              current.setMinutes(current.getMinutes() + 30)
            }
          }
        })
        
        setBookedSlots(booked)
      }
    } catch (error) {
      console.error('Error loading booked slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.toISOString().split('T')[0]
  }

  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDateAvailable = (dateString: string) => {
    if (!selectedService) return true
    
    const service = services.find(s => s.id === selectedService)
    if (!service) return true

    // Parse date as local time
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    const availableDays = service.availableDays.split(',').map(Number)
    
    return availableDays.includes(dayOfWeek)
  }

  const getMinDate = () => {
    if (!selectedService) return getTomorrowDate()
    
    const service = services.find(s => s.id === selectedService)
    if (!service) return getTomorrowDate()

    const availableDays = service.availableDays.split(',').map(Number)
    let date = new Date()
    date.setDate(date.getDate() + 1) // Start from tomorrow

    // Find next available day
    for (let i = 0; i < 14; i++) {
      if (availableDays.includes(date.getDay())) {
        return date.toISOString().split('T')[0]
      }
      date.setDate(date.getDate() + 1)
    }

    return getTomorrowDate()
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90) // 3 חודשים קדימה
    return maxDate.toISOString().split('T')[0]
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">התור נקבע בהצלחה!</h2>
            <p className="text-gray-600 mb-4">נשלחה אליך הודעת אישור למייל</p>
            <p className="text-sm text-gray-500">מעביר אותך לדף הבית...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          קביעת תור
        </CardTitle>
        <CardDescription>
          בחרי שירות, תאריך ושעה ונאשר את התור
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service">בחרי שירות *</Label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
              required
            >
              <option value="">-- בחרי שירות --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ₪{service.price} ({service.duration} דקות)
                </option>
              ))}
            </select>
            
            {selectedService && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={findNextAvailableSlot}
                disabled={findingNextSlot}
                className="w-full mt-2"
              >
                {findingNextSlot ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                    מחפש תור פנוי...
                  </>
                ) : (
                  <>
                    <Calendar className="ml-2 h-4 w-4" />
                    🔍 מצא לי את התור הקרוב ביותר
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">תאריך *</Label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value
                  const minDate = getTomorrowDate()
                  
                  if (newDate < minDate) {
                    return
                  }
                  
                  // בדיקה אם היום בכלל זמין לשירות (לפי ימי פעילות)
                  if (!isDateAvailable(newDate)) {
                    // אל תעדכן את התאריך אם הוא לא זמין
                    return
                  }
                  
                  setError('')
                  setSelectedDate(newDate)
                  setSelectedTime('') // Reset time when date changes
                }}
                min={getTomorrowDate()}
                max={getMaxDate()}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                required
                disabled={!selectedService}
                lang="he"
              />
              {selectedService && (
                <p className="text-xs text-blue-600 font-medium">
                  💡 השירות זמין בימים: {services.find(s => s.id === selectedService)?.availableDays.split(',').map(Number).map(d => ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][d]).join(', ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">שעה *</Label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                required
                disabled={!selectedDate || !selectedService || loadingSlots}
              >
                <option value="">
                  {loadingSlots ? 'טוען שעות זמינות...' : '-- בחרי שעה --'}
                </option>
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {selectedService && selectedDate && !loadingSlots && (
                <div className="text-xs space-y-1">
                  <p className="text-gray-500">
                    שעות פעילות: {services.find(s => s.id === selectedService)?.startTime} - {services.find(s => s.id === selectedService)?.endTime}
                  </p>
                  {generateTimeSlots().length === 0 && (
                    <p className="text-amber-600 font-medium">
                      כל השעות תפוסות לתאריך זה
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="הערות או בקשות מיוחדות..."
            />
          </div>

          {selectedService && selectedDate && selectedTime && (
            <>
              {checkingAvailability ? (
                <div className="p-4 bg-gray-50 rounded-md text-center">
                  <p className="text-sm text-gray-600">בודקת זמינות...</p>
                </div>
              ) : slotTaken ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">השעה תפוסה</h4>
                      <p className="text-sm text-amber-700">
                        הזמן שבחרת כבר תפוס. את יכולה להירשם לרשימת המתנה ונשלח לך התראה אם התור יתבטל.
                      </p>
                    </div>
                  </div>
                  
                  <WaitlistForm
                    serviceId={selectedService}
                    serviceName={services.find((s) => s.id === selectedService)?.name || ''}
                    date={selectedDate}
                    timeSlot={selectedTime}
                    onSuccess={() => {
                      setTimeout(() => router.push('/dashboard'), 2000)
                    }}
                  />
                </div>
              ) : (
                <div id="booking-summary" className="p-4 bg-brand-cream rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="font-semibold">השעה פנויה! ✓</h3>
                  </div>
                  <h3 className="font-semibold mb-2">סיכום התור:</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>שירות:</strong>{' '}
                      {services.find((s) => s.id === selectedService)?.name}
                    </p>
                    <p>
                      <strong>תאריך:</strong>{' '}
                      {new Date(selectedDate).toLocaleDateString('he-IL')}
                    </p>
                    <p>
                      <strong>שעה:</strong> {selectedTime}
                    </p>
                    <p>
                      <strong>משך:</strong>{' '}
                      {services.find((s) => s.id === selectedService)?.duration} דקות
                    </p>
                    <p className="text-lg font-bold text-brand-brown mt-2">
                      <strong>מחיר:</strong> ₪
                      {services.find((s) => s.id === selectedService)?.price}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {!slotTaken && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !selectedService || !selectedDate || !selectedTime || checkingAvailability}
                >
                  {isLoading ? 'קובע תור...' : 'אישור וקביעת תור'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  ביטול
                </Button>
              </div>

              {/* כפתור הצטרפות לרשימת המתנה - לכל היום */}
              {selectedService && selectedDate && !loadingSlots && generateTimeSlots().length === 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800 font-medium">
                      כל השעות תפוסות בתאריך זה
                    </p>
                  </div>
                  <WaitlistForm
                    serviceId={selectedService}
                    serviceName={services.find((s) => s.id === selectedService)?.name || ''}
                    date={selectedDate}
                    timeSlot="" // ריק = כל היום
                    onSuccess={() => {
                      setTimeout(() => router.push('/dashboard'), 2000)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {status !== 'authenticated' && (
            <p className="text-sm text-gray-600 text-center">
              * נדרשת התחברות לקביעת תור.{' '}
              <a href="/login" className="text-brand-brown underline">
                התחברי כאן
              </a>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

