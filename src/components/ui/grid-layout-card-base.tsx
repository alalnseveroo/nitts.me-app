
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Loader2, UploadCloud } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CardData } from '@/app/[username]/page';

interface GridLayoutCardBaseProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
    isDisabled?: boolean;
    isMobile: boolean;
}

export const GridLayoutCardBase = ({ card, onUpdate, isDisabled = false, isMobile }: GridLayoutCardBaseProps) => {
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
        // Only trigger update if data has actually changed
        if (JSON.stringify(currentData) !== JSON.stringify(card)) {
            onUpdate(card.id, currentData);
        }
    };
    
    const handleImageFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            console.error(error);
        } finally {
            setUploading(false);
        }
    };
    
    const renderContent = () => {
        switch (card.type) {
            case 'image':
                return (
                    <div className="w-full h-full relative group/image-card pointer-events-none">
                         <div className={cn("absolute inset-0 bg-black/40 opacity-0 group-hover/image-card:opacity-100 flex items-center justify-center transition-opacity z-10", isDisabled ? 'pointer-events-none' : 'pointer-events-auto')}>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || isDisabled}
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageFileSelected}
                            disabled={uploading || isDisabled}
                        />
                        <img 
                            src={currentData.background_image || 'https://placehold.co/400x400.png'} 
                            alt={currentData.title || 'Card image'}
                            className="w-full h-full object-cover"
                            data-ai-hint="abstract background"
                        />
                         {currentData.title && (
                            <div className="absolute bottom-2 left-2 bg-white text-black rounded-lg shadow-md px-3 py-1.5 pointer-events-none">
                                <p className="text-sm font-medium">{currentData.title}</p>
                            </div>
                        )}
                    </div>
                );
            case 'link':
                return (
                    <div className={cn("space-y-2 p-4", isDisabled && "pointer-events-none")}>
                        <Input
                            name="title"
                            placeholder="Título"
                            value={currentData.title || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="font-semibold border-none focus:ring-0 shadow-none p-0 h-auto"
                            disabled={isDisabled}
                        />
                        <Input
                            name="link"
                            placeholder="https://exemplo.com"
                            value={currentData.link || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                             className="border-none focus:ring-0 shadow-none p-0 h-auto text-muted-foreground"
                             disabled={isDisabled}
                        />
                    </div>
                );
            case 'title':
                 return (
                    <div className={cn("w-full h-full flex items-center p-2 pointer-events-none", isDisabled && "pointer-events-none")}>
                        <h2 className="text-4xl font-bold">{currentData.title}</h2>
                    </div>
                );
            case 'note':
                return (
                    <div className={cn("p-4 h-full flex items-center justify-center", isDisabled && "pointer-events-none")}>
                        <Textarea
                            name="content"
                            placeholder="Escreva sua nota aqui..."
                            value={currentData.content || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="border-none focus:ring-0 p-0 resize-none bg-transparent text-center text-xl font-medium"
                            disabled={isDisabled}
                        />
                    </div>
                );
            case 'map':
                 return (
                    <div className={cn("p-4 flex items-center justify-center text-muted-foreground", isDisabled && "pointer-events-none")}>
                        🗺️ Elemento de Mapa (WIP)
                    </div>
                )
            default:
                return <p className={cn("p-4", isDisabled && "pointer-events-none")}>Tipo de card desconhecido</p>;
        }
    };
    
    const isTitleCard = card.type === 'title';

    return (
        <Card 
            className={cn(
                'w-full h-full flex flex-col overflow-hidden',
                isTitleCard ? 'bg-transparent border-none shadow-none' : 'bg-card',
                isFocused && !isDisabled && !isTitleCard ? 'ring-2 ring-primary' : '',
            )}
            style={{ 
                backgroundColor: card.type === 'note' ? currentData.background_color ?? '#FFFFFF' : undefined 
            }}
            onFocus={() => !isDisabled && setIsFocused(true)}
            onBlurCapture={handleBlur}
        >
            <div className={cn("flex-grow flex items-center justify-center h-full", { "pointer-events-none": isDisabled })}>
                {renderContent()}
            </div>
        </Card>
    );
};
