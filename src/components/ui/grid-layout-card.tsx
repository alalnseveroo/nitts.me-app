
'use client'

import React, { useState } from 'react';
import { GridLayoutCardBase } from './grid-layout-card-base';
import { Button } from '@/components/ui/button';
import { Move, Trash2, Edit } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { CardData } from '@/app/[username]/page';

interface GridLayoutCardProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onSelectCard: (id: string) => void;
    isSelected: boolean;
    isMobile: boolean;
}

const GridLayoutCardComponent = ({ card, onUpdate, onDelete, onEdit, onSelectCard, isSelected, isMobile }: GridLayoutCardProps) => {
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isTitleCard = card.type === 'title';

    const handleClick = (e: React.MouseEvent) => {
        if (!isMobile && (e.target as HTMLElement).closest('.drag-handle, [data-alert-dialog-trigger]')) {
             e.stopPropagation();
             return;
        }

        if (isMobile) {
            onSelectCard(card.id);
        } else {
            onEdit(card.id);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(card.id);
    }
    
    const handleDeleteTriggerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteDialogOpen(true);
    }

    const handleDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(card.id);
        setIsDeleteDialogOpen(false);
    }
    
    const handleDialogCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteDialogOpen(false);
    }


    return (
        <div 
            className="w-full h-full relative group/card"
            onClick={handleClick}
            data-card-id={card.id}
        >
             <div className={cn(
                "w-full h-full rounded-lg transition-all",
                isSelected && !isTitleCard ? "border-2 border-foreground" : "border-2 border-transparent",
                isMobile && !isSelected && "cursor-pointer"
            )}>
                 <GridLayoutCardBase
                    card={card}
                    onUpdate={onUpdate}
                    isDisabled={isMobile && !isSelected}
                    isMobile={isMobile}
                />
            </div>
            
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                     <span />
                </AlertDialogTrigger>
                
                {/* --- DESKTOP CONTROLS --- */}
                {!isMobile && (
                    <>
                        <div className="drag-handle absolute top-2 right-2 z-20 cursor-move text-white bg-black/30 rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <Move className="h-5 w-5" />
                        </div>
                        <Button
                            data-alert-dialog-trigger
                            title="Deletar"
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteTriggerClick}
                            className="absolute top-[-10px] left-[-10px] z-20 h-8 w-8 rounded-full bg-white text-black shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {/* --- MOBILE CONTROLS --- */}
                { isMobile && isSelected && (
                    <>
                        <Button
                            title="Deletar"
                            variant="default"
                            size="icon"
                            onClick={handleDeleteTriggerClick}
                            className="absolute top-[-12px] left-[-12px] z-30 h-8 w-8 rounded-full bg-white text-black shadow-lg hover:bg-gray-200"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                            title="Editar conteúdo"
                            variant="default"
                            size="icon"
                            onClick={handleEditClick}
                            className="absolute top-[-12px] right-[-12px] z-30 h-8 w-8 rounded-full bg-black text-white shadow-lg hover:bg-gray-800"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        
                        <div className="drag-handle absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-30 cursor-move bg-black text-white rounded-full p-2 shadow-lg">
                            <Move className="h-5 w-5" />
                        </div>
                    </>
                )}

                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso deletará o card permanentemente. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDialogCancel}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

            </AlertDialog>
        </div>
    );
};


export const GridLayoutCard = React.memo(GridLayoutCardComponent);

    

    