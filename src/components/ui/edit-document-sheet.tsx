
"use client"

import { useState, useEffect, memo } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Loader2, UploadCloud, FileCheck2 } from "lucide-react"
import type { CardData } from "@/lib/types"

interface EditDocumentSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  card: CardData | undefined
  onUpdate: (id: string, updates: Partial<CardData>) => void
}

const EditDocumentSheetComponent = ({
  isOpen,
  onOpenChange,
  card,
  onUpdate,
}: EditDocumentSheetProps) => {
  const [formData, setFormData] = useState<Partial<CardData>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        content: card.content,
        link: card.link,
        price: card.price,
      })
    }
  }, [card])

  if (!card) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    onUpdate(card.id, formData)
    setTimeout(() => {
      onOpenChange(false)
      setIsSaving(false)
    }, 500)
  }
  
  const hasExistingFile = !!card.original_file_path;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar Documento Monetizado</SheetTitle>
          <SheetDescription>
            Faça upload, configure e defina o preço do seu documento para
            venda.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-2">
            <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                <Button variant="outline" className="w-full" disabled>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload será habilitado na Fase 2
                </Button>
            </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título do Documento</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Descrição Curta</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (ex: R$ 49,90)</Label>
            <Input
              id="price"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link de Pagamento (URL)</Label>
            <Input
              id="link"
              name="link"
              type="url"
              value={formData.link || ""}
              onChange={handleChange}
              placeholder="https://seu-link-de-venda.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Pré-visualização Gratuita</Label>
            <p className="text-sm text-muted-foreground">
              A pré-visualização será habilitada na Fase 2.
            </p>
            <Slider
              defaultValue={[10]}
              max={50}
              step={1}
              disabled
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const EditDocumentSheet = memo(EditDocumentSheetComponent)
