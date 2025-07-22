'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button";
import { MountainIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profile?.username) {
        // CORRIGIDO: Redirecionando para /[username] em vez de /[username]/edit
        router.push(`/${profile.username}`);
      } else {
        console.error("Estado inconsistente: Usuário logado sem perfil ou username.", { userId: session.user.id });
        setLoading(false);
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="px-4 lg:px-6 h-14 flex items-center">
          <Link href="#" className="flex items-center justify-center" prefetch={false}>
            <MountainIcon className="h-6 w-6 text-primary" />
            <span className="sr-only">ConectaBio</span>
          </Link>
        </header>
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <Skeleton className="h-12 w-96 mb-4" />
                  <Skeleton className="h-6 w-full max-w-[700px]" />
                </div>
                <div className="space-x-4">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">ConectaBio</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-foreground">
                  ConectaBio
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Todos os seus links em um só lugar. Personalize sua página e compartilhe com o mundo.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/signup">
                    Criar minha página
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/login">
                    Acessar minha conta
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
