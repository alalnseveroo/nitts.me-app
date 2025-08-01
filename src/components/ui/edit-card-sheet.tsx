
"use client"

import * as React from "react"
import { useState, useEffect, memo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CardData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Tag, Link as LinkIcon, Edit, Text, Palette, ChevronDown, Check, AlertTriangle, Layers, Clock, ShoppingCart, Star, Rocket, CheckCircle, ArrowLeft, XCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface EditCardSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CardData | undefined;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
}

const predefinedTags = [
  { 
    group: "Urgência e Escassez", 
    tags: [
      { value: "Promoção Limitada", label: "Promoção Limitada", icon: AlertTriangle },
      { value: "Últimas Vagas", label: "Últimas Vagas", icon: ShoppingCart },
      { value: "Últimas Unidades", label: "Últimas Unidades", icon: ShoppingCart },
      { value: "Termina em 24h", label: "Termina em 24h", icon: Clock },
    ]
  },
  { 
    group: "Prova Social e Autoridade", 
    tags: [
      { value: "Mais Clicado", label: "Mais Clicado", icon: Star },
      { value: "Mais Popular", label: "Mais Popular", icon: Star },
      { value: "Recomendado", label: "Recomendado", icon: CheckCircle },
      { value: "Destaque", label: "Destaque", icon: Star },
    ]
  },
  { 
    group: "Valor e Custo-Benefício", 
    tags: [
      { value: "Frete Grátis", label: "Frete Grátis", icon: Rocket },
      { value: "Comece Grátis", label: "Comece Grátis", icon: Rocket },
      { value: "Teste Grátis", label: "Teste Grátis", icon: Rocket },
    ]
  },
  { 
    group: "Novidade", 
    tags: [
      { value: "NOVO!", label: "NOVO!", icon: Rocket },
    ]
  }
];

const allTags = predefinedTags.flatMap(g => g.tags);

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
  const [sheetView, setSheetView] = useState<'main' | 'selectTag'>('main');

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        link: card.link,
        content: card.content,
        background_image: card.background_image,
        tag: card.tag,
        tag_bg_color: card.tag_bg_color || '#F97316',
        tag_text_color: card.tag_text_color || '#FFFFFF',
      });
    } else {
      setFormData({});
    }
    // Reset view when card changes
    setSheetView('main');
  }, [card]); 

  if (!card) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: keyof CardData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const changedData: Partial<CardData> = {};
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            const formKey = key as keyof CardData;
            if (formData[formKey] !== card[formKey]) {
                 (changedData as any)[formKey] = formData[formKey];
            }
        }
    }
    
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
  
  const handleTagSelect = (value: string | null) => {
    handleFieldChange('tag', value);
    setSheetView('main');
  };
  
  const renderMainView = () => {
    switch (card.type) {
      case 'title':
        return (
          <Accordion type="single" collapsible className="w-full" defaultValue="title">
            <AccordionItem value="title">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Edit className="h-5 w-5" />
                  <span className="font-semibold">Título</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="text-2xl font-bold h-auto p-2"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      case 'link':
      case 'image':
      case 'note':
        const isLink = card.type === 'link';
        const isNote = card.type === 'note';
        const isImage = card.type === 'image';
        const defaultOpenAccordion = isNote ? ['content', 'tag'] : ['tag'];

        return (
          <Accordion type="multiple" className="w-full space-y-2" defaultValue={defaultOpenAccordion}>
            {isNote && (
              <AccordionItem value="content">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Edit className="h-5 w-5" />
                    <span className="font-semibold">Conteúdo da Nota</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content || ''}
                    onChange={handleChange}
                    rows={8}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="tag">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5" />
                  <span className="font-semibold">Tag</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {formData.tag ? `Tag: ${formData.tag}` : 'Nenhuma tag selecionada'}
                    </span>
                    <Button variant="outline" onClick={() => setSheetView('selectTag')}>
                        Alterar
                    </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {formData.tag && (
              <AccordionItem value="tag-color">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5" />
                    <span className="font-semibold">Cores da Tag</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex items-center gap-8 pt-4">
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
                </AccordionContent>
              </AccordionItem>
            )}

            {isLink && (
              <AccordionItem value="link">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5" />
                    <span className="font-semibold">URL</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <Input
                      id="link"
                      name="link"
                      value={formData.link || ''}
                      onChange={handleChange}
                      placeholder="https://exemplo.com"
                    />
                </AccordionContent>
              </AccordionItem>
            )}
            
            {(isLink || isImage) && (
              <AccordionItem value="title">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Text className="h-5 w-5" />
                    <span className="font-semibold">{isLink ? "Título" : "Legenda"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
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
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        );
      case 'map':
      case 'document':
        return (
          <p className="mb-4 text-center text-muted-foreground">Este tipo de card não tem conteúdo editável.</p>
        );
      default:
        return <p className="mb-4 text-center text-muted-foreground">Este tipo de card não tem conteúdo editável.</p>;
    }
  };
  
  const renderSelectTagView = () => (
    <>
      <header className="flex items-center justify-between pb-4 border-b shrink-0 p-6">
        <Button variant="ghost" size="icon" onClick={() => setSheetView('main')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold">Selecionar Tag</h3>
        <div className="w-9" />
      </header>
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
        <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive gap-2"
            onClick={() => handleTagSelect(null)}
        >
            <XCircle className="h-5 w-5"/> Remover Tag
        </Button>
        {predefinedTags.map(group => (
            <div key={group.group}>
                <p className="px-2 text-sm font-semibold text-muted-foreground mb-2">{group.group}</p>
                <div className="space-y-1">
                    {group.tags.map(tag => {
                        const Icon = tag.icon;
                        return (
                            <Button 
                                key={tag.value}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start font-normal text-base h-auto py-3 gap-3",
                                    formData.tag === tag.value && "bg-accent"
                                )}
                                onClick={() => handleTagSelect(tag.value)}
                            >
                                <Icon className="h-5 w-5 text-muted-foreground"/>
                                <span>{tag.label}</span>
                                {formData.tag === tag.value && <Check className="ml-auto h-5 w-5" />}
                            </Button>
                        )
                    })}
                </div>
            </div>
        ))}
      </div>
    </>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-2xl max-h-[90dvh] flex flex-col p-0"
        onOpenAutoFocus={(e) => {
            if (sheetView !== 'main') {
                e.preventDefault();
            }
        }}
      >
        {sheetView === 'main' ? (
            <>
                <div className="p-6">
                    <SheetHeader className="text-left">
                        <SheetTitle>Editar Card</SheetTitle>
                        <SheetDescription>
                            Faça alterações no conteúdo do seu card aqui. Clique em salvar quando terminar.
                        </SheetDescription>
                    </SheetHeader>
                </div>
                <div className="px-6 py-4 flex-1 overflow-y-auto">
                    {renderMainView()}
                </div>
                <div className="p-6">
                    <SheetFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </SheetFooter>
                </div>
            </>
        ) : (
           renderSelectTagView()
        )}
      </SheetContent>
    </Sheet>
  );
};

export const EditCardSheet = memo(EditCardSheetComponent);
