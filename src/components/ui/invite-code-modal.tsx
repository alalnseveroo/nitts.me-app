
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface InviteCodeModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: () => void
}

export const InviteCodeModal = ({ isOpen, onOpenChange, onSuccess }: InviteCodeModalProps) => {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyCode = async () => {
    setError(null)
    setIsLoading(true)

    const { data, error: rpcError } = await supabase.rpc('claim_invite', {
      invite_code: code,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setIsLoading(false);
      return;
    }

    if (data && data.success) {
      onSuccess();
    } else {
      setError(data.message || "Código de convite inválido ou expirado.");
    }
    
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Limpa o estado ao fechar o modal
      setCode("")
      setError(null)
      setIsLoading(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ativar com Convite</DialogTitle>
          <DialogDescription>
            Insira o código de convite que você recebeu para ativar seu acesso.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SEU-CODIGO-AQUI"
            className="text-center text-xl tracking-widest font-mono"
            disabled={isLoading}
          />
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleVerifyCode}
            disabled={isLoading || code.length < 4}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar Código
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
