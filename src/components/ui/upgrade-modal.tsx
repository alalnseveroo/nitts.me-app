
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpgradeModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onInviteClick: () => void
}

export const UpgradeModal = ({ isOpen, onOpenChange, onInviteClick }: UpgradeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desbloqueie todo o potencial</DialogTitle>
          <DialogDescription>
            Para que outras pessoas possam ver e clicar nos seus links, sua página precisa estar ativa.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-lg font-semibold">
            Ative sua página por um preço especial de lançamento!
          </p>
          {/* Adicionar mais detalhes sobre planos aqui se necessário */}
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button 
            onClick={() => { /* Lógica para checkout externo */ }} 
            className="w-full bg-accent hover:bg-accent/90"
          >
            Fazer Upgrade Agora
          </Button>
          <Button 
            variant="outline" 
            onClick={onInviteClick} 
            className="w-full"
          >
            Tenho um convite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
