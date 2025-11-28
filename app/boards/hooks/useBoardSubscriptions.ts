import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Column as ColumnType } from "../types";

interface UseBoardSubscriptionsProps {
  boardId: string;
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  setMembers: React.Dispatch<
    React.SetStateAction<{ id: string; username: string }[]>
  >;
}

export function useBoardSubscriptions({
  boardId,
  setColumns,
  setMembers,
}: UseBoardSubscriptionsProps) {
  useEffect(() => {
    const supabase = createClient();

    // Refetch columns and tasks
    const refetchData = async () => {
      const { data: columnsData } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
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
      .channel(`columns-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          console.log("Column changed, refetching...");
          refetchData();
        }
      )
      .subscribe();

    // Subscribe to task changes
    const tasksChannel = supabase
      .channel(`tasks-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          console.log("Task changed, refetching...", payload);
          refetchData();
        }
      )
      .subscribe((status) => {
        console.log("Tasks subscription status:", status);
      });

    // Subscribe to board member changes
    const membersChannel = supabase
      .channel(`members-${boardId}`)
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
            .eq("id", boardId)
            .single();

          if (boardData?.user_id) {
            allUserIds.add(boardData.user_id);
          }

          // Get board members
          const { data: membersData } = await supabase
            .from("board_members")
            .select("user_id")
            .eq("board_id", boardId);

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
  }, [boardId, setColumns, setMembers]);
}
