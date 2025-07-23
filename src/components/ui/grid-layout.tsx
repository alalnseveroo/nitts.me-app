
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
import { CardResizeControls } from '@/components/ui/card-resize-controls';
import { Button } from '@/components/ui/button';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

type Card = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
};

type LayoutItem = Layout;

interface GridLayoutProps {
    cards: Card[];
    layoutConfig: LayoutItem[];
    onDragStop: (layout: LayoutItem[]) => void;
    onUpdateCard: (id: string, updates: Partial<Card>) => void;
    onDeleteCard: (cardId: string) => void;
    onResizeCard: (cardId: string, w: number, h: number) => void;
    onEditCard: (cardId: string) => void;
    rowHeight: number;
    isMobile: boolean;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onDragStop,
    onUpdateCard, 
    onDeleteCard, 
    onResizeCard,
    onEditCard,
    rowHeight,
    isMobile,
    isMenuOpen,
    setIsMenuOpen
}: GridLayoutProps) => {

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    useEffect(() => {
        if (isMenuOpen && selectedCardId) {
            setSelectedCardId(null);
        }
    }, [isMenuOpen, selectedCardId])

    const handleSelectCard = useCallback((cardId: string) => {
        setSelectedCardId(currentId => (currentId === cardId ? null : cardId));
    }, []);
    
    const handleDragStart = useCallback((layout: LayoutItem[], oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent | TouchEvent, element: HTMLElement) => {
        if (isMobile && selectedCardId) {
            if(element.contains(e.target as Node)) {
              setSelectedCardId(null);
            }
        }
    }, [isMobile, selectedCardId]);

    return (
        <>
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onDragStart={handleDragStart}
            onDragStop={onDragStop}
            onResizeStop={onDragStop}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight}
            isDraggable
            isResizable={!isMobile}
            className="min-h-[400px]"
            margin={[10, 0]}
            containerPadding={[0,0]}
            compactType="vertical"
            draggableHandle={isMobile ? ".mobile-drag-handle" : ".drag-handle"}
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                if (!layoutItem) return null;
                return (
                    <div key={card.id} data-grid={layoutItem}>
                        <GridLayoutCard
                            card={card}
                            onUpdate={onUpdateCard}
                            onDelete={() => {
                                onDeleteCard(card.id);
                                if (isMobile) setSelectedCardId(null);
                            }}
                            onResize={(w, h) => onResizeCard(card.id, w, h)}
                            onClick={handleSelectCard}
                            onEdit={onEditCard}
                            isSelected={selectedCardId === card.id}
                            isMobile={isMobile}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
        {isMobile && selectedCardId && (
            <div className="fixed bottom-24 left-0 w-full p-4 z-50" onClick={(e) => e.stopPropagation()}>
                <div className="bg-black/90 backdrop-blur-sm rounded-xl shadow-2xl flex justify-between items-center p-2 gap-2">
                    <div className="flex-1">
                        <CardResizeControls onResize={(w, h) => {
                            onResizeCard(selectedCardId, w, h);
                            setSelectedCardId(null);
                        }} />
                    </div>
                    <Button 
                        onClick={() => setSelectedCardId(null)}
                        className="bg-green-500 text-white font-bold hover:bg-green-600 px-6"
                    >
                        Feito
                    </Button>
                </div>
            </div>
        )}
        </>
    );
};

export default React.memo(GridLayoutComponent);
