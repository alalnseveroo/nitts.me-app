
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
    onLayoutChange: (layout: LayoutItem[]) => void;
    onUpdateCard: (id: string, updates: Partial<Card>) => void;
    onDeleteCard: (cardId: string) => void;
    onResizeCard: (cardId: string, w: number, h: number) => void;
    onEditCard: (cardId: string) => void;
    rowHeight: number;
    isMobile: boolean;
    isMenuOpen: boolean;
}

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onLayoutChange,
    onUpdateCard, 
    onDeleteCard, 
    onResizeCard,
    onEditCard,
    rowHeight,
    isMobile,
    isMenuOpen
}: GridLayoutProps) => {

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const handleSelectCard = useCallback((cardId: string) => {
        if (isMobile) {
            setSelectedCardId(currentId => (currentId === cardId ? null : cardId));
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMenuOpen && selectedCardId) {
            setSelectedCardId(null);
        }
    }, [isMenuOpen, selectedCardId]);
    
    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Seu canvas está vazio. Adicione um card abaixo!</p>
            </div>
        )
    }

    const handleDragStop = (layout: LayoutItem[]) => {
        onLayoutChange(layout);
    };

    const handleDragStart = () => {
        if (isMobile && selectedCardId) {
            setSelectedCardId(null);
        }
    }

    return (
        <>
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight}
            isDraggable
            isResizable={false}
            className="min-h-[400px]"
            margin={[10, 10]}
            containerPadding={[0,0]}
            compactType="vertical"
            draggableHandle={isMobile ? ".mobile-drag-handle" : ".drag-handle"}
            style={{ overflow: 'visible' }} 
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                if (!layoutItem) return null;
                return (
                    <div key={card.id} data-grid={layoutItem} className="bg-transparent overflow-visible">
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
                    <CardResizeControls onResize={(w, h) => onResizeCard(selectedCardId, w, h)} />
                </div>
                <Button 
                    onClick={() => setSelectedCardId(null)}
                    className="bg-green-500 text-white font-bold hover:bg-green-600 px-6"
                >
                    Done
                </Button>
            </div>
            </div>
        )}
        </>
    );
};

export default React.memo(GridLayoutComponent);
