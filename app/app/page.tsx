import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-background to-muted/40">
            <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          React / Symfony
        </span>
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Test technique EF
                </h1>
            </div>
            <Button size="lg" asChild>
                <Link href="/tasks">Voir mes tâches →</Link>
            </Button>
        </main>
    );
}