'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (profile?.username) {
          router.push(`/${profile.username}`);
          return;
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      toast({
        title: 'Erro de login',
        description: authError?.message || 'Não foi possível fazer login.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
       toast({
        title: 'Erro de perfil',
        description: 'Não foi possível encontrar seu perfil.',
        variant: 'destructive',
      })
      await supabase.auth.signOut()
      setLoading(false)
      return
    }
    
    router.push(`/${profile.username}`)
    router.refresh(); // Refresh the page to update server-side session
  }
  
  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar sua página ConectaBio.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full bg-accent hover:bg-accent/90" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{' '}
              <Link href="/signup" className="underline">
                Crie uma
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
