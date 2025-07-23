
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { GridLayoutCard } from './grid-layout-card';
import { CardResizeControls } from '@/components/ui/card-resize-controls';
import { Button } from '@/components/ui/button';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Input } from './input';
import { LinkIcon } from 'lucide-react';
import type { CardData } from '@/app/[username]/page';
import { CardColorControls } from './card-color-controls';

const ResponsiveGridLayout = WidthProvider(Responsive);

type LayoutItem = Layout;

interface GridLayoutProps {
    cards: CardData[];
    layoutConfig: LayoutItem[];
    onDragStop: (layout: LayoutItem[]) => void;
    onUpdateCard: (id: string, updates: Partial<CardData>) => void;
    onDeleteCard: (cardId: string) => void;
    onResizeCard: (cardId: string, w: number, h: number) => void;
    onEditCard: (cardId: string) => void;
    rowHeight: number;
    isMobile: boolean;
    onMenuStateChange?: (isOpen: boolean) => void;
}

const GridLayoutComponent = ({ 
    cards, 
    layoutConfig, 
    onDragStop,
    onUpdateCard, 
    onDeleteCard, 
    onResizeCard,
    onEditCard,
    rowHeight,
    isMobile,
    onMenuStateChange
}: GridLayoutProps) => {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [linkInputValue, setLinkInputValue] = useState('');

    const selectedCard = cards.find(c => c.id === selectedCardId);

    useEffect(() => {
        onMenuStateChange?.(!!selectedCardId);
    }, [selectedCardId, onMenuStateChange]);

    useEffect(() => {
        if (selectedCard) {
            setLinkInputValue(selectedCard.link || '');
        } else {
            setLinkInputValue('');
        }
    }, [selectedCard]);

    const handleSelectCard = useCallback((cardId: string, e?: React.MouseEvent) => {
        // Prevent selection if click is on drag handle or an already selected card to avoid conflicts
        if (e && ((e.target as HTMLElement).closest('.mobile-drag-handle') || (e.target as HTMLElement).closest('.react-resizable-handle'))) {
            return;
        }
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
        onDragStop(layout);
    }, [isMobile, onDragStop]);

    const handleDoneClick = () => {
        if (selectedCardId && selectedCard && linkInputValue !== selectedCard.link) {
            onUpdateCard(selectedCardId, { link: linkInputValue });
        }
        setSelectedCardId(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (selectedCardId && !target.closest('.react-grid-layout') && !target.closest('[data-mobile-menu]')) {
                 setSelectedCardId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedCardId]);

    const handleColorChange = (color: string) => {
        if (selectedCardId) {
            onUpdateCard(selectedCardId, { background_color: color });
        }
    };
    
    return (
        <>
        <ResponsiveGridLayout
            layouts={{ lg: layoutConfig, sm: layoutConfig }}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onResizeStop={!isMobile ? handleDragStop : undefined}
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
                            onEdit={(cardId) => {
                                if (card.type !== 'note') {
                                    onEditCard(cardId)
                                } else {
                                     if(isMobile) handleSelectCard(cardId);
                                }
                            }}
                            isSelected={selectedCardId === card.id}
                            isMobile={isMobile}
                        />
                    </div>
                )
            })}
        </ResponsiveGridLayout>
        {isMobile && selectedCardId && (
            <div data-mobile-menu className="fixed bottom-4 left-0 w-full px-4 z-50" onClick={(e) => e.stopPropagation()}>
                <div className="bg-black/90 backdrop-blur-sm rounded-xl shadow-2xl flex items-center p-2 gap-2 flex-nowrap">
                   
                    {selectedCard?.type === 'note' && (
                         <CardColorControls onColorChange={handleColorChange} />
                    )}

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
