
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import type { Layout } from 'react-grid-layout';
import type { CardData } from '@/lib/types';
import { ElementCard } from '@/components/ui/element-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from './skeleton';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface PublicProfileGridProps {
    cards: CardData[];
    layoutConfig: Layout[] | null;
    source?: string;
}

export default function PublicProfileGrid({ cards, layoutConfig, source }: PublicProfileGridProps) {
    const [rowHeight, setRowHeight] = useState(100);
    const [isMounted, setIsMounted] = useState(false);
    const isMobile = useIsMobile();
    
    const updateRowHeight = useCallback(() => {
        if (typeof window === 'undefined') return;
        const container = document.querySelector('.public-grid-container .react-grid-layout');
        if (!container) return;

        const containerWidth = container.clientWidth;
        const cols = isMobile ? 2 : 4;
        const margin: [number, number] = [15, 15];
        const calculatedRowHeight = (containerWidth - (margin[0] * (cols + 1))) / cols;
        
        setRowHeight(calculatedRowHeight > 0 ? calculatedRowHeight : 100);
    }, [isMobile]);

    useEffect(() => {
        setIsMounted(true);
        const timer = setTimeout(() => {
            updateRowHeight();
        }, 100);
        window.addEventListener('resize', updateRowHeight);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRowHeight);
        };
    }, [updateRowHeight]);

    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Este perfil ainda não tem cards.
                </p>
            </div>
        );
    }
  
    const savedLayout = layoutConfig || [];
    const layoutMap = new Map(savedLayout.map(l => [l.i, l]));

    const finalLayout = cards.map((card, index) => {
        const existingLayout = layoutMap.get(card.id);
        const cols = isMobile ? 2 : 4;

        if (existingLayout) {
            return {
                ...existingLayout,
                i: String(existingLayout.i), 
                x: existingLayout.x ?? (index % cols),
                y: existingLayout.y ?? Math.floor(index / cols),
                w: existingLayout.w ?? (card.type === 'title' ? cols : 1),
                h: existingLayout.h ?? (card.type === 'title' ? 0.5 : 1),
            };
        }
        return { 
            i: card.id, 
            x: (index % cols), 
            y: Math.floor(index / cols), 
            w: card.type === 'title' ? cols : 1, 
            h: card.type === 'title' ? 0.5 : 1 
        };
    });

    if (!isMounted) {
        return <Skeleton className="h-[400px] w-full" />;
    }
  
  return (
    <div className="public-grid-container">
        <ResponsiveGridLayout
            layouts={{ lg: finalLayout, sm: finalLayout }}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight} 
            isDraggable={false}
            isResizable={false}
            compactType="vertical"
            margin={[15, 15]}
            containerPadding={[0, 0]}
            className="min-h-[400px]"
        >
            {cards.map(card => {
                const layout = finalLayout.find(l => l.i === card.id) || {x:0, y:0, w:1, h:1, i: card.id };
                return (
                    <div key={card.id} data-grid={layout}>
                        <ElementCard data={card} source={source} />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
    </div>
  );
}
