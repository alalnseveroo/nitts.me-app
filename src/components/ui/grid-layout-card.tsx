
'use client'

import React from 'react';
import { GridLayoutCardBase } from './grid-layout-card-base';
import { CardResizeControls } from './card-resize-controls';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
    onResize: (id: string, w: number, h: number) => void;
}

export const GridLayoutCard = ({ card, onUpdate, onDelete, onResize }: GridLayoutCardProps) => {
    return (
        <div className="w-full h-full relative group/card">
            {/* Card Base */}
            <GridLayoutCardBase
                card={card}
                onUpdate={onUpdate}
            />

            {/* Mobile does not get hover controls */}
            <div className="hidden md:block">
                {/* Delete Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            title="Deletar"
                            variant="ghost"
                            size="icon"
                            className="absolute top-[-10px] left-[-10px] z-20 h-8 w-8 rounded-full bg-white text-black shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-gray-200"
                        >
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

                {/* Resize Controls Toolbar */}
                <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <div className="bg-black text-white rounded-lg shadow-xl p-1">
                        <CardResizeControls onResize={(w, h) => onResize(card.id, w, h)} />
                    </div>
                </div>
            </div>
        </div>
    );
};
