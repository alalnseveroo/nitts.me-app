
'use client'

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { CardData } from '@/lib/types';

interface GridLayoutProps {
    cards: CardData[];
    layoutConfig: Layout[];
    onLayoutChange: (layout: Layout[]) => void;
    onUpdateCard: (id: string, updates: Partial<CardData>) => void;
    onDeleteCard: (cardId: string) => void;
    onEditCard: (cardId: string) => void;
    isMobile: boolean;
    selectedCardId: string | null;
    onSelectCard: (id: string) => void;
    rowHeight: number;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onLayoutChange,
    onUpdateCard, 
    onDeleteCard, 
    onEditCard,
    isMobile,
    selectedCardId,
    onSelectCard,
    rowHeight
}: GridLayoutProps) => {

    const handleDragStart = () => {
        if (isMobile) {
            document.body.classList.add('no-scroll');
        }
    };
    
    const handleDragOrResizeStop = (newLayout: Layout[]) => {
        if (isMobile) {
            document.body.classList.remove('no-scroll');
        }
        onLayoutChange(newLayout);
    };

    return (
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onLayoutChange={onLayoutChange}
            onDragStart={handleDragStart}
            onDragStop={handleDragOrResizeStop}
            onResizeStop={handleDragOrResizeStop}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight}
            isResizable={!isMobile}
            className="min-h-[400px]"
            margin={[10, 10]}
            containerPadding={[0,0]}
            compactType="vertical"
            draggableHandle=".drag-handle"
        >
            {cards.map(card => (
                <div key={card.id}>
                    <GridLayoutCard
                        card={card}
                        onUpdate={onUpdateCard}
                        onDelete={onDeleteCard}
                        onEdit={onEditCard}
                        isMobile={isMobile}
                        isSelected={selectedCardId === card.id}
                        onSelectCard={onSelectCard}
                    />
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default React.memo(GridLayoutComponent);
