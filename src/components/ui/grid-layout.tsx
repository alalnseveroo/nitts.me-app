'use client'

import React, { useState, useEffect } from 'react';
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
    layoutConfig: LayoutItem[] | null;
    onLayoutChange: (layout: LayoutItem[]) => void;
    onDeleteCard: (cardId: string) => void;
}

const GridLayoutComponent = ({ cards, layoutConfig, onLayoutChange, onDeleteCard }: GridLayoutProps) => {
    const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
    const [internalCards, setInternalCards] = useState<Card[]>(cards);
    const { toast } = useToast();

    useEffect(() => {
        setInternalCards(cards);
        
        const generatedLayout = cards.map((card, index) => {
            const existingLayout = layoutConfig?.find(l => l.i === card.id);
            if (existingLayout) {
                return existingLayout;
            }
            
            let w = 2, h = 2; // Default (quadrado padrão)
            if (card.type === 'title') { w = 4; h = 1; }
            if (card.type === 'link') { w = 4; h = 1; }
            if (card.type === 'note') { w = 2; h = 3; }
            if (card.type === 'image') { w = 2; h = 2; }
            if (card.type === 'map') { w = 4; h = 4; }

            // Place new cards in a default position
            return {
                i: card.id,
                x: (index * w) % 12,
                y: Infinity, // This tells react-grid-layout to place it at the bottom
                w: w,
                h: h,
            };
        });

        setLayouts({ lg: generatedLayout });

    }, [cards, layoutConfig]);

    const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
        const { error } = await supabase.from('cards').update(updates).eq('id', id);
        if (error) {
            toast({ title: 'Erro', description: 'Falha ao atualizar o card.', variant: 'destructive' });
        } else {
            setInternalCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
            toast({ title: 'Sucesso', description: 'Card salvo!' });
        }
    };

    if (internalCards.length > 0 && layouts.lg.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Calculando layout...</div>;
    }
    
    return (
        <ResponsiveGridLayout
            layouts={layouts}
            onLayoutChange={(layout, allLayouts) => {
                if (allLayouts.lg) {
                    onLayoutChange(allLayouts.lg);
                    setLayouts(allLayouts);
                }
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            isDraggable
            isResizable
            className="min-h-[400px] bg-gray-50 rounded-md"
            margin={[15, 15]}
            compactType="vertical"
        >
            {internalCards.map(card => {
                const layoutItem = layouts.lg.find(l => l.i === card.id);
                return (
                    <div key={card.id} data-grid={layoutItem} className="bg-white rounded-lg shadow-md overflow-hidden border">
                        <GridLayoutCard
                            card={card}
                            onUpdate={handleUpdateCard}
                            onDelete={onDeleteCard}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    );
};

export default GridLayoutComponent;
