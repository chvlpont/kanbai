import { createClient } from '@/lib/supabase/server'
import type { Action, ActionResult } from './schema'

// ============================================================================
// MAIN EXECUTOR
// ============================================================================

export async function executeAction(
  action: Action,
  boardId: string
): Promise<ActionResult> {
  try {
    switch (action.type) {
      case 'create_task':
        return await createTask(action.payload, boardId)
      case 'update_task':
        return await updateTask(action.payload)
      case 'move_task':
        return await moveTask(action.payload)
      case 'delete_task':
        return await deleteTask(action.payload)
      case 'create_column':
        return await createColumn(action.payload, boardId)
      case 'rename_column':
        return await renameColumn(action.payload)
      case 'delete_column':
        return await deleteColumn(action.payload)
      case 'cleanup_done_tasks':
        return await cleanupDoneTasks(action.payload, boardId)
      default:
        return {
          success: false,
          error: `Unknown action type: ${(action as any).type}`,
        }
    }
  } catch (error) {
    console.error('Action execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// TASK ACTIONS
// ============================================================================

async function createTask(
  payload: { columnId: string; title: string; description?: string },
  boardId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify column belongs to this board
  const { data: column } = await supabase
    .from('columns')
    .select('id')
    .eq('id', payload.columnId)
    .eq('board_id', boardId)
    .single()

  if (!column) {
    return { success: false, error: 'Column not found or access denied' }
  }

  // Get max position in column
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', payload.columnId)
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = (existingTasks?.[0]?.position ?? -1) + 1

  // Create task
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      column_id: payload.columnId,
      title: payload.title,
      description: payload.description || '',
      position: newPosition,
    })
    .select()
    .single()

  if (error) {
    console.error('Create task error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function updateTask(payload: {
  taskId: string
  title?: string
  description?: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  const updates: any = { updated_at: new Date().toISOString() }
  if (payload.title !== undefined) updates.title = payload.title
  if (payload.description !== undefined) updates.description = payload.description

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', payload.taskId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function moveTask(payload: {
  taskId: string
  targetColumnId: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  // Get max position in target column
  const { data: targetTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', payload.targetColumnId)
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = (targetTasks?.[0]?.position ?? -1) + 1

  // Move task
  const { data, error } = await supabase
    .from('tasks')
    .update({
      column_id: payload.targetColumnId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.taskId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function deleteTask(payload: { taskId: string }): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', payload.taskId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================================================
// COLUMN ACTIONS
// ============================================================================

async function createColumn(
  payload: { title: string },
  boardId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get max position
  const { data: existingColumns } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = (existingColumns?.[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title: payload.title,
      position: newPosition,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function renameColumn(payload: {
  columnId: string
  newTitle: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('columns')
    .update({ title: payload.newTitle })
    .eq('id', payload.columnId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function deleteColumn(payload: {
  columnId: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if column has tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('column_id', payload.columnId)
    .limit(1)

  if (tasks && tasks.length > 0) {
    return {
      success: false,
      error: 'Cannot delete column with tasks. Move or delete tasks first.',
    }
  }

  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', payload.columnId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================================================
// BOARD OPERATIONS
// ============================================================================

async function cleanupDoneTasks(
  payload: { columnTitle: string },
  boardId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Find column by title (case-insensitive)
  const { data: column } = await supabase
    .from('columns')
    .select('id')
    .eq('board_id', boardId)
    .ilike('title', payload.columnTitle)
    .single()

  if (!column) {
    return {
      success: false,
      error: `Column "${payload.columnTitle}" not found`,
    }
  }

  // Delete all tasks in that column
  const { data: deleted, error } = await supabase
    .from('tasks')
    .delete()
    .eq('column_id', column.id)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: { deletedCount: deleted?.length ?? 0 },
  }
}
