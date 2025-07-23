
'use client'

import React from 'react';
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
    onResize: (id: string, w: number, h: number) => void;
    onEdit: (id: string) => void;
    onSelectCard: (id: string) => void;
    isSelected: boolean;
    isMobile: boolean;
    onMenuStateChange: (isOpen: boolean) => void;
}

const GridLayoutCardComponent = ({ card, onUpdate, onDelete, onResize, onEdit, onSelectCard, isSelected, isMobile }: GridLayoutCardProps) => {
    
    const showDesktopControls = !isMobile;
    const showMobileControls = isMobile && isSelected;
    const isTitleCard = card.type === 'title';

    const handleClick = () => {
        if (isMobile) {
            onSelectCard(card.id);
        }
    };

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
            
             {/* --- DESKTOP CONTROLS --- */}
            {showDesktopControls && (
                <>
                    <div className="drag-handle absolute top-2 right-2 z-20 cursor-move text-white bg-black/30 rounded-full p-1 md:opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Move className="h-5 w-5" />
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                title="Deletar"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
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
                                <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} className="bg-destructive hover:bg-destructive/90">
                                    Deletar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    {!isTitleCard && (
                        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <div className="bg-black text-white rounded-lg shadow-xl p-1">
                                <CardResizeControls onResize={(w, h) => onResize(card.id, w, h)} />
                            </div>
                        </div>
                    )}
                    <Button
                        title="Editar conteúdo"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card selection
                            onEdit(card.id)
                        }}
                        className="absolute bottom-[-10px] left-[-10px] z-20 h-8 w-8 rounded-full bg-white text-black shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-gray-200"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </>
            )}

            {/* --- MOBILE CONTROLS --- */}
            {showMobileControls && (
                 <>
                    {/* Delete Icon */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button
                                title="Deletar"
                                variant="default"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-[-12px] left-[-12px] z-30 h-8 w-8 rounded-full bg-white text-black shadow-lg hover:bg-gray-200"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Deletar este card?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Deletar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                   
                    {/* Edit Icon */}
                     <Button
                        title="Editar conteúdo"
                        variant="default"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card deselection
                            onEdit(card.id)
                        }}
                        className="absolute top-[-12px] right-[-12px] z-30 h-8 w-8 rounded-full bg-black text-white shadow-lg hover:bg-gray-800"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    
                     {/* Drag Handle */}
                    <div className="drag-handle absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-30 cursor-move bg-black text-white rounded-full p-2 shadow-lg">
                        <Move className="h-5 w-5" />
                    </div>
                </>
            )}
        </div>
    );
};


export const GridLayoutCard = React.memo(GridLayoutCardComponent);
