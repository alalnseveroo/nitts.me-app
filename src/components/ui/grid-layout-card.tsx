
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { GridLayoutCardBase } from './grid-layout-card-base';
import { Button } from '@/components/ui/button';
import { Move, Trash2, Edit, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardData } from '@/lib/types';

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
    
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isConfirmingDelete) {
            timer = setTimeout(() => {
                setIsConfirmingDelete(false);
            }, 3000); // Revert after 3 seconds
        }
        return () => clearTimeout(timer);
    }, [isConfirmingDelete]);

    const isTitleCard = card.type === 'title';

    const handleClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isControlClick = target.closest('.drag-handle, [data-delete-button], [data-edit-button]');
        
        if (isControlClick) {
             e.stopPropagation();
             return;
        }

        if (isMobile) {
            onSelectCard(card.id);
        } else {
            // For desktop, any click that is not a control click should trigger edit
            onEdit(card.id);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(card.id);
    }
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isConfirmingDelete) {
            onDelete(card.id);
        } else {
            setIsConfirmingDelete(true);
        }
    };

    return (
        <div 
            className="w-full h-full relative group/card"
            onClick={handleClick}
            data-card-id={card.id}
        >
             <div className={cn(
                "w-full h-full transition-all overflow-hidden",
                isSelected && !isTitleCard ? "border-2 border-foreground rounded-3xl md:rounded-lg" : "border-2 border-transparent",
                isMobile && !isSelected && "cursor-pointer",
                !isMobile && "cursor-pointer"
            )}>
                 <GridLayoutCardBase
                    card={card}
                    onUpdate={onUpdate}
                    isMobile={isMobile}
                />
            </div>

            {card.tag && (
                <div 
                    className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-1 rounded-lg shadow-md pointer-events-none"
                    style={{
                        backgroundColor: card.tag_bg_color || '#F97316',
                        color: card.tag_text_color || '#FFFFFF',
                    }}
                >
                    {card.tag}
                </div>
            )}
            
            {/* --- DESKTOP CONTROLS --- */}
            {!isMobile && (
                <>
                    <div className="drag-handle absolute top-2 right-2 z-20 cursor-move text-white bg-black/30 rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Move className="h-5 w-5" />
                    </div>
                    <Button
                        data-delete-button
                        title="Deletar"
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteClick}
                        className={cn(
                            "absolute top-[-10px] left-[-10px] z-20 h-8 w-8 rounded-full shadow-md transition-all",
                             isConfirmingDelete 
                                ? "bg-white text-black hover:bg-gray-200 opacity-100" 
                                : "bg-white text-black hover:bg-gray-200 opacity-0 group-hover/card:opacity-100"
                        )}
                    >
                        {isConfirmingDelete ? <Check className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                    {(card.type !== 'map') && (
                         <Button
                            data-edit-button
                            title="Editar Card"
                            variant="ghost"
                            size="icon"
                            onClick={handleEditClick}
                            className={cn(
                                "absolute top-[-10px] right-[-10px] z-20 h-8 w-8 rounded-full shadow-md transition-all hover:bg-gray-200",
                                "bg-white text-black opacity-0 group-hover/card:opacity-100"
                            )}
                        >
                           <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </>
            )}

            {/* --- MOBILE CONTROLS --- */}
            { isMobile && isSelected && (
                <>
                    <Button
                        data-delete-button
                        title="Deletar"
                        variant="default"
                        size="icon"
                        onClick={handleDeleteClick}
                        className={cn(
                            "absolute top-[-12px] left-[-12px] z-30 h-8 w-8 rounded-full shadow-lg transition-colors",
                            isConfirmingDelete
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "bg-white text-black hover:bg-gray-200"
                        )}
                    >
                        {isConfirmingDelete ? <Check className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                    {(card.type !== 'map') && (
                        <Button
                            title="Editar conteúdo"
                            variant="default"
                            size="icon"
                            onClick={handleEditClick}
                            className={cn(
                                "absolute top-[-12px] right-[-12px] z-30 h-8 w-8 rounded-full shadow-lg",
                                "bg-black text-white hover:bg-gray-800"
                            )}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    
                    <div className="drag-handle absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-30 cursor-move bg-black text-white rounded-full p-2 shadow-lg">
                        <Move className="h-5 w-5" />
                    </div>
                </>
            )}
        </div>
    );
};


export const GridLayoutCard = React.memo(GridLayoutCardComponent);

    
