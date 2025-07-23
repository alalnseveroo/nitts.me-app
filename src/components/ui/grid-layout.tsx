
'use client'

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { CardData } from '@/app/[username]/page';


interface GridLayoutProps {
    cards: CardData[];
    layoutConfig: Layout[];
    onLayoutChange: (layout: Layout[]) => void;
    onUpdateCard: (id: string, updates: Partial<CardData>) => void;
    onDeleteCard: (cardId: string) => void;
    onResizeCard: (cardId: string, w: number, h: number) => void;
    onEditCard: (cardId: string) => void;
    onMenuStateChange: (isOpen: boolean) => void;
    isMobile: boolean;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onLayoutChange,
    onUpdateCard, 
    onDeleteCard, 
    onResizeCard,
    onEditCard,
    onMenuStateChange,
    isMobile
}: GridLayoutProps) => {

    const handleDragStart = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent | TouchEvent, element: HTMLElement) => {
        if (isMobile) {
            document.body.classList.add('no-scroll');
        }
    };
    
    const handleDragStop = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent | TouchEvent, element: HTMLElement) => {
        if (isMobile) {
            document.body.classList.remove('no-scroll');
        }
        onLayoutChange(layout);
    };

    return (
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onLayoutChange={onLayoutChange}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={100}
            isResizable={!isMobile}
            className="min-h-[400px]"
            margin={[20, 20]}
            containerPadding={[0,0]}
            compactType="vertical"
            draggableHandle=".drag-handle"
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                if (!layoutItem) return null;
                return (
                    <div key={card.id} data-grid={layoutItem}>
                        <GridLayoutCard
                            card={card}
                            onUpdate={onUpdateCard}
                            onDelete={() => onDeleteCard(card.id)}
                            onResize={(w, h) => onResizeCard(card.id, w, h)}
                            onEdit={onEditCard}
                            onMenuStateChange={onMenuStateChange}
                            isMobile={isMobile}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    );
};

export default React.memo(GridLayoutComponent);
