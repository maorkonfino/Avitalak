'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, X, Mail } from 'lucide-react'

interface WaitlistEntry {
  id: string
  date: string
  timeSlot: string
  notified: boolean
  active: boolean
  createdAt: string
  user: {
    name: string
    email: string
    phone: string
  }
  service: {
    name: string
    duration: number
  }
}

export default function AdminWaitlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    } else {
      loadWaitlist()
    }
  }, [status, session, router])

  const loadWaitlist = async () => {
    try {
      const response = await fetch('/api/waitlist')
      if (response.ok) {
        const data = await response.json()
        setWaitlist(data)
      }
    } catch (error) {
      console.error('Error loading waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('האם למחוק ממחרשימת המתנה?')) return

    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadWaitlist()
      }
    } catch (error) {
      console.error('Error removing from waitlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">רשימת המתנה</h1>
        <p className="text-gray-600">
          לקוחות שממתינות לזמן תור ספציפי
        </p>
      </div>

      {waitlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            אין לקוחות ברשימת המתנה כרגע
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {waitlist.map((entry) => (
            <Card key={entry.id} className={entry.notified ? 'bg-green-50 border-green-200' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{entry.service.name}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>תאריך:</strong>{' '}
                        {new Date(entry.date).toLocaleDateString('he-IL')} בשעה {entry.timeSlot}
                      </p>
                      <p>
                        <strong>לקוחה:</strong> {entry.user.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {entry.user.email}
                      </p>
                      {entry.user.phone && (
                        <p>
                          <strong>טלפון:</strong> {entry.user.phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        נרשמה: {new Date(entry.createdAt).toLocaleString('he-IL')}
                      </p>
                      {entry.notified && (
                        <p className="text-xs text-green-600 font-semibold">
                          ✓ נשלחה התראה
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(entry.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


