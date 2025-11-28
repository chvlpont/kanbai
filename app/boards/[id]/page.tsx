"use client";

import { use, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus, Column as ColumnType } from "../types";
import Column from "../components/Column";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import ColumnModal from "../components/ColumnModal";
import ChatSidebar from "../components/ChatSidebar";
import BoardNavbar from "../components/BoardNavbar";
import FloatingAIButton from "../components/FloatingAIButton";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import Loader from "@/app/components/Loader";
import { useBoardData } from "../hooks/useBoardData";
import { useBoardSubscriptions } from "../hooks/useBoardSubscriptions";

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Use custom hooks for data and subscriptions
  const {
    loading,
    columns,
    boardTitle,
    inviteCode,
    members,
    setColumns,
    setInviteCode,
    setMembers,
    fetchBoardData,
  } = useBoardData(id);

  useBoardSubscriptions({ boardId: id, setColumns, setMembers });

  // Local UI state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingColumnId, setEditingColumnId] = useState<string | undefined>(
    undefined
  );
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      onConfirm: async () => {
        const supabase = createClient();
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", taskId);

        if (error) {
          console.error("Error deleting task:", error);
          toast.error("Failed to delete task");
          return;
        }

        toast.success("Task deleted successfully");
        setColumns((prevColumns) =>
          prevColumns.map((column) => ({
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }))
        );
      },
    });
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    status?: TaskStatus;
  }) => {
    const supabase = createClient();

    if (editingTask) {
      // Update existing task
      const { error } = await supabase
        .from("tasks")
        .update({
          title: taskData.title,
          description: taskData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTask.id);

      if (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
        return;
      }

      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: taskData.title,
                  description: taskData.description,
                }
              : task
          ),
        }))
      );
    } else {
      // Create new task
      const column = columns.find((col) => col.id === defaultStatus);
      if (!column) return;

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert([
          {
            column_id: defaultStatus,
            title: taskData.title,
            description: taskData.description,
            position: column.tasks.length,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task");
        return;
      }

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === defaultStatus
            ? {
                ...col,
                tasks: [...col.tasks, { ...newTask, status: defaultStatus }],
              }
            : col
        )
      );
    }
  };

  const handleAssignMembers = async (taskId: string, memberIds: string[]) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("tasks")
      .update({
        assigned_user_ids: memberIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error assigning members:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error(`Failed to assign members: ${error.message || 'Unknown error'}`);
      return;
    }

    // Update local state
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === taskId
            ? { ...task, assigned_user_ids: memberIds }
            : task
        ),
      }))
    );
  };

  const handleAddColumn = () => {
    setEditingColumnId(undefined);
    setIsColumnModalOpen(true);
  };

  const handleEditColumn = (columnId: string) => {
    setEditingColumnId(columnId);
    setIsColumnModalOpen(true);
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    const taskCount = column?.tasks.length || 0;

    const message =
      taskCount > 0
        ? `Are you sure you want to delete "${column?.title}" and all its ${taskCount} tasks?\n\nThis action cannot be undone.`
        : `Are you sure you want to delete "${column?.title}"?`;

    setConfirmDialog({
      isOpen: true,
      title: "Delete Column",
      message,
      onConfirm: async () => {
        const supabase = createClient();
        const { error } = await supabase
          .from("columns")
          .delete()
          .eq("id", columnId);

        if (error) {
          console.error("Error deleting column:", error);
          toast.error("Failed to delete column");
          return;
        }

        setColumns((prevColumns) =>
          prevColumns.filter((col) => col.id !== columnId)
        );
      },
    });
  };

  const handleSaveColumn = async (title: string) => {
    const supabase = createClient();

    if (editingColumnId) {
      // Update existing column
      const { error } = await supabase
        .from("columns")
        .update({ title })
        .eq("id", editingColumnId);

      if (error) {
        console.error("Error updating column:", error);
        toast.error("Failed to update column");
        return;
      }

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === editingColumnId ? { ...col, title } : col
        )
      );
    } else {
      // Create new column
      const { data: newColumn, error } = await supabase
        .from("columns")
        .insert([
          {
            board_id: id,
            title,
            position: columns.length,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating column:", error);
        toast.error("Failed to create column");
        return;
      }

      setColumns((prevColumns) => [
        ...prevColumns,
        { ...newColumn, tasks: [] },
      ]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Check if dragging a column
    const column = columns.find((col) => col.id === active.id);
    if (column) {
      setActiveColumn(column);
      return;
    }

    // Otherwise, dragging a task
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const supabase = createClient();

    // Handle column reordering
    if (activeColumn) {
      const activeIndex = columns.findIndex((col) => col.id === active.id);
      const overIndex = columns.findIndex((col) => col.id === over.id);

      if (activeIndex !== overIndex) {
        const newColumns = arrayMove(columns, activeIndex, overIndex);
        setColumns(newColumns);

        // Update positions in database
        const updates = newColumns.map((col, index) =>
          supabase.from("columns").update({ position: index }).eq("id", col.id)
        );
        await Promise.all(updates);
      }
      return;
    }

    // Handle task movement
    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    let activeTask: Task | undefined;
    let sourceColumnId: string | undefined;

    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === activeTaskId);
      if (task) {
        activeTask = task;
        sourceColumnId = column.id;
        break;
      }
    }

    if (!activeTask || !sourceColumnId) return;

    // Determine target column
    let targetColumnId: string | undefined;

    // Check if dropped on a column
    const isColumn = columns.some((col) => col.id === overId);
    if (isColumn) {
      targetColumnId = overId;
    } else {
      // Dropped on a task, find which column it belongs to
      for (const column of columns) {
        if (column.tasks.some((t) => t.id === overId)) {
          targetColumnId = column.id;
          break;
        }
      }
    }

    if (!targetColumnId || sourceColumnId === targetColumnId) return;

    // Update task in database
    const targetColumn = columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        column_id: targetColumnId,
        position: targetColumn.tasks.length,
      })
      .eq("id", activeTaskId);

    if (error) {
      console.error("Error moving task:", error);
      toast.error("Failed to move task");
      return;
    }

    // Move task to new column in state
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        // Remove from source column
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== activeTaskId),
          };
        }
        // Add to target column
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [
              ...column.tasks,
              {
                ...activeTask,
                status: targetColumnId,
                column_id: targetColumnId,
              } as Task,
            ],
          };
        }
        return column;
      });
      return newColumns;
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <BoardNavbar
        boardId={id}
        boardTitle={boardTitle}
        members={members}
        inviteCode={inviteCode}
        onInviteCodeUpdate={setInviteCode}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onAddColumn={handleAddColumn}
      />

      {/* Board */}
      <main className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
              {columns.map((column) => (
                <div key={column.id}>
                  <Column
                    column={column}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onDeleteColumn={handleDeleteColumn}
                    onEditColumn={handleEditColumn}
                    members={members}
                    onAssignMembers={handleAssignMembers}
                  />
                </div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 w-80">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  members={members}
                />
              </div>
            ) : activeColumn ? (
              <div className="w-80 opacity-50">
                <Column
                  column={activeColumn}
                  onAddTask={() => {}}
                  onEditTask={() => {}}
                  onDeleteTask={() => {}}
                  onDeleteColumn={() => {}}
                  onEditColumn={() => {}}
                  isDraggingColumn={false}
                  members={members}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSave={handleSaveColumn}
        existingTitle={columns.find((col) => col.id === editingColumnId)?.title}
      />

      {/* Chat Sidebar */}
      <ChatSidebar
        boardId={id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAIActionComplete={fetchBoardData}
      />

      {/* Floating button for mobile */}
      {!isChatOpen && <FloatingAIButton onClick={() => setIsChatOpen(true)} />}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
}
