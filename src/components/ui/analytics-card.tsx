
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsCardProps {
    viewCount: number | null
    period: 'today' | '7d' | '30d'
    onPeriodChange: (period: 'today' | '7d' | '30d') => void
}

export default function AnalyticsCard({ viewCount, period, onPeriodChange }: AnalyticsCardProps) {
    
    const periods = [
        { label: 'Hoje', value: 'today' as const },
        { label: '7 dias', value: '7d' as const },
        { label: '30 dias', value: '30d' as const },
    ]

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Análise de dados</CardTitle>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                   {periods.map(p => (
                       <Button 
                            key={p.value}
                            variant="ghost"
                            size="sm"
                            onClick={() => onPeriodChange(p.value)}
                            className={cn(
                                'h-7 px-2 text-xs',
                                period === p.value && 'bg-background text-foreground shadow-sm'
                            )}
                        >
                           {p.label}
                       </Button>
                   ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{viewCount ?? '-'}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   Visualizações de página
                </p>
            </CardContent>
        </Card>
    )
}
