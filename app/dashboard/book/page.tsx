import { Suspense } from 'react'
import { BookingForm } from '@/components/booking-form'

export default function BookAppointmentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">טוענת...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  )
}


