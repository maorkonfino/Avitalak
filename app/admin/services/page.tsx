'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface Service {
  id: string
  name: string
  nameEn?: string
  description?: string
  duration: number
  price: number
  category: string
  icon?: string
  active: boolean
  availableDays: string
  startTime: string
  endTime: string
}

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const CATEGORIES = ['גבות', 'ריסים', 'ציפורניים', 'חבילות', 'מיוחדים']
const POPULAR_ICONS = ['Sparkles', 'Eye', 'Hand', 'Package', 'Heart', 'Star', 'Gem', 'Scissors', 'ArrowUp', 'Droplet', 'Stars', 'PlusCircle', 'Brush', 'X', 'Gift', 'MessageCircle', 'PenTool', 'Trash2']

export default function AdminServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'גבות',
    icon: 'Sparkles',
    availableDays: [0, 1, 2, 3, 4],
    startTime: '09:00',
    endTime: '18:00',
    active: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    } else {
      loadServices()
    }
  }, [status, session, router])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      availableDays: formData.availableDays.join(','),
    }

    try {
      const url = editingService 
        ? `/api/services/${editingService.id}`
        : '/api/services'
      
      const method = editingService ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await loadServices()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'שגיאה בשמירת השירות')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('שגיאה בשמירת השירות')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      nameEn: service.nameEn || '',
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      category: service.category,
      icon: service.icon || 'Sparkles',
      availableDays: (service.availableDays || '0,1,2,3,4').split(',').map(Number),
      startTime: service.startTime || '09:00',
      endTime: service.endTime || '18:00',
      active: service.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם את/ה בטוח/ה שברצונך למחוק שירות זה?')) return

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadServices()
      } else {
        const error = await response.json()
        alert(error.error || 'שגיאה במחיקת השירות')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('שגיאה במחיקת השירות')
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      })

      if (response.ok) {
        await loadServices()
      }
    } catch (error) {
      console.error('Error toggling service:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingService(null)
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'גבות',
      icon: 'Sparkles',
      availableDays: [0, 1, 2, 3, 4],
      startTime: '09:00',
      endTime: '18:00',
      active: true,
    })
  }

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day].sort(),
    }))
  }

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Sparkles
    return <Icon className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">ניהול שירותים</h1>
          <p className="text-gray-600">הוספה, עריכה והגדרת זמינות שירותים</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="ml-2 h-4 w-4" />
          {showForm ? 'ביטול' : 'שירות חדש'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingService ? 'עריכת שירות' : 'שירות חדש'}</CardTitle>
            <CardDescription>מלאי את פרטי השירות והגדירי את זמינותו</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם השירות *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameEn">שם באנגלית</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">קטגוריה *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">אייקון</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border"
                  >
                    {POPULAR_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    תצוגה מקדימה: {getIcon(formData.icon)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">משך (דקות) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    required
                    min="5"
                    step="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">מחיר (₪) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">שעת התחלה *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">שעת סיום *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>תיאור</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>ימים זמינים *</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_HE.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        formData.availableDays.includes(index)
                          ? 'bg-brand-brown text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active">שירות פעיל</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  {editingService ? 'עדכון' : 'יצירה'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(service.icon || 'Sparkles')}
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-500">{service.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(service)}
                  >
                    {service.active ? (
                      <Power className="h-4 w-4 text-green-600" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">{service.description}</p>
                <div className="flex justify-between">
                  <span>משך:</span>
                  <strong>{service.duration} דקות</strong>
                </div>
                <div className="flex justify-between">
                  <span>מחיר:</span>
                  <strong className="text-brand-brown">₪{service.price}</strong>
                </div>
                <div>
                  <span>ימים:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(service.availableDays || '0,1,2,3,4,5').split(',').map(Number).map(day => (
                      <span key={day} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {DAYS_HE[day]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>שעות:</span>
                  <strong>{service.startTime || '09:00'} - {service.endTime || '18:00'}</strong>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(service)}
                  className="flex-1"
                >
                  <Edit className="ml-2 h-4 w-4" />
                  עריכה
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            אין שירותים במערכת. לחצי על "שירות חדש" כדי להתחיל.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

