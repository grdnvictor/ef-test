"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const taskFormSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    description: z.string().optional(),
});

type TaskFormErrors = Partial<Record<keyof z.infer<typeof taskFormSchema>, string>>;

interface Task {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    isDone: boolean;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<TaskFormErrors>({});

    async function fetchTasks() {
        try {
            const res = await fetch(`${API_URL}/tasks`);
            const data = await res.json();
            setTasks(data.member);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const values = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
        };

        const result = taskFormSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors: TaskFormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof TaskFormErrors;
                fieldErrors[field] = issue.message;
            }
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/ld+json" },
                body: JSON.stringify(result.data),
            });

            if (!res.ok) throw new Error("Erreur API");

            const newTask: Task = await res.json();
            setTasks((prev) => [...prev, newTask]);
            setOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erreur API");
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
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

                <Dialog open={open} onOpenChange={(v) => { setOpen(v); setErrors({}); }}>
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
                                <Input id="title" name="title" placeholder="Ex: Faire les courses" />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Détails..." />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
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