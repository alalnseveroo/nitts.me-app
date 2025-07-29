'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
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
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const trimmedUsername = username.trim().toLowerCase();
    
    // Check if username is already taken
    const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', trimmedUsername)
        .single();

    if (existingProfile) {
        setError('Este nome de usuário já está em uso. Por favor, escolha outro.');
        setLoading(false);
        return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email, password, options: { data: { username: trimmedUsername } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    
    // If sign up is successful, Supabase automatically logs the user in when email confirmation is disabled.
    // The new profile is created by a trigger in Supabase. We just need to redirect.
    if (signUpData.user) {
        router.push(`/${trimmedUsername}`);
        router.refresh(); // Refresh to ensure server components get the new session
    } else {
        // This case should ideally not happen if email confirmation is off and there's no error.
        setError("Ocorreu um erro inesperado. Tente novamente.");
        setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
            <div className="grid gap-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
            <div className="grid gap-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
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
          <CardTitle className="text-2xl">Crie sua página</CardTitle>
          <CardDescription>Comece a centralizar seus links agora mesmo.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" type="text" placeholder="seu-usuario" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Criando sua página...' : 'Criar conta'}</Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
