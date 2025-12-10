'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Clock, Bell } from 'lucide-react'

interface WaitlistFormProps {
  serviceId: string
  serviceName: string
  date: string
  timeSlot: string
  onSuccess?: () => void
}

export function WaitlistForm({ serviceId, serviceName, date, timeSlot, onSuccess }: WaitlistFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleJoinWaitlist = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }

    setLoading(true)
    setError('')

    try {
      const body: any = {
        serviceId,
        date,
      }
      
      // אם יש timeSlot ספציפי - שולחים אותו
      if (timeSlot) {
        body.timeSlot = timeSlot
      }

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'שגיאה בהצטרפות לרשימת המתנה')
      }

      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-green-900 mb-2">נרשמת לרשימת המתנה!</h3>
            <p className="text-sm text-green-700">
              נשלח לך מייל ברגע שיתפנה תור ב{serviceName} בתאריך {new Date(date).toLocaleDateString('he-IL')}
              {timeSlot && ` בשעה ${timeSlot}`}
              {!timeSlot && ' (כל השעות)'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const title = timeSlot ? 'הזמן תפוס' : 'אין שעות פנויות'
  const description = timeSlot 
    ? `השעה ${timeSlot} בתאריך ${new Date(date).toLocaleDateString('he-IL')} תפוסה כרגע`
    : `כל השעות בתאריך ${new Date(date).toLocaleDateString('he-IL')} תפוסות כרגע`

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-amber-700">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">רשימת המתנה</h4>
                <p className="text-sm text-gray-600">
                  הצטרפי לרשימת המתנה ונשלח לך התראה למייל ברגע שמישהי תבטל תור בזמן זה
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleJoinWaitlist}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'מצטרפת...' : 'הצטרפי לרשימת המתנה'}
          </Button>

          {!session && (
            <p className="text-xs text-center text-gray-600">
              * נדרשת התחברות להצטרפות לרשימת המתנה
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

