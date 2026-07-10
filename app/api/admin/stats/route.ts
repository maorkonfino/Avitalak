import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayAppointments, pendingAppointments, totalUsers, totalServices] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
    }),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.service.count({ where: { active: true } }),
  ])

  return NextResponse.json({ todayAppointments, pendingAppointments, totalUsers, totalServices })
}
