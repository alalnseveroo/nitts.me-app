
"use client"

import { useState, useEffect, memo, useRef } from "react"
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
import { Loader2, UploadCloud, FileCheck2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { processDocument } from "@/ai/flows/process-document-flow"
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
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [obscurationPercentage, setObscurationPercentage] = useState(10)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        content: card.content,
        link: card.link,
        price: card.price,
      })
      setObscurationPercentage(card.obscuration_settings?.percentage ?? 10)
      setFile(null) // Reset file on card change
    }
  }, [card])

  if (!card) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }
  
  const handleRemoveFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleProcessAndSaveChanges = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    let finalUpdates = { ...formData }

    if (file) {
      toast({
        title: "Processando documento...",
        description: "Aguarde enquanto preparamos os arquivos. Isso pode levar um momento.",
      })

      try {
        const reader = new FileReader()
        const fileAsDataURL = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
          reader.readAsDataURL(file)
        })

        const result = await processDocument({
          fileDataUri: fileAsDataURL,
          fileName: file.name,
          userId: card.user_id,
          cardId: card.id,
          obscurationPercentage,
        })

        finalUpdates = {
          ...finalUpdates,
          original_file_path: result.originalFilePath,
          processed_file_path: result.processedFilePath,
          obscuration_settings: { percentage: obscurationPercentage },
        }
        
        toast({ title: "Sucesso!", description: "Seu documento foi processado e salvo." })

      } catch (error) {
        console.error("Document processing error:", error)
        toast({
          title: "Erro no Processamento",
          description: "Não foi possível processar o documento. Tente novamente.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }
    }

    onUpdate(card.id, finalUpdates)
    onOpenChange(false)
    setIsProcessing(false)
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
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
            />
            <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                {hasExistingFile && !file ? (
                     <div className="flex items-center justify-between p-3 rounded-md border border-green-500 bg-green-50">
                        <div className="flex items-center gap-2 text-green-700">
                           <FileCheck2 className="h-5 w-5" />
                           <span className="text-sm font-medium">Documento carregado</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Alterar</Button>
                    </div>
                ) : file ? (
                     <div className="flex items-center justify-between p-3 rounded-md border">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemoveFile}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Selecionar Arquivo PDF
                    </Button>
                )}
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
              Mostre as primeiras {obscurationPercentage}% páginas do seu documento como
              amostra grátis.
            </p>
            <Slider
              value={[obscurationPercentage]}
              onValueChange={(value) => setObscurationPercentage(value[0])}
              max={50}
              step={1}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button onClick={handleProcessAndSaveChanges} disabled={isProcessing || (!file && !hasExistingFile)}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isProcessing ? "Processando..." : "Salvar Alterações"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const EditDocumentSheet = memo(EditDocumentSheetComponent)
