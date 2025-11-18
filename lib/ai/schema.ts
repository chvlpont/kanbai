import { z } from 'zod'

// ============================================================================
// ACTION PAYLOADS
// ============================================================================

export const CreateTaskPayload = z.object({
  columnId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
})

export const UpdateTaskPayload = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
})

export const MoveTaskPayload = z.object({
  taskId: z.string().uuid(),
  targetColumnId: z.string().uuid(),
})

export const DeleteTaskPayload = z.object({
  taskId: z.string().uuid(),
})

export const CreateColumnPayload = z.object({
  title: z.string().min(1).max(100),
})

export const RenameColumnPayload = z.object({
  columnId: z.string().uuid(),
  newTitle: z.string().min(1).max(100),
})

export const DeleteColumnPayload = z.object({
  columnId: z.string().uuid(),
})

export const CleanupDoneTasksPayload = z.object({
  columnTitle: z.string().default('Done'),
})

// ============================================================================
// ACTIONS
// ============================================================================

export const Action = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('create_task'),
    payload: CreateTaskPayload,
  }),
  z.object({
    type: z.literal('update_task'),
    payload: UpdateTaskPayload,
  }),
  z.object({
    type: z.literal('move_task'),
    payload: MoveTaskPayload,
  }),
  z.object({
    type: z.literal('delete_task'),
    payload: DeleteTaskPayload,
  }),
  z.object({
    type: z.literal('create_column'),
    payload: CreateColumnPayload,
  }),
  z.object({
    type: z.literal('rename_column'),
    payload: RenameColumnPayload,
  }),
  z.object({
    type: z.literal('delete_column'),
    payload: DeleteColumnPayload,
  }),
  z.object({
    type: z.literal('cleanup_done_tasks'),
    payload: CleanupDoneTasksPayload,
  }),
])

// ============================================================================
// AI RESPONSE
// ============================================================================

export const AIResponse = z.object({
  message: z.string(),
  actions: z.array(Action),
})

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Action = z.infer<typeof Action>
export type AIResponse = z.infer<typeof AIResponse>

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}
