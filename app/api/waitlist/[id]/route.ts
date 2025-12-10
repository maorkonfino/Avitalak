import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// DELETE - הסרה מרשימת המתנה
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'נדרשת התחברות' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const entry = await prisma.waitlist.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'רשומה לא נמצאה' },
        { status: 404 }
      )
    }

    // רק המשתמש עצמו או מנהל יכולים למחוק
    if (session.user.role !== 'ADMIN' && entry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה' },
        { status: 403 }
      )
    }

    await prisma.waitlist.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ message: 'הוסרת מרשימת המתנה' })
  } catch (error) {
    console.error('Error deleting waitlist entry:', error)
    return NextResponse.json(
      { error: 'שגיאה בהסרה מרשימת המתנה' },
      { status: 500 }
    )
  }
}

