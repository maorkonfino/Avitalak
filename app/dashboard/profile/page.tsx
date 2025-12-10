'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, Lock, Save, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [status, session, router])

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/users/${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded user data:', data) // Debug log
          setUserData(data)
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          })
        } else {
          console.error('Failed to load user data:', response.status)
          toast.error('שגיאה בטעינת פרטי משתמש')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        toast.error('שגיאה בטעינת פרטי משתמש')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      loadUserData()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password fields if changing password
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        toast.error('נא להזין את הסיסמה הנוכחית')
        return
      }
      if (!formData.newPassword) {
        toast.error('נא להזין סיסמה חדשה')
        return
      }
      if (formData.newPassword.length < 6) {
        toast.error('הסיסמה החדשה חייבת להכיל לפחות 6 תווים')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('הסיסמאות אינן תואמות')
        return
      }
    }

    setIsSaving(true)

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }

      if (showPasswordFields && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.password = formData.newPassword
      }

      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        // Update session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedUser.name,
            email: updatedUser.email,
          }
        })

        toast.success('הפרופיל עודכן בהצלחה!')
        
        // Update form data with new values
        setFormData(prev => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
        
        // Hide password fields
        if (showPasswordFields) {
          setShowPasswordFields(false)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'שגיאה בעדכון הפרופיל')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('שגיאה בעדכון הפרופיל')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
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
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לאזור האישי
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">עריכת פרופיל</CardTitle>
            <CardDescription>
              עדכני את הפרטים האישיים שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">פרטים אישיים</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">שם מלא *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="הזיני את שמך המלא"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">אימייל *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="הזיני את כתובת המייל שלך"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="הזיני מספר טלפון"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">שינוי סיסמה</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    disabled={isSaving}
                  >
                    <Lock className="ml-2 h-4 w-4" />
                    {showPasswordFields ? 'ביטול' : 'שנה סיסמה'}
                  </Button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">סיסמה נוכחית *</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="הזיני את הסיסמה הנוכחית"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">סיסמה חדשה *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="הזיני סיסמה חדשה (לפחות 6 תווים)"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">אימות סיסמה חדשה *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="הזיני את הסיסמה החדשה שוב"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      שמור שינויים
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSaving}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        {userData && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>תאריך הצטרפות: {new Date(userData.createdAt).toLocaleDateString('he-IL')}</p>
                <p>סוג חשבון: {userData.role === 'ADMIN' ? 'מנהל' : 'משתמש'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

