import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: NextRequest) {
  try {
    // Check if we should include inactive services (for admin)
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    console.log('[Services API] Fetching services, includeInactive:', includeInactive)
    
    // Ensure Prisma is connected
    await prisma.$connect()
    
    const services = await prisma.service.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { name: 'asc' }
    })
    
    console.log('[Services API] Successfully fetched', services.length, 'services')
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('[Services API] Error fetching services:', error)
    
    // Try to reconnect and retry once
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      
      const searchParams = request.nextUrl.searchParams
      const includeInactive = searchParams.get('includeInactive') === 'true'
      
      const services = await prisma.service.findMany({
        where: includeInactive ? {} : { active: true },
        orderBy: { name: 'asc' }
      })
      
      console.log('[Services API] Retry successful, fetched', services.length, 'services')
      return NextResponse.json(services)
    } catch (retryError) {
      console.error('[Services API] Retry failed:', retryError)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, duration, price, category, availableDays } = body

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        category,
        availableDays,
        active: true
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

