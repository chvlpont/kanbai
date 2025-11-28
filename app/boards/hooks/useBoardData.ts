import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Column as ColumnType } from "../types";

interface UseBoardDataReturn {
  loading: boolean;
  columns: ColumnType[];
  boardTitle: string;
  inviteCode: string;
  members: { id: string; username: string }[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  setInviteCode: React.Dispatch<React.SetStateAction<string>>;
  setMembers: React.Dispatch<
    React.SetStateAction<{ id: string; username: string }[]>
  >;
  fetchBoardData: () => Promise<void>;
}

export function useBoardData(boardId: string): UseBoardDataReturn {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>("Loading...");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; username: string }[]>(
    []
  );

  const fetchBoardData = async () => {
    const supabase = createClient();

    try {
      // Fetch board title, invite code, and owner
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("title, invite_code, user_id")
        .eq("id", boardId)
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
        .eq("board_id", boardId);

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
        .eq("board_id", boardId)
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  return {
    loading,
    columns,
    boardTitle,
    inviteCode,
    members,
    setColumns,
    setInviteCode,
    setMembers,
    fetchBoardData,
  };
}
