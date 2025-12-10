'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, Settings, Clock } from 'lucide-react'
import Link from 'next/link'
import moment from 'moment'
import 'moment/locale/he'

moment.locale('he')

interface Appointment {
  id: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  service: {
    name: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      loadAppointments()
    }
  }, [session])

  const loadAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">שלום, {session.user.name}!</h1>
          <p className="text-muted-foreground">ברוכה הבאה לאזור האישי שלך</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>התורים שלי</CardTitle>
              <CardDescription>
                צפי וניהול התורים שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/appointments">
                  צפייה בתורים
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>קביעת תור חדש</CardTitle>
              <CardDescription>
                קבעי תור לטיפול הבא
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/book">
                  קביעת תור
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>הפרופיל שלי</CardTitle>
              <CardDescription>
                עדכון פרטים אישיים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/profile">
                  עריכת פרופיל
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? '...' : appointments.filter(apt => 
                    (apt.status === 'PENDING' || apt.status === 'CONFIRMED') && 
                    moment(apt.date).isAfter(moment())
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">תורים פעילים</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? '...' : appointments.filter(apt => apt.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-muted-foreground">תורים שהושלמו</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1 hover:shadow-lg transition-shadow border-2 border-brand-brown/20">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">...</div>
                  <div className="text-sm text-muted-foreground">תור הבא</div>
                </div>
              ) : (() => {
                const nextApt = appointments
                  .filter(apt => 
                    (apt.status === 'PENDING' || apt.status === 'CONFIRMED') && 
                    moment(apt.date).isAfter(moment())
                  )
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))[0]
                
                if (!nextApt) {
                  return (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">-</div>
                      <div className="text-sm text-muted-foreground">תור הבא</div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-2" dir="rtl">
                    <div className="text-sm font-semibold text-muted-foreground mb-3 text-right">תור הבא</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-right">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">טיפול:</span>
                        <span className="font-semibold text-primary">{nextApt.service.name}</span>
                      </div>
                      <div className="flex items-start gap-2 text-right">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">תאריך:</span>
                        <span className="font-semibold">{moment(nextApt.date).format('dddd, DD/MM/YYYY')}</span>
                      </div>
                      <div className="flex items-start gap-2 text-right">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">שעה:</span>
                        <span className="font-semibold">{moment(nextApt.date).format('HH:mm')}</span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 text-right">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">סטטוס:</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          nextApt.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {nextApt.status === 'CONFIRMED' ? 'מאושר' : 'ממתין לאישור'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

