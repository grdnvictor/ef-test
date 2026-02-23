import { z } from "zod";

/**
 * Schéma de validation pour le formulaire de création de tâche.
 * => Voir pour générer des types depuis les entités côté API
 */
export const taskFormSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    description: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

/** Erreurs de validation par champ (partiel car chaque champ peut être valide). */
export type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;