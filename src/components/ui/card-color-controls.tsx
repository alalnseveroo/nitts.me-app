
'use client'

import { Paintbrush } from "lucide-react"
import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CardColorControlsProps {
    onColorChange: (color: string, textColor: string) => void;
}

const colors = [
    { name: 'Branco', value: '#FFFFFF', textColor: '#000000'},
    { name: 'Amarelo', value: '#FFFACD', textColor: '#000000'},
    { name: 'Azul', value: '#E0F2FE', textColor: '#000000'},
    { name: 'Verde', value: '#DFF2E3', textColor: '#000000'},
    { name: 'Rosa', value: '#FFE4E1', textColor: '#000000'},
]

export const CardColorControls = ({ onColorChange }: CardColorControlsProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20 hover:text-white">
                    <Paintbrush className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center" side="top">
                <div className="flex flex-col gap-1 items-center justify-center">
                    {colors.map((color) => (
                        <Button
                            key={color.value}
                            title={color.name}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 border border-black/20 hover:bg-transparent"
                            onClick={() => onColorChange(color.value, color.textColor)}
                        >
                            <div
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: color.value }}
                            />
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
