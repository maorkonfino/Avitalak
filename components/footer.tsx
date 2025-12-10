import { Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <img 
              src="/logo.avif" 
              alt="אביטל אברמוב קונפינו" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              אומנית המתעסקת בטיפוח הציפורניים, הגבות והריסים.
              פרפקציוניסטית שלא מתפשרת על איכות, אסתטיקה וסטריליות.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">צור קשר</h3>
            <div className="space-y-2">
              <a 
                href="tel:054-6714655" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                054-6714655
              </a>
              <a 
                href="mailto:avital546@gmail.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                avital546@gmail.com
              </a>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">שירותים</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>מיקרובליידינג</li>
              <li>הרמת גבות וריסים</li>
              <li>סידור וצביעת גבות</li>
              <li>בניית ציפורניים</li>
              <li>לק ג׳ל מבנה אנטומי</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} אביטל אברמוב קונפינו. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}

