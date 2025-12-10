'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!formData.email || !formData.password) {
      setError('נא למלא את כל השדות')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Translate error to Hebrew
        if (result.error === 'CredentialsSignin' || result.error === 'Invalid credentials') {
          setError('אימייל או סיסמה שגויים')
        } else {
          setError('שגיאה בהתחברות, נסי שוב')
        }
      } else if (result?.ok) {
        // Check user role and redirect accordingly
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        
        if (session?.user?.role === 'ADMIN') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      setError('שגיאת חיבור, בדקי את החיבור לאינטרנט')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-cream via-background to-brand-beige/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <img 
              src="/logo.avif" 
              alt="אביטל אברמוב קונפינו" 
              className="h-20 w-auto mx-auto"
            />
          </div>
          <CardTitle className="text-2xl">התחברות</CardTitle>
          <CardDescription>
            היכנסי לאזור האישי שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="הזיני את כתובת המייל שלך"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="הזיני את הסיסמה שלך"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחברות'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              עדיין אין לך חשבון?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                הירשמי כאן
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

