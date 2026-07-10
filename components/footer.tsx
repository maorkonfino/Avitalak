import { Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-brand-beige/60 bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <img src="/logo.avif" alt="avital" className="h-12 w-auto mb-3 opacity-90" />
            <p className="text-xs tracking-widest text-brand-brown/70 mb-3">כשהיופי טבעי לך</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              אומנית המתעסקת בטיפוח הציפורניים, הגבות והריסים.
              פרפקציוניסטית שלא מתפשרת על איכות ואסתטיקה.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">צרי קשר</h3>
            <div className="space-y-3">
              <a
                href="tel:054-6714655"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-brand-brown transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                054-6714655
              </a>
              <a
                href="https://wa.me/9720546714655"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-brand-brown transition-colors"
              >
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                WhatsApp
              </a>
              <a
                href="mailto:avital546@gmail.com"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-brand-brown transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                avital546@gmail.com
              </a>
            </div>
          </div>

          {/* Social + quick links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">עקבי אחריי</h3>
            <div className="flex gap-4 mb-6">
              <a
                href="https://www.instagram.com/avital_ak"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-brand-beige flex items-center justify-center text-muted-foreground hover:text-brand-brown hover:border-brand-brown transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/avitalak"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-brand-beige flex items-center justify-center text-muted-foreground hover:text-brand-brown hover:border-brand-brown transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#services" className="hover:text-brand-brown transition-colors">קביעת תור</Link></li>
              <li><Link href="/courses" className="hover:text-brand-brown transition-colors">קורסים והדרכות</Link></li>
              <li><Link href="/#about" className="hover:text-brand-brown transition-colors">אודות</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-beige/60 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} אביטל אברמוב קונפינו. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  )
}
