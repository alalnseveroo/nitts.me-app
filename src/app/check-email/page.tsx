'use client';

import { Mail } from 'lucide-react';

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-full max-w-md space-y-4">
        <div className="mx-auto bg-primary rounded-full p-4 w-fit">
            <Mail className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Verifique seu e-mail</h1>
        <p className="text-muted-foreground">
          Enviamos um link de confirmação para o seu endereço de e-mail. Por favor, clique no link para ativar sua conta e fazer login.
        </p>
        <p className="text-sm text-muted-foreground pt-4">
          (Se não encontrar, verifique sua caixa de spam)
        </p>
      </div>
    </div>
  );
}
