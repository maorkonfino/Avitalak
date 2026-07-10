'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Phone, Instagram, Facebook } from "lucide-react"
import * as LucideIcons from 'lucide-react'
import { useState, useEffect } from "react"
import Link from "next/link"

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} דק'`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hours = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`
  return m ? `${hours} ${m} דק'` : hours
}

function ServiceIcon({ name }: { name?: string }) {
  const Icon = name ? (LucideIcons as any)[name] ?? LucideIcons.Sparkles : LucideIcons.Sparkles
  return <Icon className="h-5 w-5 text-brand-brown" />
}

const CATEGORIES = [
  { id: 'all',      label: 'כל השירותים' },
  { id: 'גבות',     label: 'גבות' },
  { id: 'ריסים',    label: 'ריסים' },
  { id: 'ציפורניים', label: 'ציפורניים' },
  { id: 'חבילות',   label: 'חבילות' },
  { id: 'מיוחדים',  label: 'מיוחדים' },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => { setServices(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory)

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <img
          src="/avital-photo.avif"
          alt="אביטל אברמוב קונפינו"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

        <div className="relative z-10 text-center px-4 animate-fade-in">
          <img
            src="/logo.avif"
            alt="avital"
            className="h-28 md:h-36 w-auto mx-auto mb-3 drop-shadow-lg"
          />
          <p className="text-white/90 text-lg md:text-xl tracking-widest mb-10 drop-shadow">
            כשהיופי טבעי לך
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base h-12 px-8 shadow-lg" asChild>
              <Link href="/dashboard/book">
                <Calendar className="ml-2 h-5 w-5" />
                קביעת תור
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12 px-8 bg-white/20 border-white text-white hover:bg-white/30 hover:text-white"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              קצת עליי
            </Button>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-5 text-[hsl(var(--foreground))] leading-relaxed order-2 md:order-1">
              <h2 className="text-4xl font-semibold text-brand-brown-dark mb-6">נעים להכיר,</h2>
              <p>
                אביטל אברמוב קונפינו, אומנית שמתעסקת בטיפוח הציפורניים, הגבות והריסים.
                פרפקציוניסטית שלא מתפשרת על איכות, אסתטיקה וסטריליות.
              </p>
              <p>
                אביטל התחילה להתעסק בתחום הגבות לפני 15 שנים, אחרי שהרסו לה את הגבות,
                ומאז הפכה לאחראית על שיקום הגבות של כל הסובבים אותה.
                את העסק פתחה ב-2016 כדי לעסוק בתחום הציפורניים.
              </p>
              <p>
                היום היא מעצבת גבות במראה טבעי בשיטת המיקרובליידינג ועובדת בשיטה של בניה
                משקמת לציפורניים פגועות — והצליחה לעזור לעשרות נשים לגלות את היד הנשית
                שתמיד חלמו עליה.
              </p>
              <p className="text-brand-brown font-medium">
                בנוסף — טיפולי הרמת גבות, הרמת ריסים, ולק ג&apos;ל עם תיקון מבנה אנטומי.
                לאביטל תואר ראשון בחינוך ותעודת הוראה, והיא מעבירה השתלמויות במכללות
                ובקליניקה הפרטית שלה.
              </p>
              <div className="pt-2">
                <Button asChild>
                  <a href="tel:054-6714655">
                    <Phone className="ml-2 h-4 w-4" />
                    054-6714655
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/avital-photo.avif"
                  alt="אביטל אברמוב קונפינו"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4 bg-brand-cream/60">
        <div className="container mx-auto">
          <h2 className="text-4xl font-semibold text-center text-brand-brown-dark mb-3">קביעת תור</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            בחרי שירות ותאמי תור ישירות מהאתר
          </p>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-brand-brown text-white border-brand-brown shadow'
                    : 'bg-white text-brand-brown border-brand-beige hover:border-brand-brown/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-brown border-t-transparent mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">טוענת שירותים...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">אין שירותים בקטגוריה זו</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {filtered.map(service => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-brand-beige/70 hover:border-brand-brown/30 hover:shadow-md transition-all p-5 flex flex-col gap-4"
                >
                  {/* Name */}
                  <p className="font-semibold text-[15px] leading-snug text-right text-foreground">
                    {service.name}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-brand-beige/60" />

                  {/* Footer row */}
                  <div className="flex items-center justify-between">
                    <Button size="sm" className="rounded-full px-5" asChild>
                      <Link href="/dashboard/book">קבעי תור</Link>
                    </Button>
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-brown leading-none">₪{service.price}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <img src="/logo.avif" alt="avital" className="h-16 w-auto mx-auto mb-6 opacity-80" />
          <p className="text-muted-foreground mb-8 text-base">
            רוצה לקבוע תור, לשאול שאלה, או סתם להתייעץ? אני כאן בשבילך.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href="https://wa.me/9720546714655" target="_blank" rel="noreferrer">
                <Phone className="ml-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://www.instagram.com/avital_ak" target="_blank" rel="noreferrer">
                <Instagram className="ml-2 h-4 w-4" />
                אינסטגרם
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://www.facebook.com/avitalak" target="_blank" rel="noreferrer">
                <Facebook className="ml-2 h-4 w-4" />
                פייסבוק
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
