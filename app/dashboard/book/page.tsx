import { BookingForm } from '@/components/booking-form'

interface Props {
  searchParams: Promise<{ service?: string }>
}

export default async function BookAppointmentPage({ searchParams }: Props) {
  const { service } = await searchParams
  return (
    <div className="container mx-auto px-4 py-12">
      <BookingForm preselectedServiceId={service} />
    </div>
  )
}


