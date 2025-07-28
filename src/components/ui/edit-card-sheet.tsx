
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
    }
  }, [card, isOpen]); 

  if (!card) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    const updatesToSave: Partial<CardData> = {};
    if (formData.title !== undefined) updatesToSave.title = formData.title;
    if (formData.content !== undefined) updatesToSave.content = formData.content;
    if (formData.link !== undefined) updatesToSave.link = formData.link;
    if (formData.background_image !== undefined) updatesToSave.background_image = formData.background_image;
    
    onUpdate(card.id, updatesToSave);
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
        setFormData(prev => ({
            ...prev,
            title: result.profileName,
            background_image: result.profileImage,
        }));
        toast({ title: 'Sucesso!', description: 'Dados do Substack importados.' });
    } catch (error) {
        console.error('Scraping error:', error);
        toast({ title: 'Erro de importação', description: 'Não foi possível buscar os dados. Verifique a URL.', variant: 'destructive' });
    } finally {
        setIsScraping(false);
    }
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
        case 'substack':
            return (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link">URL do Perfil Substack</Label>
                  <div className="flex gap-2">
                    <Input
                      id="link"
                      name="link"
                      value={formData.link || ''}
                      onChange={handleChange}
                      placeholder="https://exemplo.substack.com"
                    />
                    <Button onClick={handleScrape} disabled={isScraping}>
                        {isScraping ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Importar'}
                    </Button>
                  </div>
                </div>
                 <div>
                    <Label htmlFor="title">Nome do Perfil</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        placeholder="Nome do Autor/Publicação"
                    />
                </div>
                 <div>
                    <Label htmlFor="background_image">URL da Imagem de Perfil</Label>
                    <Input
                        id="background_image"
                        name="background_image"
                        value={formData.background_image || ''}
                        onChange={handleChange}
                        placeholder="https://url-da-imagem.com/..."
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
