'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Menu, X, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',          label: 'דף בית' },
  { href: '/#services', label: 'קביעת תור' },
  { href: '/courses',   label: 'קורסים' },
  { href: '/#about',    label: 'עלי' },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href.split('#')[0] || '')

  return (
    <nav className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300 border-b',
      scrolled
        ? 'bg-[hsl(var(--background))]/95 backdrop-blur shadow-sm border-brand-beige'
        : 'bg-[hsl(var(--background))]/80 backdrop-blur-sm border-transparent',
    )}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity">
          <img src="/logo.avif" alt="avital" className="h-12 w-auto" />
          <span className="text-[10px] tracking-widest text-brand-brown/70 mt-0.5">כשהיופי טבעי לך</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm transition-colors hover:text-brand-brown',
                isActive(link.href) ? 'text-brand-brown font-medium' : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              {link.label}
            </Link>
          ))}

          {mounted && session && (
            <Link
              href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className={cn(
                'text-sm transition-colors hover:text-brand-brown flex items-center gap-1',
                pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')
                  ? 'text-brand-brown font-medium'
                  : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              {session.user.role === 'ADMIN' ? 'ניהול' : 'אזור אישי'}
            </Link>
          )}

          {mounted && session?.user.role === 'ADMIN' && (
            <Link
              href="/admin/calendar"
              className={cn(
                'text-sm transition-colors hover:text-brand-brown flex items-center gap-1',
                pathname === '/admin/calendar' ? 'text-brand-brown font-medium' : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              <Calendar className="h-4 w-4" />
              לוח שנה
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && session ? (
            <>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                שלום, <strong className="text-brand-brown">{session.user.name?.split(' ')[0]}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="ml-2 h-4 w-4" />
                יציאה
              </Button>
            </>
          ) : mounted && status !== 'loading' ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="ml-2 h-4 w-4" />
                  התחברות
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">
                  <User className="ml-2 h-4 w-4" />
                  הרשמה
                </Link>
              </Button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-beige/60 bg-[hsl(var(--background))]/98 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-2.5 text-sm font-medium hover:text-brand-brown transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {mounted && session && (
              <Link
                href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-medium hover:text-brand-brown transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                {session.user.role === 'ADMIN' ? 'ניהול' : 'אזור אישי'}
              </Link>
            )}

            <div className="pt-4 border-t border-brand-beige/60 space-y-2">
              {mounted && session ? (
                <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}>
                  <LogOut className="ml-2 h-4 w-4" />
                  יציאה
                </Button>
              ) : mounted ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <LogIn className="ml-2 h-4 w-4" />
                      התחברות
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <User className="ml-2 h-4 w-4" />
                      הרשמה
                    </Link>
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
