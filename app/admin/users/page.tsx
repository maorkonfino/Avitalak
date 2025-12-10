'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Calendar, Mail, Phone, ChevronLeft, X, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
  _count?: {
    appointments: number
  }
}

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

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadUsers()
    }
  }, [session])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('שגיאה בטעינת משתמשים')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('שגיאה בטעינת משתמשים')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserAppointments = async (userId: string) => {
    setLoadingAppointments(true)
    try {
      const response = await fetch(`/api/appointments?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        // Sort by date, newest first
        const sorted = data.sort((a: Appointment, b: Appointment) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setUserAppointments(sorted)
      } else {
        toast.error('שגיאה בטעינת תורים')
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('שגיאה בטעינת תורים')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleUserClick = async (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
    await loadUserAppointments(user.id)
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
        return 'ממתין'
    }
  }

  const isFutureAppointment = (date: string) => {
    return new Date(date) > new Date()
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const nameMatch = user.name.toLowerCase().includes(query)
    const phoneMatch = user.phone?.toLowerCase().includes(query)
    
    return nameMatch || phoneMatch
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען משתמשים...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">ניהול משתמשים</h1>
          <p className="text-muted-foreground">
            סך הכל {users.length} משתמשים רשומים במערכת
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="חיפוש לפי שם או מספר טלפון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                נמצאו {filteredUsers.length} תוצאות
              </p>
            )}
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'אין משתמשים במערכת'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleUserClick(user)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-brown/20 to-brand-gold/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-brand-brown" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {user.role === 'ADMIN' ? '👑 מנהל' : '👤 לקוח'}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {user._count?.appointments || 0} תורים
                  </span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t">
                  הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>

        {/* User Appointments Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <div>{selectedUser?.name}</div>
                  <div className="text-sm font-normal text-gray-500">{selectedUser?.email}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">טוען תורים...</p>
                </div>
              ) : userAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">אין תורים למשתמש זה</p>
                </div>
              ) : (
                <>
                  {/* Future Appointments */}
                  {userAppointments.filter(apt => isFutureAppointment(apt.date)).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        תורים עתידיים ({userAppointments.filter(apt => isFutureAppointment(apt.date)).length})
                      </h3>
                      <div className="space-y-3">
                        {userAppointments
                          .filter(apt => isFutureAppointment(apt.date))
                          .map((appointment) => (
                            <Card key={appointment.id} className="border-l-4 border-l-green-500">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-lg">{appointment.service.name}</h4>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-500">תאריך ושעה</p>
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
                                        <p className="text-gray-500">משך</p>
                                        <p className="font-medium">{appointment.service.duration} דקות</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">מחיר</p>
                                        <p className="font-medium text-lg">₪{appointment.service.price}</p>
                                      </div>
                                    </div>
                                    {appointment.notes && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600">
                                          <strong>הערות:</strong> {appointment.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Past Appointments */}
                  {userAppointments.filter(apt => !isFutureAppointment(apt.date)).length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        תורים קודמים ({userAppointments.filter(apt => !isFutureAppointment(apt.date)).length})
                      </h3>
                      <div className="space-y-3">
                        {userAppointments
                          .filter(apt => !isFutureAppointment(apt.date))
                          .map((appointment) => (
                            <Card key={appointment.id} className="border-l-4 border-l-gray-300 opacity-75">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{appointment.service.name}</h4>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-500">תאריך ושעה</p>
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
                                        <p className="text-gray-500">מחיר</p>
                                        <p className="font-medium">₪{appointment.service.price}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="ml-2 h-4 w-4" />
                סגור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

