"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Task {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    isDone: boolean;
}

const initialTasks: Task[] = [
    {
        id: 1,
        title: "Faire les courses",
        description: "Acheter du lait",
        createdAt: "2026-02-20T12:00:00+00:00",
        isDone: false,
    },
    {
        id: 2,
        title: "Réviser TypeScript",
        description: "Revoir les generics et utility types",
        createdAt: "2026-02-19T09:00:00+00:00",
        isDone: true,
    },
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });

            if (!res.ok) throw new Error("Erreur API");

            const newTask: Task = await res.json();
            setTasks((prev) => [...prev, newTask]);
            setOpen(false);
        } catch {
            setTasks((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    title,
                    description,
                    createdAt: new Date().toISOString(),
                    isDone: false,
                },
            ]);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erreur API");
        } catch {
            // silently fallback
        } finally {
            setTasks((prev) => prev.filter((t) => t.id !== id));
        }
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">← Accueil</Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Mes tâches</h1>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Nouvelle tâche</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer une tâche</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Titre</Label>
                                <Input id="title" name="title" required placeholder="Ex: Faire les courses" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Détails..." />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Création..." : "Créer"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {tasks.map((task) => (
                    <Card key={task.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">{task.title}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant={task.isDone ? "default" : "secondary"}>
                                    {task.isDone ? "Terminée" : "En cours"}
                                </Badge>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(task.id)}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {tasks.length === 0 && (
                    <p className="py-12 text-center text-muted-foreground">
                        Aucune tâche pour le moment.
                    </p>
                )}
            </div>
        </main>
    );
}