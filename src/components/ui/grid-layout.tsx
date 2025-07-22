'use client'

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
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

type LayoutItem = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
};

interface GridLayoutProps {
    userId: string;
    cards: Card[];
    layoutConfig: LayoutItem[] | null;
    onLayoutChange: (layout: LayoutItem[]) => void;
    onDeleteCard: (cardId: string) => void;
}

const GridLayoutComponent = ({ userId, cards, layoutConfig, onLayoutChange, onDeleteCard }: GridLayoutProps) => {
    const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
    const [internalCards, setInternalCards] = useState<Card[]>(cards);
    const { toast } = useToast();

    useEffect(() => {
        setInternalCards(cards);
        const dbLayout = layoutConfig || [];
        const generatedLayouts = cards.map((card, index) => {
            const layout = dbLayout.find(l => l.i === card.id);
            // Assign a default position if not found in layout config, avoiding Infinity
            return { 
                i: card.id, 
                x: layout?.x ?? (index % 12), // simple horizontal stacking
                y: layout?.y ?? Math.floor(index / 12), // simple vertical stacking
                w: layout?.w ?? 2, 
                h: layout?.h ?? 2 
            };
        });
        setLayouts({ lg: generatedLayouts });
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

    return (
        <ResponsiveGridLayout
            layouts={layouts}
            onLayoutChange={(layout, allLayouts) => onLayoutChange(allLayouts.lg)}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            isDraggable
            isResizable
            className="min-h-[400px]" // Garante uma altura mínima para o grid
        >
            {internalCards.map(card => (
                <div key={card.id} data-grid={{w:2, h:2}} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <GridLayoutCard
                        card={card}
                        onUpdate={handleUpdateCard}
                        onDelete={onDeleteCard}
                    />
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default GridLayoutComponent;

    