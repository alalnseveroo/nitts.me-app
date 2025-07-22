'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog"
import { Trash2, GripVertical } from 'lucide-react';

type CardData = {
    id: string;
    type: string;
    title?: string | null;
    content?: string | null;
    url?: string | null;
    background_image?: string | null;
    w: number;
    h: number;
    position: number;
};

interface ElementCardProps {
    data: CardData;
    isEditable?: boolean;
    dragHandleProps?: any;
    onUpdate?: (id: string, newContent: Partial<CardData>) => void;
    onDelete?: (id: string) => void;
}

export const ElementCard = ({ data, isEditable = false, dragHandleProps, onUpdate, onDelete }: ElementCardProps) => {
    const [currentData, setCurrentData] = useState(data);

    const handleContentChange = (field: keyof CardData, value: any) => {
        setCurrentData(prev => ({ ...prev, [field]: value }));
    };

    const saveChanges = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        if (onUpdate) {
            onUpdate(data.id, currentData);
        }
    };
    
    // Public view renderer
    const renderPublicView = () => {
        switch (data.type) {
            case 'link':
                return (
                    <Button asChild className="w-full">
                        <Link href={data.url || '#'} target="_blank" rel="noopener noreferrer">
                            {data.title || data.url}
                        </Link>
                    </Button>
                );
            case 'title':
                return <h2 className="text-xl font-bold text-center">{data.title}</h2>;
            case 'note':
                return <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.content}</p>;
            case 'image':
                 return (
                    <div className="aspect-square w-full rounded-md overflow-hidden">
                        <img src={data.background_image || 'https://placehold.co/400x400.png'} alt={data.title || 'image'} className="w-full h-full object-cover" />
                    </div>
                );
            default:
                return null;
        }
    };

    // Editable view renderer (inside the grid layout)
    const renderEditableView = () => {
        // Since GridLayoutCard handles the editing UI, this component doesn't need to.
        // It just renders the public view. The edit page will use a different component or logic.
        // For simplicity, we can render a placeholder or the public view itself.
        return renderPublicView();
    };

    if (!isEditable) {
        return (
            <Card>
                <CardContent className="p-4">
                    {renderPublicView()}
                </CardContent>
            </Card>
        )
    }

    // This part is for the old implementation and can be removed if edit page is fully separate
    return (
        <div className="flex w-full items-center p-4 bg-white rounded-lg border shadow-sm">
            {dragHandleProps && (
                <div {...dragHandleProps} className="p-2 cursor-grab self-start">
                     <GripVertical className="h-6 w-6 text-gray-400" />
                </div>
            )}
            <div className="flex-grow ml-2">
                {/* Editable fields would go here, but this is simplified for now */}
                {renderPublicView()}
            </div>
            <div className="flex flex-col items-center ml-4 space-y-2 self-start">
                 {onUpdate && <Button size="sm" onClick={saveChanges} className="w-full">Salvar</Button>}
                 {onDelete && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso irá deletar permanentemente o elemento da sua página.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(data.id)} className="bg-red-500 hover:bg-red-600">
                                Deletar
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
            </div>
        </div>
    );
};
