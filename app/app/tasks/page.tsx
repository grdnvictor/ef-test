"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import type { Task } from "@/lib/types";
import { taskFormSchema, type TaskFormErrors } from "@/lib/contracts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<TaskFormErrors>({});

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/tasks`);

            if (!response.ok) {
                throw new Error("Erreur lors du chargement des tâches");
            }

            const data = await response.json();
            setTasks(data.member ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});

        const formData = new FormData(event.currentTarget);
        const formValues = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
        };

        const validationResult = taskFormSchema.safeParse(formValues);

        if (!validationResult.success) {
            const fieldErrors: TaskFormErrors = {};

            for (const issue of validationResult.error.issues) {
                const fieldName = issue.path[0] as keyof TaskFormErrors;
                fieldErrors[fieldName] = issue.message;
            }

            setFormErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/ld+json" },
                body: JSON.stringify(validationResult.data),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la création");
            }

            const createdTask: Task = await response.json();
            setTasks((previousTasks) => [...previousTasks, createdTask]);
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(taskId: number) {
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la suppression");
            }

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== taskId)
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function handleToggleDone(targetTask: Task) {
        try {
            const response = await fetch(`${API_URL}/tasks/${targetTask.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/merge-patch+json" },
                body: JSON.stringify({ isDone: !targetTask.isDone }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour");
            }

            const updatedTask: Task = await response.json();

            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );
        } catch (error) {
            console.error(error);
        }
    }

    function handleDialogChange(open: boolean) {
        setIsDialogOpen(open);
        setFormErrors({});
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

                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
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
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Ex: Faire les courses"
                                />
                                {formErrors.title && (
                                    <p className="text-sm text-destructive">
                                        {formErrors.title}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Détails..."
                                />
                                {formErrors.description && (
                                    <p className="text-sm text-destructive">
                                        {formErrors.description}
                                    </p>
                                )}
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Création..." : "Créer"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <p className="py-12 text-center text-muted-foreground">
                    Chargement des tâches...
                </p>
            ) : tasks.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                    Aucune tâche pour le moment.
                </p>
            ) : (
                <div className="grid gap-3">
                    {tasks.map((task) => {
                        const statusLabel = task.isDone ? "Terminée" : "En cours";
                        const statusVariant = task.isDone ? "default" : "secondary";
                        const formattedDate = new Date(task.createdAt).toLocaleDateString(
                            "fr-FR"
                        );

                        return (
                            <Card key={task.id}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">{task.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className="cursor-pointer"
                                            variant={statusVariant}
                                            onClick={() => handleToggleDone(task)}
                                        >
                                            {statusLabel}
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
                                {(task.description || task.createdAt) && (
                                    <CardContent>
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {task.description}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formattedDate}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}