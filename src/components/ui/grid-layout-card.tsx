'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type CardData = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
};

interface GridLayoutCardProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
    onDelete: (id: string) => void;
}

export const GridLayoutCard = ({ card, onUpdate, onDelete }: GridLayoutCardProps) => {
    const [currentData, setCurrentData] = useState(card);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Update internal state if the card prop changes from parent
    useEffect(() => {
        setCurrentData(card);
    }, [card]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = () => {
        setIsFocused(false);
        const { id, type, user_id, ...updates } = currentData;
        onUpdate(id, updates);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${card.user_id}/${card.id}-${Date.now()}.${fileExt}`;

        try {
            setUploading(true);
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            
            const updates = { background_image: publicUrl };
            setCurrentData(prev => ({ ...prev, ...updates }));
            onUpdate(card.id, updates);

        } catch (error) {
            alert('Falha no upload da imagem.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };
    
    const renderCardContent = () => {
        switch (card.type) {
            case 'image':
                return (
                    <div className="w-full h-full relative group">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                variant="outline"
                            >
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                )}
                                Alterar Imagem
                            </Button>
                        </div>
                        <img 
                            src={currentData.background_image || 'https://placehold.co/400x400.png'} 
                            alt={currentData.title || 'Card image'}
                            className="w-full h-full object-cover"
                            data-ai-hint="abstract background"
                        />
                    </div>
                );
            case 'link':
                return (
                    <div className="space-y-2 p-4">
                        <Input
                            name="title"
                            placeholder="Título"
                            value={currentData.title || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="font-semibold"
                        />
                        <Input
                            name="link"
                            placeholder="https://exemplo.com"
                            value={currentData.link || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>
                );
            case 'title':
                 return (
                    <div className="p-4 w-full h-full">
                        <Input
                            name="title"
                            placeholder="Título Principal"
                            className="text-4xl font-bold border-none focus:ring-0 p-0 h-full w-full"
                            value={currentData.title || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>
                );
            case 'note':
                return (
                    <div className="p-4 h-full">
                        <Textarea
                            name="content"
                            placeholder="Escreva sua nota aqui..."
                            value={currentData.content || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="border-none focus:ring-0 p-0 h-full resize-none bg-transparent"
                        />
                    </div>
                );
            case 'map':
                return (
                    <div className="p-4 flex items-center justify-center text-muted-foreground">
                        🗺️ Elemento de Mapa (WIP)
                    </div>
                )
            default:
                return <p className="p-4">Tipo de card desconhecido</p>;
        }
    };

    return (
        <Card className={`w-full h-full flex flex-col bg-card border-2 transition-all overflow-hidden ${isFocused ? 'border-primary' : 'border-transparent'}`} onFocus={() => setIsFocused(true)} onBlurCapture={handleBlur}>
            <div className="flex-grow flex items-center justify-center relative">
                {renderCardContent()}
                 <div className="absolute top-1 right-1">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Isso deletará o card permanentemente. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(card.id)} className="bg-destructive hover:bg-destructive/90">
                                    Deletar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </Card>
    );
};
