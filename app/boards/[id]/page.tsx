"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
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
import { createClient } from "@/lib/supabase/client";

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>("Loading...");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingColumnId, setEditingColumnId] = useState<string | undefined>(
    undefined
  );
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load board data from Supabase
  useEffect(() => {
    const fetchBoardData = async () => {
      const supabase = createClient();

      // Fetch board title
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("title")
        .eq("id", id)
        .single();
      if (boardError) {
        console.error("Error fetching board:", boardError);
        setBoardTitle("Board not found");
      } else {
        setBoardTitle(boardData.title);
      }

      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", id)
        .order("position");
      if (columnsError) {
        console.error("Error fetching columns:", columnsError);
        return;
      }

      // Fetch tasks for each column
      const columnsWithTasks = await Promise.all(
        (columnsData || []).map(async (col) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .eq("column_id", col.id)
            .order("position");
          if (tasksError) console.error("Error fetching tasks:", tasksError);
          return { ...col, tasks: tasksData || [] };
        })
      );

      setColumns(columnsWithTasks);
    };

    fetchBoardData();
  }, [id]);

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
    if (!confirm("Are you sure you want to delete this task?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
      return;
    }

    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
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
        alert("Failed to update task");
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
        alert("Failed to create task");
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
    if (column && column.tasks.length > 0) {
      if (
        !confirm(
          `Delete "${column.title}" and all its ${column.tasks.length} tasks?`
        )
      )
        return;
    } else if (!confirm(`Delete "${column?.title}" column?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);

    if (error) {
      console.error("Error deleting column:", error);
      alert("Failed to delete column");
      return;
    }

    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnId)
    );
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
        alert("Failed to update column");
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
        alert("Failed to create column");
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
      alert("Failed to move task");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
      {/* Navigation Bar */}
      <nav className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#2a2a3e] sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14">
            <div className="flex items-center gap-2 sm:gap-6">
              <Link
                href="/"
                className="text-white font-bold text-lg sm:text-xl hover:text-[#60a5fa] transition-colors"
              >
                KanbAI
              </Link>
              <div className="hidden sm:block h-5 w-px bg-[#2a2a3e]"></div>
              <div className="hidden sm:flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#9ca3af]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <h1 className="text-white font-semibold text-sm sm:text-base">
                  {boardTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/boards"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[#9ca3af] hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Boards</span>
              </Link>
              <button
                onClick={handleAddColumn}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1 sm:gap-2 shadow-lg shadow-blue-500/20"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Add Column</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

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
        defaultStatus={defaultStatus}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSave={handleSaveColumn}
        existingTitle={columns.find((col) => col.id === editingColumnId)?.title}
      />
    </div>
  );
}
