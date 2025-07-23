
"use client"

import { useState, useEffect, memo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CardData } from "@/app/[username]/page"
import { Separator } from "./separator"

interface EditCardSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CardData | undefined;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
}

const EditCardSheetComponent = ({ isOpen, onOpenChange, card, onUpdate }: EditCardSheetProps) => {
  const [formData, setFormData] = useState<Partial<CardData>>({});

  useEffect(() => {
    // When a new card is selected or the sheet opens, reset the form data
    if (card) {
      setFormData({
        title: card.title,
        link: card.link,
        content: card.content,
      });
    }
  }, [card, isOpen]); 

  if (!card) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // We only update the data that can be edited in this sheet.
    // The link is now edited elsewhere.
    const updatesToSave: Partial<CardData> = {};
    if (formData.title !== undefined) updatesToSave.title = formData.title;
    if (formData.content !== undefined) updatesToSave.content = formData.content;
    
    onUpdate(card.id, updatesToSave);
    onOpenChange(false);
  };
  
  const renderFormContent = () => {
    switch (card.type) {
      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="text-2xl font-bold h-auto p-2"
              />
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="link">URL do Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 'note':
         return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Conteúdo da Nota</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content || ''}
                onChange={handleChange}
                rows={8}
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Legenda da Imagem (Opcional)</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Minha Viagem ao Rio de Janeiro"
                value={formData.title || ''}
                onChange={handleChange}
              />
               <p className="text-sm text-muted-foreground mt-2">
                  Este texto aparecerá sobre a imagem no canto inferior esquerdo.
               </p>
            </div>
          </div>
        );
      case 'map':
        return (
          <>
            <p className="mb-4">Este tipo de card não tem conteúdo editável, mas pode ter um link gerenciado no menu rápido.</p>
          </>
        );
      default:
        return <p>Este tipo de card não tem conteúdo editável.</p>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sheet-content">
        <SheetHeader>
          <SheetTitle>Editar Card</SheetTitle>
          <SheetDescription>
            Faça alterações no conteúdo do seu card aqui. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {renderFormContent()}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const EditCardSheet = memo(EditCardSheetComponent);
