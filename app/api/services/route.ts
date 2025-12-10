import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    const where = {
      ...(category && category !== 'all' ? { category } : {}),
      ...(!includeInactive && !isAdmin ? { active: true } : {}),
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      nameEn,
      description,
      duration,
      price,
      category,
      icon,
      availableDays,
      startTime,
      endTime,
      active,
    } = body

    // Validation
    if (!name || !duration || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        nameEn,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        category,
        icon: icon || 'Sparkles',
        availableDays: availableDays || '0,1,2,3,4,5',
        startTime: startTime || '09:00',
        endTime: endTime || '18:00',
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
