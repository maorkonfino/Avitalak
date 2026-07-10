import { Button } from '@/components/ui/button'
import { Phone, Instagram } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
      <h1 className="text-4xl font-semibold text-brand-brown-dark mb-4">קורסים והדרכות</h1>
      <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
        אביטל מעבירה הדרכות והשתלמויות מקצועיות — גבות, ריסים וציפורניים.
        לאביטל תואר ראשון בחינוך ותעודת הוראה, וניסיון עשיר בהוראה במכללות
        ובקליניקה הפרטית שלה.
      </p>
      <p className="text-muted-foreground mb-10">
        לפרטים על הקורסים הקרובים, תכנים, מחירים וזמינות — צרי קשר ישירות.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <a href="https://wa.me/9720546714655" target="_blank" rel="noreferrer">
            <Phone className="ml-2 h-4 w-4" />
            שלחי הודעה ב-WhatsApp
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://www.instagram.com/avital_ak" target="_blank" rel="noreferrer">
            <Instagram className="ml-2 h-4 w-4" />
            פרטים באינסטגרם
          </a>
        </Button>
      </div>
    </div>
  )
}
