'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'

type Status = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface Appointment {
  id: string
  date: string
  endDate: string
  status: string
  notes?: string
  user: { name: string; phone?: string; email: string }
  service: { name: string; duration: number; price: number }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'ממתין',
  CONFIRMED: 'מאושר',
  COMPLETED: 'הושלם',
  CANCELLED: 'בוטל',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const FILTER_TABS: { value: Status; label: string }[] = [
  { value: 'ALL',       label: 'הכל' },
  { value: 'PENDING',   label: 'ממתינים' },
  { value: 'CONFIRMED', label: 'מאושרים' },
  { value: 'COMPLETED', label: 'הושלמו' },
  { value: 'CANCELLED', label: 'בוטלו' },
]

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'ALL' ? `?status=${filter}` : ''
      const res = await fetch(`/api/appointments${params}`)
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch {
      toast.error('שגיאה בטעינת התורים')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') load()
  }, [status, session, load])

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('הסטטוס עודכן')
      await load()
    } catch {
      toast.error('שגיאה בעדכון הסטטוס')
    } finally {
      setUpdating(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-brown border-t-transparent" />
      </div>
    )
  }
  if (!session || session.user.role !== 'ADMIN') return null

  const displayed = appointments

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">ניהול תורים</h1>
        <p className="text-muted-foreground">אישור, עדכון וביטול תורים</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === tab.value
                ? 'bg-brand-brown text-white border-brand-brown'
                : 'bg-white text-brand-brown border-brand-beige hover:border-brand-brown/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-brown border-t-transparent mx-auto" />
        </div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            אין תורים בקטגוריה זו
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map(appt => (
            <Card key={appt.id} className={`transition-opacity ${updating === appt.id ? 'opacity-60' : ''}`}>
              <CardContent className="py-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold">{appt.user.name}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[appt.status] ?? ''}`}
                      >
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appt.service.name} · {formatDateTime(new Date(appt.date))} · {appt.service.duration} דק&apos; · ₪{appt.service.price}
                    </p>
                    {appt.user.phone && (
                      <a href={`tel:${appt.user.phone}`} className="text-xs text-brand-brown hover:underline">
                        {appt.user.phone}
                      </a>
                    )}
                    {appt.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {appt.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                          disabled={updating === appt.id}
                        >
                          <Check className="h-4 w-4 ml-1" />
                          אשרי
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                          disabled={updating === appt.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(appt.id, 'COMPLETED')}
                          disabled={updating === appt.id}
                        >
                          הושלם
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                          disabled={updating === appt.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {appt.status === 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(appt.id, 'PENDING')}
                        disabled={updating === appt.id}
                      >
                        <RotateCcw className="h-4 w-4 ml-1" />
                        שחזרי
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
