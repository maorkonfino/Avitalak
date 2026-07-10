'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Users, Settings, BarChart, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  todayAppointments: number
  pendingAppointments: number
  totalUsers: number
  totalServices: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ todayAppointments: 0, pendingAppointments: 0, totalUsers: 0, totalServices: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(setStats)
        .catch(() => {})
    }
  }, [status, session])

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-brown border-t-transparent" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const statCards = [
    { label: 'תורים היום',       value: stats.todayAppointments,  icon: CalendarIcon },
    { label: 'ממתינים לאישור',   value: stats.pendingAppointments, icon: Clock },
    { label: 'סך לקוחות',        value: stats.totalUsers,          icon: Users },
    { label: 'שירותים פעילים',   value: stats.totalServices,       icon: CheckCircle },
  ]

  const actionCards = [
    { title: 'לוח שנה',         desc: 'כל התורים בתצוגת לוח',      href: '/admin/calendar',     icon: CalendarIcon, primary: true },
    { title: 'ניהול תורים',     desc: 'אישור, עדכון וביטול תורים', href: '/admin/appointments', icon: Clock,        primary: true },
    { title: 'ניהול לקוחות',    desc: 'צפייה וניהול לקוחות',       href: '/admin/users',        icon: Users,        primary: false },
    { title: 'ניהול שירותים',   desc: 'עריכת שירותים ומחירים',     href: '/admin/services',     icon: Settings,     primary: false },
    { title: 'רשימת המתנה',     desc: 'לקוחות בהמתנה לתור',       href: '/admin/waitlist',     icon: Clock,        primary: false },
    { title: 'הגדרות',          desc: 'הגדרות כלליות ותזכורות',    href: '/admin/settings',     icon: Settings,     primary: false },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">פאנל ניהול</h1>
        <p className="text-muted-foreground">ברוך הבא, {session.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-3xl font-bold text-brand-brown">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {actionCards.map(({ title, desc, href, icon: Icon, primary }) => (
          <Card key={href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-11 h-11 rounded-full bg-brand-cream flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-brand-brown" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant={primary ? 'default' : 'outline'} asChild>
                <Link href={href}>{title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
