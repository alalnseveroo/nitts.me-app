
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
import { CardResizeControls } from '@/components/ui/card-resize-controls';
import { Button } from '@/components/ui/button';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Input } from './input';
import { LinkIcon, Move } from 'lucide-react';

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
    isMenuOpen?: boolean;
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
    isMenuOpen,
}: GridLayoutProps) => {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [linkInputValue, setLinkInputValue] = useState('');

    const selectedCard = cards.find(c => c.id === selectedCardId);

    useEffect(() => {
        if (selectedCard) {
            setLinkInputValue(selectedCard.link || '');
        } else {
            setLinkInputValue('');
        }
    }, [selectedCard]);

    const handleSelectCard = useCallback((cardId: string) => {
        setSelectedCardId(currentId => (currentId === cardId ? null : cardId));
    }, []);

    const handleDragStart = useCallback(() => {
        if (isMobile) {
            document.body.classList.add('no-scroll');
            if (selectedCardId) {
                setSelectedCardId(null);
            }
        }
    }, [isMobile, selectedCardId]);
    
    const handleDragStop = useCallback((layout: LayoutItem[]) => {
        if (isMobile) {
            document.body.classList.remove('no-scroll');
        }
        onLayoutChange(layout);
    }, [isMobile, onLayoutChange]);

    const handleDoneClick = () => {
        if (selectedCardId && selectedCard && linkInputValue !== selectedCard.link) {
            onUpdateCard(selectedCardId, { link: linkInputValue });
        }
        setSelectedCardId(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Se o card já está selecionado E o clique foi fora do grid E fora do menu de edição.
            if (selectedCardId && !target.closest('.react-grid-layout') && !target.closest('[data-mobile-menu]')) {
                 setSelectedCardId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedCardId]);

    useEffect(() => {
        if(isMenuOpen && selectedCardId) {
            setSelectedCardId(null);
        }
    }, [isMenuOpen, selectedCardId]);

    return (
        <>
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onResizeStop={!isMobile ? onLayoutChange : undefined}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 4, sm: 2 }}
            rowHeight={rowHeight}
            isDraggable
            isResizable={!isMobile}
            className="min-h-[400px]"
            margin={[10, 10]}
            containerPadding={[0,0]}
            compactType="vertical"
            draggableHandle={isMobile ? ".mobile-drag-handle" : ".drag-handle"}
        >
            {cards.map(card => {
                const layoutItem = layoutConfig.find(l => l.i === card.id);
                if (!layoutItem) return null;
                return (
                    <div key={card.id} data-grid={layoutItem} className={card.type === 'title' && isMobile ? '!h-fit' : ''}>
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
            <div data-mobile-menu className="fixed bottom-24 left-0 w-full px-4 z-50" onClick={(e) => e.stopPropagation()}>
                <div className="bg-black/90 backdrop-blur-sm rounded-xl shadow-2xl flex items-center p-2 gap-2 flex-nowrap">
                    {selectedCard?.type !== 'title' && (
                        <div className="bg-white/10 rounded-lg p-1">
                            <CardResizeControls onResize={(w, h) => {
                                onResizeCard(selectedCardId, w, h);
                                setSelectedCardId(null);
                            }} />
                        </div>
                    )}
                    <div className="relative flex-1 min-w-0">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            placeholder="Cole o link"
                            className="bg-white/10 border-white/20 text-white pl-10 h-10 w-full"
                            value={linkInputValue}
                            onChange={(e) => setLinkInputValue(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleDoneClick}
                        className="bg-green-500 text-white font-bold hover:bg-green-600 px-4 h-10"
                    >
                        Feito
                    </Button>
                </div>
            </div>
        )}
        </>
    );
};

export default React.memo(GridLayoutComponent);

