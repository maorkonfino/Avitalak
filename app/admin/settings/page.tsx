'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Settings, Mail, Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsData {
  id?: string
  newAppointmentEmailSubject: string
  newAppointmentEmailBody: string
  updatedAppointmentEmailSubject: string
  updatedAppointmentEmailBody: string
  cancelledAppointmentEmailSubject: string
  cancelledAppointmentEmailBody: string
  reminderEmailSubject: string
  reminderEmailBody: string
  waitlistNotificationSubject: string
  waitlistNotificationBody: string
}

const DEFAULT_SETTINGS: SettingsData = {
  newAppointmentEmailSubject: "אישור קביעת תור - Avital Ak",
  newAppointmentEmailBody: "שלום {{customerName}},\n\nהתור שלך נקבע בהצלחה!\n\nפרטי התור:\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n💅 שירות: {{serviceName}}\n⏱️ משך: {{duration}} דקות\n💰 מחיר: ₪{{price}}\n\nנתראה בקרוב!\nאביטל",
  updatedAppointmentEmailSubject: "עדכון תור - Avital Ak",
  updatedAppointmentEmailBody: "שלום {{customerName}},\n\nהתור שלך עודכן!\n\nפרטי התור החדשים:\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n💅 שירות: {{serviceName}}\n⏱️ משך: {{duration}} דקות\n\nנתראה בקרוב!\nאביטל",
  cancelledAppointmentEmailSubject: "ביטול תור - Avital Ak",
  cancelledAppointmentEmailBody: "שלום {{customerName}},\n\nהתור שלך בוטל.\n\nפרטי התור:\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n💅 שירות: {{serviceName}}\n\nניתן לקבוע תור חדש דרך האתר.\n\nאביטל",
  reminderEmailSubject: "תזכורת לתור מחר - Avital Ak",
  reminderEmailBody: "שלום {{customerName}},\n\nרצינו להזכיר לך שיש לך תור מחר!\n\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n💅 שירות: {{serviceName}}\n⏱️ משך: {{duration}} דקות\n\nמחכה לראות אותך!\nאביטל",
  waitlistNotificationSubject: "תור התפנה! - Avital Ak",
  waitlistNotificationBody: "שלום {{customerName}},\n\n🎉 יש חדשות טובות! תור התפנה!\n\n📅 תאריך: {{date}}\n💅 שירות: {{serviceName}}\n\nמהרי להיכנס לאתר ולקבוע את התור לפני שהוא יילקח.\n\nאביטל",
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadSettings()
    }
  }, [session])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('שגיאה בטעינת הגדרות')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('ההגדרות נשמרו בהצלחה!')
      } else {
        toast.error('שגיאה בשמירת הגדרות')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('שגיאה בשמירת הגדרות')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את ההגדרות לברירת המחדל?')) {
      setSettings(DEFAULT_SETTINGS)
      toast.info('ההגדרות אופסו. לחץ "שמור" כדי לשמור את השינויים.')
    }
  }

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען הגדרות...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8" />
              הגדרות מערכת
            </h1>
            <p className="text-muted-foreground">
              ניהול תבניות הודעות דוא"ל ותזכורות
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="ml-2 h-4 w-4" />
              איפוס לברירת מחדל
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="ml-2 h-4 w-4" />
              {isSaving ? 'שומר...' : 'שמור הגדרות'}
            </Button>
          </div>
        </div>

        {/* Available Variables Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 משתנים זמינים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><code className="bg-white px-2 py-1 rounded">{'{{customerName}}'}</code> - שם הלקוח</div>
              <div><code className="bg-white px-2 py-1 rounded">{'{{date}}'}</code> - תאריך התור</div>
              <div><code className="bg-white px-2 py-1 rounded">{'{{time}}'}</code> - שעת התור</div>
              <div><code className="bg-white px-2 py-1 rounded">{'{{serviceName}}'}</code> - שם השירות</div>
              <div><code className="bg-white px-2 py-1 rounded">{'{{duration}}'}</code> - משך הטיפול</div>
              <div><code className="bg-white px-2 py-1 rounded">{'{{price}}'}</code> - מחיר</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* New Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                אישור תור חדש
              </CardTitle>
              <CardDescription>
                הודעה שתישלח ללקוח לאחר קביעת תור חדש
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newAppointmentSubject">נושא המייל</Label>
                <Input
                  id="newAppointmentSubject"
                  value={settings.newAppointmentEmailSubject}
                  onChange={(e) => handleChange('newAppointmentEmailSubject', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newAppointmentBody">תוכן ההודעה</Label>
                <Textarea
                  id="newAppointmentBody"
                  value={settings.newAppointmentEmailBody}
                  onChange={(e) => handleChange('newAppointmentEmailBody', e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Updated Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                עדכון תור
              </CardTitle>
              <CardDescription>
                הודעה שתישלח ללקוח כאשר תור עודכן
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="updatedAppointmentSubject">נושא המייל</Label>
                <Input
                  id="updatedAppointmentSubject"
                  value={settings.updatedAppointmentEmailSubject}
                  onChange={(e) => handleChange('updatedAppointmentEmailSubject', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="updatedAppointmentBody">תוכן ההודעה</Label>
                <Textarea
                  id="updatedAppointmentBody"
                  value={settings.updatedAppointmentEmailBody}
                  onChange={(e) => handleChange('updatedAppointmentEmailBody', e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cancelled Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-600" />
                ביטול תור
              </CardTitle>
              <CardDescription>
                הודעה שתישלח ללקוח כאשר תור בוטל
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cancelledAppointmentSubject">נושא המייל</Label>
                <Input
                  id="cancelledAppointmentSubject"
                  value={settings.cancelledAppointmentEmailSubject}
                  onChange={(e) => handleChange('cancelledAppointmentEmailSubject', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cancelledAppointmentBody">תוכן ההודעה</Label>
                <Textarea
                  id="cancelledAppointmentBody"
                  value={settings.cancelledAppointmentEmailBody}
                  onChange={(e) => handleChange('cancelledAppointmentEmailBody', e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                תזכורת לתור
              </CardTitle>
              <CardDescription>
                הודעת תזכורת שתישלח יום לפני התור
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reminderSubject">נושא המייל</Label>
                <Input
                  id="reminderSubject"
                  value={settings.reminderEmailSubject}
                  onChange={(e) => handleChange('reminderEmailSubject', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reminderBody">תוכן ההודעה</Label>
                <Textarea
                  id="reminderBody"
                  value={settings.reminderEmailBody}
                  onChange={(e) => handleChange('reminderEmailBody', e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Waitlist Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-600" />
                התפנה מקום ברשימת המתנה
              </CardTitle>
              <CardDescription>
                הודעה שתישלח כאשר מקום מתפנה ברשימת ההמתנה
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="waitlistSubject">נושא המייל</Label>
                <Input
                  id="waitlistSubject"
                  value={settings.waitlistNotificationSubject}
                  onChange={(e) => handleChange('waitlistNotificationSubject', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="waitlistBody">תוכן ההודעה</Label>
                <Textarea
                  id="waitlistBody"
                  value={settings.waitlistNotificationBody}
                  onChange={(e) => handleChange('waitlistNotificationBody', e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button at Bottom */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="ml-2 h-4 w-4" />
            איפוס לברירת מחדל
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="ml-2 h-4 w-4" />
            {isSaving ? 'שומר...' : 'שמור הגדרות'}
          </Button>
        </div>
      </div>
    </div>
  )
}


