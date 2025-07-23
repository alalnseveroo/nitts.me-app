
'use client'

import { cn } from "@/lib/utils"
import { Button } from "./button"

interface CardColorControlsProps {
    onColorChange: (color: string) => void;
}

const colors = [
    { name: 'Branco', value: '#FFFFFF' },
    { name: 'Amarelo', value: '#FFFACD' },
    { name: 'Azul', value: '#E0F2FE' },
    { name: 'Verde', value: '#DFF2E3' },
    { name: 'Rosa', value: '#FFE4E1' },
]

export const CardColorControls = ({ onColorChange }: CardColorControlsProps) => {
    return (
        <div className="flex gap-1 items-center justify-center">
            {colors.map((color) => (
                <Button
                    key={color.value}
                    title={color.name}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0 border border-black/20 hover:bg-transparent"
                    onClick={() => onColorChange(color.value)}
                >
                    <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: color.value }}
                    />
                </Button>
            ))}
        </div>
    )
}
