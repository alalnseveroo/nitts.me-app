
"use client"

import { useState, useEffect, memo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CardData } from "@/lib/types"
import { scrapeSubstack } from "@/ai/flows/substack-scraper-flow"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EditCardSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CardData | undefined;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
}

const EditCardSheetComponent = ({ isOpen, onOpenChange, card, onUpdate }: EditCardSheetProps) => {
  const [formData, setFormData] = useState<Partial<CardData>>({});
  const [isScraping, setIsScraping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        link: card.link,
        content: card.content,
        background_image: card.background_image,
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

  const handleSaveChanges = () => {
    const updatesToSave: Partial<CardData> = {};
    if (formData.title !== card.title) updatesToSave.title = formData.title;
    if (formData.content !== card.content) updatesToSave.content = formData.content;
    if (formData.link !== card.link) updatesToSave.link = formData.link;
    if (formData.background_image !== card.background_image) updatesToSave.background_image = formData.background_image;
    
    if (Object.keys(updatesToSave).length > 0) {
      onUpdate(card.id, updatesToSave);
    }
    onOpenChange(false);
  };
  
  const handleScrape = async () => {
    if (!formData.link || !formData.link.includes('substack.com')) {
        toast({ title: 'URL Inválida', description: 'Por favor, insira uma URL válida do Substack.', variant: 'destructive' });
        return;
    }
    setIsScraping(true);
    try {
        const result = await scrapeSubstack({ url: formData.link });
        const updates = {
            title: result.profileName,
            background_image: result.profileImage,
        };
        setFormData(prev => ({ ...prev, ...updates }));
        // Also update the card in the main state immediately
        onUpdate(card.id, updates);
        toast({ title: 'Sucesso!', description: 'Dados do Substack importados.' });
    } catch (error) {
        console.error('Scraping error:', error);
        toast({ title: 'Erro de importação', description: 'Não foi possível buscar os dados. Verifique a URL.', variant: 'destructive' });
    } finally {
        setIsScraping(false);
    }
  };
  
  const isSubstackLink = formData.link?.includes('substack.com') ?? false;

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
              <div className="flex gap-2">
                <Input
                  id="link"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleChange}
                  placeholder="https://exemplo.com"
                />
                {isSubstackLink && (
                    <Button onClick={handleScrape} disabled={isScraping} variant="outline">
                        {isScraping ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Importar'}
                    </Button>
                )}
              </div>
               {isSubstackLink && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Detectamos um link do Substack! Clique em "Importar" para preencher os dados automaticamente.
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
            <p className="mb-4">Este tipo de card não tem conteúdo editável.</p>
          </>
        );
      default:
        return <p>Este tipo de card não tem conteúdo editável.</p>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
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
