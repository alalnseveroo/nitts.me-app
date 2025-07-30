
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
    {
        name: "Mensal",
        price: "R$ 19",
        priceSuffix: "/mês",
        description: "Ideal para começar e explorar todas as funcionalidades.",
        features: ["Links ilimitados", "Analytics básicas", "Personalização de temas"],
        planId: "monthly"
    },
    {
        name: "Anual",
        price: "R$ 199",
        priceSuffix: "/ano",
        description: "O melhor custo-benefício, com dois meses de desconto.",
        features: ["Tudo do plano Mensal", "Analytics avançadas", "Suporte prioritário", "Remoção da marca ConectaBio"],
        isFeatured: true,
        planId: "annual"
    },
    {
        name: "Vitalício",
        price: "R$ 599",
        priceSuffix: "pagamento único",
        description: "Pague uma vez e tenha acesso para sempre, incluindo futuras atualizações.",
        features: ["Tudo do plano Anual", "Acesso a todas as futuras funcionalidades", "Selo de membro fundador"],
        planId: "lifetime"
    }
]

export default function PricingPage() {
    return (
        <div className="w-full min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Planos flexíveis para todos</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Escolha o plano que melhor se adapta às suas necessidades. Cancele quando quiser.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`flex flex-col ${plan.isFeatured ? 'border-primary shadow-lg' : ''}`}>
                            <CardHeader className="pb-4">
                                {plan.isFeatured && (
                                     <div className="flex justify-end">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-primary text-primary-foreground">
                                            Popular
                                        </span>
                                    </div>
                                )}
                                <CardTitle className="text-2xl font-bold pt-2">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                    <span className="ml-2 text-xl font-medium text-muted-foreground">{plan.priceSuffix}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center">
                                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant={plan.isFeatured ? 'default' : 'outline'}>
                                    <Link href={`/signup?plan=${plan.planId}`}>
                                        Escolher Plano
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                 <div className="text-center mt-16">
                    <p className="text-muted-foreground">
                        Já tem uma conta? <Link href="/login" className="font-semibold text-primary hover:underline">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
