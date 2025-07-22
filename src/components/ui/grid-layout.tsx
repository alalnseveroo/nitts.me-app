
'use client'

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
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
    onSelectCard: (cardId: string) => void;
    onEditCard: (cardId: string) => void;
    selectedCardId: string | null;
    rowHeight: number;
    isMobile: boolean;
}

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onLayoutChange,
    onUpdateCard, 
    onDeleteCard, 
    onResizeCard,
    onSelectCard,
    onEditCard,
    selectedCardId,
    rowHeight,
    isMobile
}: GridLayoutProps) => {
    
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
            onSelectCard(selectedCardId); // This will deselect the card by toggling it
        }
    }

    return (
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
                            onDelete={onDeleteCard}
                            onResize={onResizeCard}
                            onClick={onSelectCard}
                            onEdit={onEditCard}
                            isSelected={selectedCardId === card.id}
                            isMobile={isMobile}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    );
};

export default React.memo(GridLayoutComponent);
