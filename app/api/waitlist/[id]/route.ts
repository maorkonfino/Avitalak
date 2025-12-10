import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.waitlist.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Waitlist entry deleted' })
  } catch (error) {
    console.error('Error deleting waitlist entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    )
  }
}

