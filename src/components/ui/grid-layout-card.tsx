'use client'

import React, { useState, useRef } from 'react';
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
import { Trash2, UploadCloud } from 'lucide-react';

type Card = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
};

interface GridLayoutCardProps {
    card: Card;
    onUpdate: (id: string, updates: Partial<Card>) => void;
    onDelete: (id: string) => void;
}

export const GridLayoutCard = ({ card, onUpdate, onDelete }: GridLayoutCardProps) => {
    const [currentCard, setCurrentCard] = useState(card);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof Omit<Card, 'id' | 'user_id' | 'type'>, value: string) => {
        setCurrentCard(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const { id, type, user_id, ...updates } = currentCard;
        onUpdate(id, updates);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${card.user_id}/${card.id}-${Date.now()}.${fileExt}`;

        try {
            setUploading(true);
            // Corrected to use the 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars') 
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Corrected to get the URL from the 'avatars' bucket
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            setCurrentCard(prev => ({ ...prev, background_image: publicUrl }));
            onUpdate(card.id, { background_image: publicUrl });

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
                    <div className="w-full h-full">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {currentCard.background_image ? (
                            <img 
                                src={currentCard.background_image} 
                                alt={currentCard.title || 'Card image'}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            />
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md border-2 border-dashed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-2"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-8 w-8 text-gray-500 mb-2" />
                                        <span className="text-sm font-semibold">Clique para enviar</span>
                                        <span className="text-xs text-gray-500">PNG, JPG, GIF</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );
            case 'link':
                return (
                    <div className="space-y-3 p-4">
                        <Input
                            placeholder="Título do Link"
                            value={currentCard.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                        <Input
                            placeholder="https://exemplo.com"
                            value={currentCard.link || ''}
                            onChange={(e) => handleChange('link', e.target.value)}
                        />
                    </div>
                );
            case 'title':
                 return (
                    <div className="p-4">
                        <Input
                            placeholder="Título Principal"
                            className="text-xl font-bold border-none focus:ring-0 p-0"
                            value={currentCard.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>
                );
            case 'note':
                return (
                    <div className="p-4 h-full">
                        <Textarea
                            placeholder="Escreva sua nota aqui..."
                            value={currentCard.content || ''}
                            onChange={(e) => handleChange('content', e.target.value)}
                            className="border-none focus:ring-0 p-0 h-full resize-none"
                        />
                    </div>
                );
            case 'map':
                return <p className="text-sm text-gray-500 p-4">🗺️ Elemento de Mapa (WIP)</p>
            default:
                return <p className="p-4">Tipo de card desconhecido</p>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-lg border overflow-hidden">
            <div className="flex-grow flex items-center justify-center">
                {renderCardContent()}
            </div>
            <div className="flex items-center justify-end p-2 space-x-2 border-t">
                 <Button size="sm" variant="outline" onClick={handleSave}>Salvar</Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
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
                            <AlertDialogAction onClick={() => onDelete(card.id)} className="bg-red-600 hover:bg-red-700">
                                Deletar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};
