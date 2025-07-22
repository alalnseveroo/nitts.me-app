
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
}

const GridLayoutComponent = ({ cards, layoutConfig, onLayoutChange, onDeleteCard, onResizeCard }: GridLayoutProps) => {
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
            rowHeight={100}
            isDraggable
            isResizable={false} // Resizing is handled by buttons now
            className="min-h-[400px]"
            margin={[20, 20]}
            compactType="vertical"
            // Remove draggableHandle to allow dragging from anywhere on mobile
            // draggableHandle=".drag-handle"
            style={{ overflow: 'visible' }} 
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                return (
                    <div key={card.id} data-grid={layoutItem} className="rounded-lg shadow-md bg-card overflow-visible">
                         <div className="drag-handle absolute top-2 right-2 z-20 cursor-move opacity-0 group-hover/card:opacity-100 transition-opacity p-1 bg-background/50 rounded-full hidden md:block">
                           <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 2C5.22386 2 5 2.22386 5 2.5C5 2.77614 5.22386 3 5.5 3H9.5C9.77614 3 10 2.77614 10 2.5C10 2.22386 9.77614 2 9.5 2H5.5ZM5 5.5C5 5.22386 5.22386 5 5.5 5H9.5C9.77614 5 10 5.22386 10 5.5C10 5.77614 9.77614 6 9.5 6H5.5C5.22386 6 5 5.77614 5 5.5ZM5.5 8C5.22386 8 5 8.22386 5 8.5C5 8.77614 5.22386 9 5.5 9H9.5C9.77614 9 10 8.77614 10 8.5C10 8.22386 9.77614 8 9.5 8H5.5ZM5 11.5C5 11.2239 5.22386 11 5.5 11H9.5C9.77614 11 10 11.2239 10 11.5C10 11.7761 9.77614 12 9.5 12H5.5C5.22386 12 5 11.7761 5 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </div>
                        <GridLayoutCard
                            card={card}
                            onUpdate={handleUpdateCard}
                            onDelete={onDeleteCard}
                            onResize={onResizeCard}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    );
};

export default GridLayoutComponent;
