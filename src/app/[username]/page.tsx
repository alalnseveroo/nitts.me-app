'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const pageUsername = params.username as string

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()
      
      if (error || !profile) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      if (profile.username !== pageUsername) {
        // Not the owner of this page, redirect to login
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkUser()
  }, [router, pageUsername])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Skeleton className="absolute top-4 right-4 h-10 w-20" />
          <div className="text-center space-y-4">
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-6 w-64" />
          </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 right-4">
        <Button onClick={handleLogout} variant="secondary">Sair</Button>
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold">Bem-vindo, {pageUsername}!</h1>
        <p className="mt-4 text-lg text-muted-foreground">Esta é a sua área de edição.</p>
      </div>
    </div>
  )
}
