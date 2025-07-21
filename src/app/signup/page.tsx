'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Check if username is unique
    const { data: existingUser, error: existingUserError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      toast({
        title: 'Nome de usuário indisponível',
        description: 'Este nome de usuário já está em uso. Por favor, escolha outro.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    })

    if (authError || !authData.user) {
      toast({
        title: 'Erro ao criar conta',
        description: authError?.message || 'Não foi possível criar sua conta.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, username: username })

    if (profileError) {
      toast({
        title: 'Erro ao criar perfil',
        description: profileError.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    toast({
      title: 'Conta criada com sucesso!',
      description: 'Você será redirecionado para a sua página.',
    })
    
    // For simplicity, we assume email confirmation is disabled or handled.
    // We log the user in and redirect.
    router.push(`/${username}`)
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Crie sua página ConectaBio com um nome de usuário único.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seunome"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={loading}
                pattern="^[a-z0-9_]+$"
                title="Apenas letras minúsculas, números e underlines."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full bg-accent hover:bg-accent/90" type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/login" className="underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
