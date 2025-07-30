
"use client"

import * as React from "react"
import { useState, useEffect, memo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CardData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface EditCardSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CardData | undefined;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
}

const predefinedTags = [
  { group: "Urgência e Escassez", tags: ["Promoção Limitada", "Últimas Vagas", "Últimas Unidades", "Termina em 24h"] },
  { group: "Prova Social e Autoridade", tags: ["Mais Clicado", "Mais Popular", "Recomendado", "Destaque"] },
  { group: "Valor e Custo-Benefício", tags: ["Frete Grátis", "Comece Grátis", "Teste Grátis"] },
  { group: "Novidade", tags: ["NOVO!"] }
];

const colorPresets = {
  background: ['#000000', '#FFFFFF', '#EF4444', '#F97316', '#84CC16', '#22C55E', '#14B8A6', '#0EA5E9', '#6366F1', '#D946EF'],
  text: ['#FFFFFF', '#000000']
};

const ColorPicker = ({ value, onChange, colors }: { value: string, onChange: (color: string) => void, colors: string[] }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
        <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: value }} />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-2">
      <div className="grid grid-cols-5 gap-1">
        {colors.map(color => (
          <Button key={color} variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(color)}>
            <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: color }} />
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);


const EditCardSheetComponent = ({ isOpen, onOpenChange, card, onUpdate }: EditCardSheetProps) => {
  const [formData, setFormData] = useState<Partial<CardData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        link: card.link,
        content: card.content,
        background_image: card.background_image,
        tag: card.tag,
        tag_bg_color: card.tag_bg_color || '#F97316', // Default to orange
        tag_text_color: card.tag_text_color || '#FFFFFF', // Default to white
      });
    } else {
      setFormData({});
    }
  }, [card]); 

  if (!card) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: keyof CardData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value === 'none' ? null : value }));
  };

  const handleSaveChanges = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const changedData: Partial<CardData> = {};
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            const formKey = key as keyof CardData;
            // Ensure we also save defaults if they were not set before
            if (formData[formKey] !== card[formKey]) {
                 (changedData as any)[formKey] = formData[formKey];
            }
        }
    }
    
    // Make sure to save default colors if a tag is set but colors are not
    if (changedData.tag && !changedData.tag_bg_color && !card.tag_bg_color) {
      changedData.tag_bg_color = '#F97316';
    }
    if (changedData.tag && !changedData.tag_text_color && !card.tag_text_color) {
      changedData.tag_text_color = '#FFFFFF';
    }


    onUpdate(card.id, changedData);

    setTimeout(() => {
      onOpenChange(false);
      setIsSaving(false);
    }, 1000);
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
      case 'image':
        const isLink = card.type === 'link';
        return (
          <div className="space-y-6">
             <div>
              <Label>Tag (Opcional)</Label>
               <div className="flex items-center gap-2 mt-1">
                  <Select onValueChange={(v) => handleFieldChange('tag', v)} value={formData.tag || 'none'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {predefinedTags.map(group => (
                        <React.Fragment key={group.group}>
                          <Label className="px-2 py-1.5 text-xs text-muted-foreground">{group.group}</Label>
                          {group.tags.map(tag => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               {formData.tag && (
                 <div className="flex items-center gap-4 mt-3">
                   <div>
                      <Label className="text-xs">Cor do Fundo</Label>
                      <div className="mt-1">
                        <ColorPicker
                          value={formData.tag_bg_color || '#000000'}
                          onChange={(color) => handleFieldChange('tag_bg_color', color)}
                          colors={colorPresets.background}
                        />
                      </div>
                   </div>
                    <div>
                      <Label className="text-xs">Cor do Texto</Label>
                       <div className="mt-1">
                          <ColorPicker
                            value={formData.tag_text_color || '#FFFFFF'}
                            onChange={(color) => handleFieldChange('tag_text_color', color)}
                            colors={colorPresets.text}
                          />
                       </div>
                   </div>
                 </div>
               )}
            </div>
            {isLink && (
              <div>
                <Label htmlFor="link">URL do Link</Label>
                <Input
                    id="link"
                    name="link"
                    value={formData.link || ''}
                    onChange={handleChange}
                    placeholder="https://exemplo.com"
                  />
              </div>
            )}
            <div>
              <Label htmlFor="title">{isLink ? "Título (Opcional)" : "Legenda da Imagem (Opcional)"}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder={isLink ? "O título será preenchido automaticamente" : "Minha Viagem ao Rio"}
              />
               {!isLink && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Este texto aparecerá sobre a imagem.
                  </p>
                )}
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
      case 'map':
        return (
          <>
            <p className="mb-4">Este tipo de card não tem conteúdo editável.</p>
          </>
        );
      default:
        return <p>Este tipo de card não tem conteúdo editável.</p>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Editar Card</SheetTitle>
          <SheetDescription>
            Faça alterações no conteúdo do seu card aqui. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {renderFormContent()}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const EditCardSheet = memo(EditCardSheetComponent);
