
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Loader2, UploadCloud } from 'lucide-react';
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

interface GridLayoutCardBaseProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
}

export const GridLayoutCardBase = ({ card, onUpdate }: GridLayoutCardBaseProps) => {
    const [currentData, setCurrentData] = useState(card);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

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
        // Check if any value actually changed
        if (JSON.stringify(updates) !== JSON.stringify({ title: card.title, content: card.content, link: card.link, background_image: card.background_image })) {
            onUpdate(id, updates);
        }
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
            // Using alert for simplicity, but a toast notification would be better
            alert('Falha no upload da imagem.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };
    
    const renderContent = () => {
        switch (card.type) {
            case 'image':
                return (
                    <div className="w-full h-full relative group/image-card">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image-card:opacity-100 flex items-center justify-center transition-opacity z-10">
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
                            className="font-semibold border-none focus:ring-0 shadow-none p-0 h-auto"
                        />
                        <Input
                            name="link"
                            placeholder="https://exemplo.com"
                            value={currentData.link || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                             className="border-none focus:ring-0 shadow-none p-0 h-auto text-muted-foreground"
                        />
                    </div>
                );
            case 'title':
                 return (
                    <div className="p-4 w-full h-full">
                        <Input
                            name="title"
                            placeholder="Título Principal"
                            className="text-4xl font-bold border-none focus:ring-0 p-0 h-full w-full shadow-none bg-transparent"
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
        <Card 
            className={`w-full h-full flex flex-col bg-card border-2 transition-all overflow-hidden ${isFocused ? 'border-primary' : 'border-transparent'}`} 
            onFocus={() => setIsFocused(true)}
            onBlurCapture={handleBlur} // Use onBlurCapture to catch blur from child inputs
        >
            <div className="flex-grow flex items-center justify-center h-full">
                {renderContent()}
            </div>
        </Card>
    );
};
