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
import ChatSidebar from "../components/ChatSidebar";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Sparkles,
  MoreVertical,
  LayoutDashboard,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/app/components/ConfirmDialog";

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [members, setMembers] = useState<{ id: string; username: string }[]>(
    []
  );
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

  // Load board data from Supabase
  useEffect(() => {
    const fetchBoardData = async () => {
      const supabase = createClient();

      // Fetch board title, invite code, and owner
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("title, invite_code, user_id")
        .eq("id", id)
        .single();
      if (boardError) {
        console.error("Error fetching board:", boardError);
        setBoardTitle("Board not found");
      } else {
        console.log("Board data:", boardData);
        console.log("Invite code:", boardData.invite_code);
        setBoardTitle(boardData.title);
        setInviteCode(boardData.invite_code || "");
      }

      // Fetch board members
      const { data: membersData, error: membersError } = await supabase
        .from("board_members")
        .select("user_id")
        .eq("board_id", id);

      if (membersError) {
        console.error("Error fetching members:", membersError);
      } else {
        // Combine owner and members, remove duplicates
        const allUserIds = new Set<string>();
        if (boardData?.user_id) {
          allUserIds.add(boardData.user_id);
        }
        if (membersData) {
          membersData.forEach((m) => allUserIds.add(m.user_id));
        }

        // Fetch usernames for all users
        if (allUserIds.size > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", Array.from(allUserIds));

          if (profiles) {
            setMembers(profiles);
          }
        }
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

  // Real-time subscriptions for AI updates
  useEffect(() => {
    const supabase = createClient();

    // Refetch columns and tasks
    const refetchData = async () => {
      const { data: columnsData } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", id)
        .order("position");

      if (!columnsData) return;

      const columnsWithTasks = await Promise.all(
        columnsData.map(async (col) => {
          const { data: tasksData } = await supabase
            .from("tasks")
            .select("*")
            .eq("column_id", col.id)
            .order("position");
          return { ...col, tasks: tasksData || [] };
        })
      );

      setColumns(columnsWithTasks);
    };

    // Subscribe to column changes
    const columnsChannel = supabase
      .channel(`columns-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${id}`,
        },
        () => {
          console.log("Column changed, refetching...");
          refetchData();
        }
      )
      .subscribe();

    // Subscribe to task changes
    const tasksChannel = supabase
      .channel(`tasks-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          console.log("Task changed, refetching...");
          refetchData();
        }
      )
      .subscribe();

    // Subscribe to board member changes
    const membersChannel = supabase
      .channel(`members-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_members",
        },
        async (payload) => {
          console.log("Board members changed!", payload.eventType);

          const allUserIds = new Set<string>();

          // Get board owner
          const { data: boardData } = await supabase
            .from("boards")
            .select("user_id")
            .eq("id", id)
            .single();

          if (boardData?.user_id) {
            allUserIds.add(boardData.user_id);
          }

          // Get board members
          const { data: membersData } = await supabase
            .from("board_members")
            .select("user_id")
            .eq("board_id", id);

          console.log("Updated members data:", membersData);

          if (membersData && membersData.length > 0) {
            membersData.forEach((m) => allUserIds.add(m.user_id));
          }

          // Fetch usernames for all users
          if (allUserIds.size > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, username")
              .in("id", Array.from(allUserIds));

            console.log("Updated profiles:", profiles);

            if (profiles) {
              setMembers(profiles);
            }
          } else {
            setMembers([]);
          }
        }
      )
      .subscribe((status) => {
        console.log("Members subscription status:", status);
      });

    return () => {
      supabase.removeChannel(columnsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
      {/* Navigation Bar */}
      <nav className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3e]/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-6 flex-1">
              <Link
                href="/"
                className="font-bold text-xl sm:text-2xl tracking-tight hover:scale-105 transition-transform"
              >
                Kanb
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ai
                </span>
              </Link>
              <div className="hidden sm:block h-6 w-px bg-[#2a2a3e]/50"></div>
              <div className="hidden sm:flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
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
                <h1 className="text-white font-semibold text-base sm:text-lg">
                  {boardTitle}
                </h1>
              </div>
              {members.length > 0 && (
                <>
                  <div className="hidden sm:block h-6 w-px bg-[#2a2a3e]/50"></div>
                  <div className="hidden sm:block relative group">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a2e]/50 rounded-full border border-[#2a2a3e]/50 cursor-default">
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-sm text-[#9ca3af] font-medium">
                        {members.length}{" "}
                        {members.length === 1 ? "member" : "members"}
                      </span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-0 top-full mt-2 w-48 bg-[#1a1a2e]/95 backdrop-blur-xl border border-[#2a2a3e]/50 rounded-xl shadow-xl shadow-black/20 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <p className="text-xs text-purple-400/70 font-semibold uppercase tracking-wide mb-2">
                        Board Members
                      </p>
                      <div className="space-y-1">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 text-sm text-white"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>{member.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="hidden sm:block h-6 w-px bg-[#2a2a3e]/50"></div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-2 text-[#9ca3af] hover:text-white hover:bg-[#1a1a2e]/50 rounded-lg transition-all border border-transparent hover:border-[#2a2a3e]/50"
                    aria-label="Menu"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {isMenuOpen && (
                    <>
                      {/* Dropdown */}
                      <div
                        className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-[#2a2a3e]/50 rounded-xl shadow-xl shadow-black/20 z-20 backdrop-blur-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href="/boards"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#2a2a3e]/50 transition-colors first:rounded-t-xl"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-400" />
                          Dashboard
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              let codeToShare = inviteCode;

                              // Generate invite code if it doesn't exist
                              if (!codeToShare) {
                                const generateCode = () => {
                                  const chars =
                                    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                                  let code = "";
                                  for (let i = 0; i < 6; i++) {
                                    code += chars.charAt(
                                      Math.floor(Math.random() * chars.length)
                                    );
                                  }
                                  return code;
                                };

                                codeToShare = generateCode();

                                // Save to database
                                const supabase = createClient();
                                const { error: updateError } = await supabase
                                  .from("boards")
                                  .update({ invite_code: codeToShare })
                                  .eq("id", id);

                                if (updateError) {
                                  console.error(
                                    "Failed to generate invite code:",
                                    updateError
                                  );
                                  toast.error("Failed to generate invite code");
                                  return;
                                }

                                // Update local state
                                setInviteCode(codeToShare);
                              }

                              // Copy to clipboard
                              if (
                                navigator.clipboard &&
                                window.isSecureContext
                              ) {
                                await navigator.clipboard.writeText(
                                  codeToShare
                                );
                              } else {
                                // Fallback for older browsers or non-HTTPS
                                const textArea =
                                  document.createElement("textarea");
                                textArea.value = codeToShare;
                                textArea.style.position = "fixed";
                                textArea.style.left = "-999999px";
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  document.execCommand("copy");
                                } catch (err) {
                                  console.error("Fallback copy failed:", err);
                                  throw err;
                                }
                                document.body.removeChild(textArea);
                              }

                              toast.success("Invite code copied to clipboard!");
                              setIsMenuOpen(false);
                            } catch (err) {
                              console.error("Failed to copy:", err);
                              toast.error("Failed to copy invite code");
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#2a2a3e]/50 transition-colors last:rounded-b-xl"
                        >
                          <Copy className="w-4 h-4 text-green-400" />
                          Copy Invite Code
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-purple-500/50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center gap-1 sm:gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </button>
                <button
                  onClick={handleAddColumn}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-blue-500/50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-1 sm:gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400"
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

      {/* Chat Sidebar */}
      <ChatSidebar
        boardId={id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Floating button for mobile */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-purple-500/50 text-white rounded-full shadow-xl hover:shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 z-30"
        >
          <Sparkles className="w-6 h-6 text-purple-400" />
        </button>
      )}

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
