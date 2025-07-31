
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateUsernameButton } from '@/components/ui/create-username-button';
import { motion } from 'framer-motion';

const MountainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
);


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
        router.push(`/${profile.username}`);
      } else {
        await supabase.auth.signOut();
        setLoading(false);
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background" />
    );
  }

  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="ml-2 font-bold font-headline">Nits.uno</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Criar Conta</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-1">
        <motion.section 
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
                show: { transition: { staggerChildren: 0.2 } },
                hidden: {},
            }}
            className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-4">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Sua Página, Seus Links, Seu Universo.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Crie sua página de links gratuitamente. É rápido, fácil e o resultado é incrível.
                </p>
              </motion.div>
              
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
                <CreateUsernameButton />
              </motion.div>
              
              <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-xs text-muted-foreground">
                Cadastro gratuito. Não pedimos cartão de crédito.
              </motion.p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
