'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Home, Menu, X, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur shadow-md" 
        : "bg-white/60 backdrop-blur-sm"
    )}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="/logo.avif" 
            alt="אביטל אברמוב קונפינו" 
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-brand-brown",
              pathname === '/' ? 'text-brand-brown' : 'text-gray-600'
            )}
          >
            דף בית
          </Link>
          
          {mounted && session && (
            <Link
              href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-brown",
                pathname?.startsWith(session.user.role === 'ADMIN' ? '/admin' : '/dashboard') 
                  ? 'text-brand-brown' 
                  : 'text-gray-600'
              )}
            >
              {session.user.role === 'ADMIN' ? 'ניהול' : 'אזור אישי'}
            </Link>
          )}
          
          {mounted && session && session.user.role === 'ADMIN' && (
            <Link
              href="/admin/calendar"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-brown flex items-center gap-1",
                pathname === '/admin/calendar' ? 'text-brand-brown' : 'text-gray-600'
              )}
            >
              <Calendar className="h-4 w-4" />
              לוח שנה
            </Link>
          )}
          
          {mounted && session && session.user.role !== 'ADMIN' && (
            <Link
              href="/dashboard/appointments"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-brown flex items-center gap-1",
                pathname === '/dashboard/appointments' ? 'text-brand-brown' : 'text-gray-600'
              )}
            >
              <Calendar className="h-4 w-4" />
              התורים שלי
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && session && (
            <>
              <div className="text-sm text-gray-700 ml-2 pl-3 border-r border-gray-300">
                שלום, <strong className="text-brand-brown">{session.user.name?.split(' ')[0]}</strong>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="ml-2 h-4 w-4" />
                יציאה
              </Button>
            </>
          )}
          
          {mounted && !session && status !== 'loading' && (
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-medium w-full py-2 hover:text-brand-brown transition-colors"
            >
              <Home className="h-5 w-5" />
              דף בית
            </Link>

            {mounted && session && (
              <Link
                href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-medium w-full py-2 hover:text-brand-brown transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                {session.user.role === 'ADMIN' ? 'ניהול' : 'אזור אישי'}
              </Link>
            )}

            {mounted && session && session.user.role === 'ADMIN' && (
              <Link
                href="/admin/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-medium w-full py-2 hover:text-brand-brown transition-colors"
              >
                <Calendar className="h-5 w-5" />
                לוח שנה
              </Link>
            )}

            {mounted && session && session.user.role !== 'ADMIN' && (
              <Link
                href="/dashboard/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-medium w-full py-2 hover:text-brand-brown transition-colors"
              >
                <Calendar className="h-5 w-5" />
                התורים שלי
              </Link>
            )}

            <div className="pt-4 border-t space-y-2">
              {mounted && session && (
                <>
                  <div className="text-center py-2 text-sm text-gray-700">
                    שלום, <strong className="text-brand-brown">{session.user.name}</strong>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    יציאה
                  </Button>
                </>
              )}
              
              {mounted && !session && (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="ml-2 h-4 w-4" />
                      התחברות
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <User className="ml-2 h-4 w-4" />
                      הרשמה
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
