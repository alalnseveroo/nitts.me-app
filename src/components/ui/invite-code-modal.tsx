
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

interface InviteCodeModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: () => void
}

const VALID_INVITE_CODE = "1234" // Simulação - idealmente viria do backend

export const InviteCodeModal = ({ isOpen, onOpenChange, onSuccess }: InviteCodeModalProps) => {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyCode = () => {
    setError(null)
    setIsLoading(true)

    // Simula uma chamada de API
    setTimeout(() => {
      if (code === VALID_INVITE_CODE) {
        onSuccess()
      } else {
        setError("Código de convite inválido ou expirado.")
      }
      setIsLoading(false)
    }, 1000)
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
            Insira o código de 4 dígitos que você recebeu para ativar seu acesso.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={4}
            placeholder="----"
            className="text-center text-2xl tracking-[1rem] font-mono"
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
