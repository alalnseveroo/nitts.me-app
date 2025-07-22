
'use client'

import { Button } from '@/components/ui/button';
import { Square, RectangleHorizontal, RectangleVertical, Crop } from 'lucide-react';

interface CardResizeControlsProps {
    onResize: (w: number, h: number) => void;
}

export const CardResizeControls = ({ onResize }: CardResizeControlsProps) => {
    return (
        <div className="flex gap-1">
            {/* Baseado em um rowHeight de 100, um h:2 fica mais quadrado */}
            <Button title="Quadrado (1x1)" variant="ghost" size="icon" onClick={() => onResize(1, 2)}>
                <Square className="h-4 w-4" />
            </Button>
            {/* Banner (2x1) -> w:2, h:2 */}
            <Button title="Banner (2x1)" variant="ghost" size="icon" onClick={() => onResize(2, 2)}>
                <RectangleHorizontal className="h-4 w-4" />
            </Button>
            {/* Retangulo (1x2) -> w:1, h:4 */}
            <Button title="Retângulo (1x2)" variant="ghost" size="icon" onClick={() => onResize(1, 4)}>
                <RectangleVertical className="h-4 w-4" />
            </Button>
            {/* Grande (2x2) -> w:2, h:4 */}
            <Button title="Grande (2x2)" variant="ghost" size="icon" onClick={() => onResize(2, 4)}>
                <Crop className="h-4 w-4" />
            </Button>
        </div>
    );
};

    