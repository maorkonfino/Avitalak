'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Appointment {
  id: string
  date: string
  endDate: string
  status: string
  notes: string | null
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
}

export default function MyAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editFormData, setEditFormData] = useState({
    date: '',
    time: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      loadAppointments()
    }
  }, [session])

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        // Sort by date, newest first
        const sorted = data.sort((a: Appointment, b: Appointment) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAppointments(sorted)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('שגיאה בטעינת תורים')
    } finally {
      setIsLoading(false)
    }
  }

  const isFutureAppointment = (date: string) => {
    return new Date(date) > new Date()
  }

  const canEditOrCancel = (date: string) => {
    const appointmentDate = new Date(date)
    const now = new Date()
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDiff >= 24
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'מאושר'
      case 'CANCELLED':
        return 'מבוטל'
      case 'COMPLETED':
        return 'הושלם'
      default:
        return 'ממתין לאישור'
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const appointmentDate = new Date(appointment.date)
    setEditFormData({
      date: appointmentDate.toISOString().split('T')[0],
      time: `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`,
      notes: appointment.notes || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return

    try {
      const [year, month, day] = editFormData.date.split('-').map(Number)
      const [hour, minute] = editFormData.time.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0)

      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateTime.toISOString(),
          notes: editFormData.notes,
        }),
      })

      if (response.ok) {
        toast.success('התור עודכן בהצלחה!')
        setEditDialogOpen(false)
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה בעדכון תור')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('שגיאה בעדכון תור')
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('האם את בטוחה שברצונך לבטל את התור?')) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('התור בוטל בהצלחה!')
        loadAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'שגיאה בביטול תור')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('שגיאה בביטול תור')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען תורים...</p>
        </div>
      </div>
    )
  }

  const futureAppointments = appointments.filter(apt => isFutureAppointment(apt.date) && apt.status !== 'CANCELLED')
  const pastAppointments = appointments.filter(apt => !isFutureAppointment(apt.date) || apt.status === 'CANCELLED')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">התורים שלי</h1>
          <p className="text-muted-foreground">
            סך הכל {appointments.length} תורים
          </p>
        </div>

        {appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">אין לך תורים</h3>
              <p className="text-muted-foreground mb-6">
                עדיין לא קבעת תורים. רוצה לקבוע תור חדש?
              </p>
              <Button asChild>
                <a href="/dashboard/book">קביעת תור</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Future Appointments */}
            {futureAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  תורים עתידיים ({futureAppointments.length})
                </h2>
                <div className="space-y-4">
                  {futureAppointments.map((appointment) => {
                    const canModify = canEditOrCancel(appointment.date)
                    return (
                      <Card key={appointment.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold">{appointment.service.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                  {getStatusText(appointment.status)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">תאריך ושעה</p>
                                  <p className="font-medium">
                                    {new Date(appointment.date).toLocaleString('he-IL', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">משך הטיפול</p>
                                  <p className="font-medium">{appointment.service.duration} דקות</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">מחיר</p>
                                  <p className="font-medium text-xl">₪{appointment.service.price}</p>
                                </div>
                              </div>

                              {appointment.notes && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    <strong>הערות:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}

                              {!canModify && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <AlertCircle className="h-5 w-5 text-amber-600" />
                                  <p className="text-sm text-amber-800">
                                    לא ניתן לערוך או לבטל תור פחות מ-24 שעות לפני המועד
                                  </p>
                                </div>
                              )}
                            </div>

                            {canModify && appointment.status !== 'CANCELLED' && (
                              <div className="flex flex-col gap-2 mr-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(appointment)}
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  ערוך
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  ביטול
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-gray-400" />
                  תורים קודמים ({pastAppointments.length})
                </h2>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-gray-300 opacity-75">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{appointment.service.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">תאריך ושעה</p>
                              <p className="font-medium">
                                {new Date(appointment.date).toLocaleString('he-IL', {
                                  year: 'numeric',
                                  month: 'numeric',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">משך</p>
                              <p className="font-medium">{appointment.service.duration} דקות</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">מחיר</p>
                              <p className="font-medium">₪{appointment.service.price}</p>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>הערות:</strong> {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>עריכת תור</DialogTitle>
              <DialogDescription>
                ערכי את פרטי התור. שימי לב שהשינויים כפופים לאישור.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">שירות</Label>
                <p className="text-gray-600">{selectedAppointment?.service.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">תאריך</Label>
                  <input
                    type="date"
                    id="edit-date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">שעה</Label>
                  <input
                    type="time"
                    id="edit-time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">הערות</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={3}
                  className="mt-1"
                  placeholder="הערות או בקשות מיוחדות..."
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 השינויים ימתינו לאישור מנהל. תקבלי עדכון במייל.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleUpdateAppointment}>
                שמור שינויים
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

