'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'moment/locale/he'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: any
}

moment.locale('he')
const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar)

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface User {
  id: string
  name: string
  email: string
}

export default function AdminCalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  
  // Form state
  const [services, setServices] = useState<Service[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    userId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
    status: 'PENDING'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadAppointments()
      loadServices()
      loadUsers()
    }
  }, [session])

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const appointments = await response.json()
        const calendarEvents: CalendarEvent[] = appointments.map((apt: any) => ({
          id: apt.id,
          title: `${apt.service.name} - ${apt.user.name}`,
          start: new Date(apt.date),
          end: new Date(apt.endDate),
          resource: apt
        }))
        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end })
      setSelectedEvent(null)
      setDialogMode('create')
      
      const startStr = start.toISOString().split('T')[0]
      const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
      
      setFormData({
        userId: '',
        serviceId: '',
        date: startStr,
        time: timeStr,
        notes: '',
        status: 'PENDING'
      })
      setDialogOpen(true)
    },
    []
  )

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedSlot(null)
    setDialogMode('view')
    
    const apt = event.resource
    const dateStr = new Date(apt.date).toISOString().split('T')[0]
    const timeStr = `${new Date(apt.date).getHours().toString().padStart(2, '0')}:${new Date(apt.date).getMinutes().toString().padStart(2, '0')}`
    
    setFormData({
      userId: apt.userId,
      serviceId: apt.serviceId,
      date: dateStr,
      time: timeStr,
      notes: apt.notes || '',
      status: apt.status
    })
    setDialogOpen(true)
  }, [])

  const handleCreateAppointment = async () => {
    try {
      const [year, month, day] = formData.date.split('-').map(Number)
      const [hour, minute] = formData.time.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          serviceId: formData.serviceId,
          date: dateTime.toISOString(),
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        toast.success('התור נוצר בהצלחה')
        setDialogOpen(false)
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה ביצירת תור')
      }
    } catch (error) {
      toast.error('שגיאה ביצירת תור')
    }
  }

  const handleUpdateAppointment = async () => {
    if (!selectedEvent) return

    try {
      const [year, month, day] = formData.date.split('-').map(Number)
      const [hour, minute] = formData.time.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0)

      const response = await fetch(`/api/appointments/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateTime.toISOString(),
          notes: formData.notes,
          status: formData.status,
        }),
      })

      if (response.ok) {
        toast.success('התור עודכן בהצלחה')
        setDialogOpen(false)
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה בעדכון תור')
      }
    } catch (error) {
      toast.error('שגיאה בעדכון תור')
    }
  }

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return
    if (!confirm('האם אתה בטוח שברצונך למחוק את התור?')) return

    try {
      const response = await fetch(`/api/appointments/${selectedEvent.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('התור נמחק בהצלחה')
        setDialogOpen(false)
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה במחיקת תור')
      }
    } catch (error) {
      toast.error('שגיאה במחיקת תור')
    }
  }

  const handleEventDrop = async ({ event, start }: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
    try {
      const appointment = event.resource
      const startDate = typeof start === 'string' ? new Date(start) : start
      
      // Calculate endDate based on service duration
      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + appointment.service.duration)

      const response = await fetch(`/api/appointments/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: appointment.notes || '',
          status: appointment.status,
        }),
      })

      if (response.ok) {
        toast.success('התור הועבר בהצלחה!')
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה בהעברת התור')
        loadAppointments() // Reload to revert visual change
      }
    } catch (error) {
      toast.error('שגיאה בהעברת התור')
      loadAppointments() // Reload to revert visual change
    }
  }

  const handleEventResize = async ({ event, start, end }: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
    try {
      const appointment = event.resource
      const startDate = typeof start === 'string' ? new Date(start) : start
      const endDate = typeof end === 'string' ? new Date(end) : end

      const response = await fetch(`/api/appointments/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: appointment.notes || '',
          status: appointment.status,
        }),
      })

      if (response.ok) {
        toast.success('משך התור עודכן בהצלחה')
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה בעדכון משך התור')
        loadAppointments() // Reload to revert visual change
      }
    } catch (error) {
      toast.error('שגיאה בעדכון משך התור')
      loadAppointments() // Reload to revert visual change
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען לוח שנה...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const messages = {
    allDay: 'כל היום',
    previous: 'קודם',
    next: 'הבא',
    today: 'היום',
    month: 'חודש',
    week: 'שבוע',
    day: 'יום',
    agenda: 'סדר יום',
    date: 'תאריך',
    time: 'שעה',
    event: 'אירוע',
    noEventsInRange: 'אין תורים בטווח זה',
    showMore: (total: number) => `+${total} נוספים`,
  }

  const formats = {
    dayFormat: (date: Date, culture?: string, localizer?: any) =>
      localizer.format(date, 'dddd DD/MM', culture),
    dayHeaderFormat: (date: Date, culture?: string, localizer?: any) =>
      localizer.format(date, 'dddd DD/MM', culture),
    dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }, culture?: string, localizer?: any) =>
      `${localizer.format(start, 'DD/MM', culture)} - ${localizer.format(end, 'DD/MM', culture)}`,
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#8B6F47' // brand-brown
    const status = event.resource.status

    if (status === 'CONFIRMED') {
      backgroundColor = '#22c55e' // green
    } else if (status === 'CANCELLED') {
      backgroundColor = '#ef4444' // red
    } else if (status === 'COMPLETED') {
      backgroundColor = '#6b7280' // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">לוח שנה</h1>
            <p className="text-muted-foreground">תצוגת כל התורים</p>
          </div>
          <Button onClick={() => {
            setDialogMode('create')
            setSelectedEvent(null)
            setSelectedSlot(null)
            const now = new Date()
            const dateStr = now.toISOString().split('T')[0]
            const timeStr = '09:00'
            setFormData({
              userId: '',
              serviceId: '',
              date: dateStr,
              time: timeStr,
              notes: '',
              status: 'PENDING'
            })
            setDialogOpen(true)
          }}>
            <Plus className="ml-2 h-4 w-4" />
            תור חדש
          </Button>
        </div>

        {/* Legend */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B6F47' }}></div>
              <span>ממתין לאישור</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>מאושר</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>מבוטל</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500"></div>
              <span>הושלם</span>
            </div>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="p-6">
          <div style={{ height: '700px' }} dir="ltr">
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              selectable
              resizable
              draggableAccessor={() => true}
              messages={messages}
              formats={formats}
              eventPropGetter={eventStyleGetter}
              step={15}
              timeslots={4}
              min={new Date(2024, 0, 1, 8, 0, 0)}
              max={new Date(2024, 0, 1, 20, 0, 0)}
            />
          </div>
        </Card>

        {/* Appointment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' && 'תור חדש'}
                {dialogMode === 'edit' && 'עריכת תור'}
                {dialogMode === 'view' && 'פרטי תור'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {dialogMode === 'view' && selectedEvent && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">לקוח</p>
                        <p className="font-semibold">{selectedEvent.resource.user.name}</p>
                        <p className="text-sm text-gray-600">{selectedEvent.resource.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">שירות</p>
                        <p className="font-semibold">{selectedEvent.resource.service.name}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">תאריך ושעה</p>
                        <p className="font-semibold">{new Date(selectedEvent.resource.date).toLocaleString('he-IL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">משך הטיפול</p>
                        <p className="font-semibold">{selectedEvent.resource.service.duration} דקות</p>
                      </div>
                    </div>

                    <div className="border-t pt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">מחיר</p>
                        <p className="font-semibold text-lg">₪{selectedEvent.resource.service.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">סטטוס</p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{
                              backgroundColor: selectedEvent.resource.status === 'CONFIRMED' ? '#22c55e' :
                                             selectedEvent.resource.status === 'CANCELLED' ? '#ef4444' :
                                             selectedEvent.resource.status === 'COMPLETED' ? '#6b7280' : '#8B6F47'
                            }}
                          ></div>
                          <p className="font-semibold">
                            {selectedEvent.resource.status === 'PENDING' && 'ממתין לאישור'}
                            {selectedEvent.resource.status === 'CONFIRMED' && 'מאושר'}
                            {selectedEvent.resource.status === 'CANCELLED' && 'מבוטל'}
                            {selectedEvent.resource.status === 'COMPLETED' && 'הושלם'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedEvent.resource.notes && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-gray-500 mb-1">הערות</p>
                        <p className="text-gray-700">{selectedEvent.resource.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => setDialogMode('edit')} className="flex-1">
                      <Edit className="ml-2 h-4 w-4" />
                      ערוך תור
                    </Button>
                    <Button onClick={handleDeleteAppointment} variant="destructive" className="flex-1">
                      <Trash2 className="ml-2 h-4 w-4" />
                      מחק תור
                    </Button>
                  </div>
                </div>
              )}

              {(dialogMode === 'create' || dialogMode === 'edit') && (
                <div className="space-y-4">
                  {dialogMode === 'create' && (
                    <div className="space-y-2">
                      <Label htmlFor="userId">לקוח *</Label>
                      <select
                        id="userId"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                        required
                      >
                        <option value="">-- בחר לקוח --</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {dialogMode === 'create' && (
                    <div className="space-y-2">
                      <Label htmlFor="serviceId">שירות *</Label>
                      <select
                        id="serviceId"
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                        required
                      >
                        <option value="">-- בחר שירות --</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - ₪{service.price} ({service.duration} דקות)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">תאריך *</Label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">שעה *</Label>
                      <input
                        type="time"
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">סטטוס</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                    >
                      <option value="PENDING">ממתין לאישור</option>
                      <option value="CONFIRMED">מאושר</option>
                      <option value="CANCELLED">מבוטל</option>
                      <option value="COMPLETED">הושלם</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-300"
                      placeholder="הערות או בקשות מיוחדות..."
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => {
                      if (dialogMode === 'edit') {
                        setDialogMode('view')
                      } else {
                        setDialogOpen(false)
                      }
                    }}>
                      ביטול
                    </Button>
                    <Button onClick={dialogMode === 'create' ? handleCreateAppointment : handleUpdateAppointment}>
                      {dialogMode === 'create' ? 'יצירת תור' : 'עדכון תור'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

