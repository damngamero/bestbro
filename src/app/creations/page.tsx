
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowUpRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const creations = [
    {
        title: 'VerdantWise',
        description: 'An AI-powered assistant to help you level up your garden game. Identify plants, diagnose problems, and get expert advice.',
        link: 'https://verdantwise.vercel.app/',
        image: 'https://i.ibb.co/JjMvssQB/imgonline-com-ua-resize-MPX297khzml0-Cdf.jpg',
        external: true,
    },
    {
        title: 'RecipeSavvy',
        description: 'Your AI-powered recipe assistant. Find recipes with what you have, get cooking help, and create variations.',
        link: '/',
        image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=1780&auto=format&fit=crop',
        external: false,
    },
]

export default function CreationsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to RecipeSavvy
                    </Link>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-headline text-primary-foreground tracking-wider">Creations by TheVibeCod3r</h1>
                    <p className="text-muted-foreground font-body mt-2">A collection of apps and experiments.</p>
                </div>
                
                <div className="grid gap-8">
                    {creations.map((creation) => (
                        <Card key={creation.title} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                             <div className="aspect-video bg-muted flex items-center justify-center relative">
                                <Image 
                                    src={creation.image} 
                                    alt={`${creation.title} screenshot`}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="website ui screenshot"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{creation.title}</CardTitle>
                                <CardDescription>{creation.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                {creation.title === 'RecipeSavvy' ? (
                                    <Link href="/" className="w-full text-center text-primary font-semibold hover:underline">
                                        You're using it :)
                                    </Link>
                                ) : (
                                    <a href={creation.link} target={creation.external ? '_blank' : '_self'} rel="noopener noreferrer" className="w-full">
                                        <Button className="w-full">
                                            Go to App
                                            {creation.external && <ArrowUpRight className="ml-2 h-4 w-4" />}
                                        </Button>
                                    </a>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
