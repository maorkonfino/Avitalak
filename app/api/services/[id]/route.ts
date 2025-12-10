import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.duration && { duration: parseInt(body.duration) }),
        ...(body.price && { price: parseFloat(body.price) }),
        ...(body.category && { category: body.category }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.availableDays !== undefined && { availableDays: body.availableDays }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.active !== undefined && { active: body.active }),
      },
    })

    return NextResponse.json(service)
  } catch (error: any) {
    console.error('Error updating service:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Check if service has appointments
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    })

    if (appointmentCount > 0) {
      // Don't delete, just deactivate
      const service = await prisma.service.update({
        where: { id },
        data: { active: false },
      })

      return NextResponse.json({
        message: 'Service deactivated (has existing appointments)',
        service,
      })
    }

    // Safe to delete
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting service:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}

