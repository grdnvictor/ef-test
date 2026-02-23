import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Task = z
  .object({
    id: z.number().int().optional(),
    title: z.string().min(3),
    description: z.union([z.string(), z.null()]).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    isDone: z.boolean().optional(),
    done: z.union([z.boolean(), z.null()]).optional(),
  })
  .passthrough();
const Error = z
  .object({
    title: z.union([z.string(), z.null()]),
    detail: z.union([z.string(), z.null()]),
    status: z.union([z.number(), z.null()]).default(400),
    instance: z.union([z.string(), z.null()]),
    type: z.string(),
  })
  .partial()
  .passthrough();
const ConstraintViolation = z
  .object({
    status: z.number().int().default(422),
    violations: z.array(
      z
        .object({
          propertyPath: z.string(),
          message: z.string(),
          code: z.string().optional(),
          hint: z.string().optional(),
          payload: z.object({}).partial().passthrough().optional(),
        })
        .passthrough()
    ),
    detail: z.string(),
    type: z.string(),
    title: z.union([z.string(), z.null()]),
    instance: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  Task,
  Error,
  ConstraintViolation,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/tasks",
    alias: "api_tasks_get_collection",
    description: `Retrieves the collection of Task resources.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/tasks",
    alias: "api_tasks_post",
    description: `Creates a Task resource.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The new Task resource`,
        type: "Body",
        schema: Task,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: Error,
      },
      {
        status: 422,
        description: `An error occurred`,
        schema: ConstraintViolation,
      },
    ],
  },
  {
    method: "get",
    path: "/tasks/:id",
    alias: "api_tasks_id_get",
    description: `Retrieves a Task resource.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: Error,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
