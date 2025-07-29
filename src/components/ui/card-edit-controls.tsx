
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Check } from 'lucide-react';
import { CardResizeControls } from './card-resize-controls';
import type { CardData } from '@/lib/types';

interface CardEditControlsProps {
    card: CardData;
    onUpdate: (id: string, updates: Partial<CardData>) => void;
    onResize: (id: string, w: number, h: number) => void;
    onDone: () => void;
}

export const CardEditControls = ({ card, onUpdate, onResize, onDone }: CardEditControlsProps) => {
    const [link, setLink] = useState(card.link || '');

    useEffect(() => {
        setLink(card.link || '');
    }, [card]);

    const handleLinkSave = () => {
        onUpdate(card.id, { link });
        onDone();
    };
    
    const handleResize = (w: number, h: number) => {
        onResize(card.id, w, h);
    };

    return (
        <div data-card-edit-controls className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border flex p-2 gap-2">
                <CardResizeControls onResize={handleResize} />
                <div className="flex-1 flex items-center gap-2">
                     <Link className="h-5 w-5 text-neutral-500" />
                    <Input
                        type="url"
                        placeholder="Cole o link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="bg-transparent border-none text-black placeholder:text-neutral-500 focus:ring-0 h-8"
                    />
                </div>
                <Button
                    onClick={handleLinkSave}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4"
                >
                    <Check className="h-4 w-4 mr-1" />
                    Feito
                </Button>
            </div>
        </div>
    );
};

    