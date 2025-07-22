
'use client'

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { supabase } from '@/lib/supabase/client';
import { GridLayoutCard } from './grid-layout-card';
import { useToast } from '@/hooks/use-toast';
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
    onDeleteCard: (cardId: string) => void;
    onResizeCard: (cardId: string, w: number, h: number) => void;
    onSelectCard: (cardId: string) => void;
    selectedCardId: string | null;
    rowHeight: number;
    isMobile: boolean;
}

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onLayoutChange, 
    onDeleteCard, 
    onResizeCard,
    onSelectCard,
    selectedCardId,
    rowHeight,
    isMobile
}: GridLayoutProps) => {
    const { toast } = useToast();

    const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
        const { error } = await supabase.from('cards').update(updates).eq('id', id);
        if (error) {
            toast({ title: 'Erro', description: 'Falha ao atualizar o card.', variant: 'destructive' });
        } else {
           // Do not show toast on every auto-save for a better UX
        }
    };
    
    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Seu canvas está vazio. Adicione um card abaixo!</p>
            </div>
        )
    }

    return (
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onLayoutChange={(layout, allLayouts) => {
                const newLayout = allLayouts.lg || allLayouts.sm || [];
                onLayoutChange(newLayout);
            }}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight}
            isDraggable
            isResizable={false} // Resizing is handled by buttons now
            className="min-h-[400px]"
            margin={[20, 20]}
            compactType="vertical"
            draggableHandle=".drag-handle"
            style={{ overflow: 'visible' }} 
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                return (
                    <div key={card.id} data-grid={layoutItem} className="bg-transparent overflow-visible group/card">
                        <GridLayoutCard
                            card={card}
                            onUpdate={handleUpdateCard}
                            onDelete={onDeleteCard}
                            onResize={onResizeCard}
                            onClick={onSelectCard}
                            isSelected={selectedCardId === card.id}
                            isMobile={isMobile}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    );
};

export default GridLayoutComponent;
