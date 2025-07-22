'use client'

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { supabase } from '@/lib/supabase';
import { GridLayoutCard } from './grid-layout-card';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Tipos de dados
type Card = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
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
    onAddCard: (type: string) => void;
    onDeleteCard: (cardId: string) => void; // Prop para deleção
}

const GridLayoutComponent = ({ userId, onAddCard, onDeleteCard }: GridLayoutProps) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setLoading(true);
            const cardsPromise = supabase.from('cards').select('*').eq('user_id', userId);
            const profilePromise = supabase.from('profiles').select('layout_config').eq('id', userId).single();
            const [cardsResult, profileResult] = await Promise.all([cardsPromise, profilePromise]);
            const { data: cardsData, error: cardsError } = cardsResult;
            const { data: profileData, error: profileError } = profileResult;
            if (cardsError || profileError) {
                console.error("Erro ao buscar dados:", cardsError || profileError);
                setLoading(false);
                return;
            }
            if (cardsData && profileData) {
                setCards(cardsData);
                const dbLayout = profileData.layout_config as LayoutItem[] || [];
                const generatedLayouts = cardsData.map(card => {
                    const layout = dbLayout.find(l => l.i === card.id);
                    return { i: card.id, x: layout?.x ?? 0, y: layout?.y ?? Infinity, w: layout?.w ?? 2, h: layout?.h ?? 2 };
                });
                setLayouts({ lg: generatedLayouts });
            }
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    const handleLayoutChange = async (newLayout: LayoutItem[]) => {
        const { error } = await supabase.from('profiles').update({ layout_config: newLayout }).eq('id', userId);
        if (error) console.error("Erro ao salvar o layout:", error);
    };

    const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
        const { error } = await supabase.from('cards').update(updates).eq('id', id);
        if (error) {
            alert('Falha ao atualizar o card.');
        } else {
            setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
    };
    
    // handleDeleteCard local removida, usaremos a que vem das props.

    if (loading) {
        return <div className="text-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div></div>;
    }

    return (
        <ResponsiveGridLayout
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            isDraggable
            isResizable
        >
            {cards.map(card => (
                <div key={card.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <GridLayoutCard
                        card={card}
                        onUpdate={handleUpdateCard}
                        onDelete={onDeleteCard} // Passando a função recebida via props
                    />
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default GridLayoutComponent;
