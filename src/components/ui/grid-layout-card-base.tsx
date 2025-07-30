
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CardData } from '@/lib/types';
import { SubstackIcon } from './substack-icon';
import { YoutubeIcon } from './youtube-icon';
import { TiktokIcon } from './tiktok-icon';
import { FacebookIcon } from './facebook-icon';
import { InstagramIcon } from './instagram-icon';
import { DiscordIcon } from './discord-icon';

interface GridLayoutCardBaseProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
    isDisabled?: boolean;
    isEditing?: boolean;
    isMobile: boolean;
}

const getDomainIcon = (link: string | null) => {
    if (!link) return <LinkIcon className="h-8 w-8" />;
    
    try {
        const url = new URL(link);
        const domain = url.hostname.replace('www.', '');

        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return <YoutubeIcon className="h-10 w-10 text-red-600" />;
        }
        if (domain.includes('tiktok.com')) {
            return <TiktokIcon className="h-10 w-10" />;
        }
        if (domain.includes('substack.com')) {
            return <SubstackIcon className="h-10 w-10 text-orange-600" />;
        }
        if (domain.includes('instagram.com')) {
            return <InstagramIcon className="h-10 w-10" />;
        }
        if (domain.includes('discord')) {
            return <DiscordIcon className="h-10 w-10 text-indigo-500" />;
        }
        if (domain.includes('facebook.com')) {
            return <FacebookIcon className="h-10 w-10 text-blue-600" />;
        }


        return <LinkIcon className="h-8 w-8" />;

    } catch (error) {
        return <LinkIcon className="h-8 w-8" />;
    }
}

export const GridLayoutCardBase = ({ card, onUpdate, isDisabled = false, isEditing = false, isMobile }: GridLayoutCardBaseProps) => {
    const [currentData, setCurrentData] = useState(card);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentData(card);
    }, [card]);
    
    useEffect(() => {
        if (isEditing && card.type === 'note' && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing, card.type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = () => {
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
            case 'link': {
                const Icon = getDomainIcon(currentData.link);
                const isYoutube = card.link?.includes('youtube.com') || card.link?.includes('youtu.be');
                return (
                    <div className={cn("flex flex-col items-start justify-center text-left p-4 gap-2 h-full", isDisabled && "pointer-events-none")}>
                        <div className="flex-shrink-0" style={{ color: currentData.text_color ?? 'currentColor' }}>
                            {Icon}
                        </div>
                         <div className="flex-grow flex flex-col items-start justify-center">
                             <h3 className="font-bold text-lg break-words w-full whitespace-pre-wrap" style={{ color: currentData.text_color ?? 'currentColor' }}>
                                {currentData.title || currentData.link}
                            </h3>
                            {isYoutube ? (
                                <div className='text-left mt-2'>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full pointer-events-none">
                                        Subscribe
                                    </Button>
                                    <p className="text-sm font-semibold text-neutral-800">466K</p>
                                </div>
                            ) : (
                                currentData.link && <p className="text-sm break-all w-full opacity-60" style={{ color: currentData.text_color ?? 'currentColor' }}>{currentData.link.replace(/^(https?:\/\/)?(www\.)?/, '')}</p>
                            )}
                        </div>
                    </div>
                );
            }
            case 'title':
                 return (
                    <h3 className={cn("w-full h-full flex items-center justify-start p-2 text-2xl font-bold pointer-events-none", isDisabled && "pointer-events-none")}>
                        {currentData.title}
                    </h3>
                );
            case 'note':
                return (
                    <Textarea
                        ref={textareaRef}
                        name="content"
                        placeholder="Escreva sua nota aqui..."
                        value={currentData.content || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                            "border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 resize-none bg-transparent text-center text-xl font-medium",
                            !isEditing && "pointer-events-none"
                        )}
                        disabled={!isEditing}
                    />
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
    const isNoteCard = card.type === 'note';

    const cardStyle = {
        backgroundColor: currentData.background_color ?? undefined,
    };

    return (
        <Card 
            className={cn(
                'w-full h-full flex flex-col overflow-hidden rounded-3xl md:rounded-lg',
                isTitleCard ? 'bg-transparent border-none shadow-none' : (card.type !== 'link' && 'bg-card')
            )}
            style={cardStyle}
        >
             <div className={cn(
                "w-full h-full p-0", 
                { "pointer-events-none": isDisabled && card.type !== 'note' },
                isNoteCard && 'flex items-center justify-center p-4'
            )}>
                {renderContent()}
            </div>
        </Card>
    );
};
