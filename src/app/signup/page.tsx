
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

function SignUpComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    const prefilledUsername = searchParams.get('username');
    if (prefilledUsername) {
      setUsername(prefilledUsername);
    } else {
      // Redirect if no username is provided, as it's now required
      router.push('/');
    }
  }, [searchParams, router]);
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid) return;

    setError(null)
    setLoading(true)
    
    // The username check is already done on the homepage button, 
    // but a server-side check is always a good practice for robustness.
    // For this flow, we'll trust the client-side check.
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email, 
      password,
      options: {
        data: {
          username: username,
          role: 'free',
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    
    if (!signUpData.user) {
      setError("Não foi possível criar o usuário. Tente novamente.");
      setLoading(false);
      return;
    }
    
    toast({
      title: 'Conta criada com sucesso!',
      description: 'Você já pode fazer login com suas novas credenciais.',
    });
    router.push(`/login`);
  };

  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-sm text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 break-words">
                Seu @{username} recebeu o selo visionário!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
                E com ele diversos benefícios. Cadastre-se agora mesmo.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-14 bg-gray-100 border-none rounded-2xl text-center text-base"
                />
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="Crie uma senha forte" 
                    minLength={6} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-14 bg-gray-100 border-none rounded-2xl text-center text-base"
                />
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl text-lg font-bold transition-colors duration-300"
                    disabled={!isFormValid || loading}
                    style={{
                        backgroundColor: isFormValid && !loading ? '#000000' : '#E5E7EB',
                        color: isFormValid && !loading ? '#FFFFFF' : '#A1A1AA'
                    }}
                >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Finalizar Cadastro'}
                </Button>
            </form>
        </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignUpComponent />
    </Suspense>
  )
}
