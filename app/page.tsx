'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Sparkles, Star, Heart, Award, Users, Clock, ChevronLeft } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const features = [
    {
      title: "מיקרובליידינג",
      description: "עיצוב וכתיבת גבות במראה טבעי בשיטת המיקרובליידינג",
      icon: Sparkles,
    },
    {
      title: "הרמת גבות וריסים",
      description: "טיפולי הרמת גבות וריסים למראה מושלם ומטופח",
      icon: Star,
    },
    {
      title: "בניית ציפורניים",
      description: "בניה משקמת לציפורניים פגועות ולק ג'ל מבנה אנטומי",
      icon: Check,
    },
  ];

  const categories = [
    { id: 'all', name: 'הכל' },
    { id: 'brows', name: 'גבות' },
    { id: 'lashes', name: 'ריסים' },
    { id: 'nails', name: 'ציפורניים' },
    { id: 'packages', name: 'חבילות' },
  ]

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading services:', err)
        setLoading(false)
      })
  }, [])

  const categoryMap: {[key: string]: string} = {
    'all': 'all',
    'brows': 'גבות',
    'lashes': 'ריסים',
    'nails': 'ציפורניים',
    'packages': 'חבילות',
  }

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === categoryMap[selectedCategory])

  const getIcon = (iconName?: string) => {
    if (!iconName) {
      return <Sparkles className="h-5 w-5 text-brand-brown" />
    }
    
    const Icon = (LucideIcons as any)[iconName]
    if (!Icon) {
      console.warn(`Icon "${iconName}" not found in lucide-react, using Sparkles as fallback`)
      return <Sparkles className="h-5 w-5 text-brand-brown" />
    }
    
    return <Icon className="h-5 w-5 text-brand-brown" />
  }

  const stats = [
    { icon: Users, value: "1000+", label: "לקוחות מרוצות" },
    { icon: Award, value: "15", label: "שנות ניסיון" },
    { icon: Star, value: "5.0", label: "דירוג ממוצע" },
    { icon: Heart, value: "100%", label: "שביעות רצון" },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-background to-brand-beige/30" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/logo.avif" 
                alt="אביטל אברמוב קונפינו" 
                className="h-32 md:h-40 w-auto mx-auto"
              />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown-dark bg-clip-text text-transparent">
              אביטל אברמוב קונפינו
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              אומנית המתעסקת בטיפוח הציפורניים, הגבות והריסים
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              פרפקציוניסטית שלא מתפשרת על איכות, אסתטיקה וסטריליות
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => {
                  window.location.href = '/dashboard/book'
                }}
              >
                <Calendar className="ml-2 h-5 w-5" />
                קביעת תור
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8"
                onClick={() => {
                  const element = document.getElementById('about')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                למידע נוסף
                <ChevronLeft className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-primary">נעים להכיר</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  אביטל אברמוב קונפינו, אומנית שמתעסקת בטיפוח הציפורניים, הגבות והריסים. 
                  פרפקציוניסטית שלא מתפשרת על איכות, אסתטיקה וסטריליות. שמה לה למטרה 
                  לטפל ולשרת ברמה גבוהה לכל לקוחה ותלמידה.
                </p>
                <p>
                  אביטל התחילה להתעסק בתחום הגבות לפני 15 שנים, אחרי שהרסו לה את הגבות, 
                  ומאז הפכה לאחראית על שיקום הגבות של כל הסובבים אותה. את העסק פתחה ב-2016 
                  כדי לעסוק בתחום הציפורניים.
                </p>
                <p>
                  היום היא מעצבת ויוצרת גבות במראה טבעי בשיטת המיקרובליידינג. בתחום 
                  הציפורניים היא עובדת בשיטה של בניה משקמת לציפורניים פגועות והצליחה לעזור 
                  לעשרות נשים להפסיק לכסוס ציפורניים ולגלות את היד הנשית שתמיד חלמו עליה.
                </p>
                <p className="font-semibold text-foreground">
                  מה עוד היא עושה בקליניקה?
                </p>
                <p>
                  טיפולי הרמת גבות לתיקון צמיחה הפוכה, עיבוי והחלקת שיערות קופצות. טיפולי 
                  הרמת ריסים ולק ג'ל עם תיקון מבנה אנטומי.
                </p>
                <p>
                  את הידע שלה היא גם מעבירה הלאה. לאביטל יש תואר ראשון בחינוך ותעודת הוראה 
                  והיא מעבירה הדרכות והשתלמויות במכללות ובקליניקה הפרטית שלה.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/avital-photo.avif" 
                  alt="אביטל אברמוב קונפינו" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end pointer-events-none">
                  <div className="p-8 text-white w-full">
                    <p className="text-2xl font-bold mb-2">
                      אביטל אברמוב קונפינו
                    </p>
                    <p className="text-white/90">
                      מוכנה להגשים לך חלום לגבות מושלמות, 
                      ריסים מהפנטות וידיים מטופחות ונשיות
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">התמחויות</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            שלושת תחומי ההתמחות שלנו שבהם אנו מעניקות שירות ברמה הגבוהה ביותר
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-brown/10 to-brand-gold/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section id="services" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">השירותים שלנו</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            מגוון רחב של טיפולים ושירותים ברמה המקצועית הגבוהה ביותר
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">טוען שירותים...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">אין שירותים זמינים בקטגוריה זו</p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-brown/10 to-brand-gold/10 flex items-center justify-center">
                        {getIcon(service.icon)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} דקות</span>
                      </div>
                      {service.description && (
                        <p className="mt-2 text-sm">{service.description}</p>
                      )}
                    </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      ₪{service.price}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = '/dashboard/book'}
                    >
                      קביעת תור
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
