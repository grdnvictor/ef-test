/**
 * Représente une tâche telle que retournée par l'API (API Platform).
 * Miroir de l'entité PHP App\Entity\Task.
 */
export type Task = {
    id: number;
    title: string;
    description: string | null;
    createdAt: string;
    isDone: boolean;
};

/**
 * Payload pour créer une tâche (POST /tasks).
 * Séparé de Task car on n'envoie ni id, ni createdAt, ni isDone.
 */
export type CreateTaskPayload = {
    title: string;
    description?: string;
};