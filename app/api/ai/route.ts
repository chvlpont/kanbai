import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { groq, AI_MODEL } from "@/lib/ai/groq";
import { getSystemPrompt } from "@/lib/ai/prompt";
import { AIResponse } from "@/lib/ai/schema";
import { executeAction } from "@/lib/ai/actions";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const { message, boardId } = await req.json();

    if (!message || !boardId) {
      return NextResponse.json(
        { error: "Missing message or boardId" },
        { status: 400 }
      );
    }

    // 3. Fetch current board state and verify access
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select(
        `
          id,
          title,
          user_id,
          columns (
            id,
            title,
            position,
            tasks (
              id,
              title,
              description,
              position,
              created_at
            )
          )
        `
      )
      .eq("id", boardId)
      .single();

    if (boardError || !board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check if user owns the board or is a member
    const { data: boardMember } = await supabase
      .from("board_members")
      .select("board_id")
      .eq("board_id", boardId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isOwner = board.user_id === user.id;
    const isMember = !!boardMember;

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Access denied to this board" },
        { status: 403 }
      );
    }

    // 4. Get system prompt with board context
    const systemPrompt = getSystemPrompt(board);

    // 5. Call Groq AI
    console.log("[AI] Calling Groq with model:", AI_MODEL);
    console.log("[AI] User message:", message);

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const aiResponseText = completion.choices[0]?.message?.content;
    console.log("[AI] Raw response:", aiResponseText);

    if (!aiResponseText) {
      throw new Error("No response from AI");
    }

    // 6. Parse and validate AI response
    let aiResponse;
    try {
      const parsed = JSON.parse(aiResponseText);
      aiResponse = AIResponse.parse(parsed); // Validate with Zod
      console.log("[AI] Parsed response:", aiResponse);
    } catch (parseError) {
      console.error("[AI] Failed to parse AI response:", parseError);
      console.error("[AI] Raw response was:", aiResponseText);
      throw new Error("Invalid JSON response from AI");
    }

    // 7. Execute actions
    const actionResults = [];
    for (const action of aiResponse.actions) {
      console.log("[AI] Executing action:", action.type);
      const result = await executeAction(action, boardId);
      actionResults.push({
        action: action.type,
        success: result.success,
        error: result.error,
        data: result.data,
      });

      // Stop executing if an action fails
      if (!result.success) {
        console.error(`[AI] Action ${action.type} failed:`, result.error);
        break;
      }
    }

    console.log("[AI] Action results:", actionResults);

    // 8. Save AI response to database
    const { data: savedAiMessage, error: saveError } = await supabase
      .from("board_messages")
      .insert([
        {
          board_id: boardId,
          user_id: null, // AI messages don't have a user_id
          role: "assistant",
          content: aiResponse.message,
          actions: aiResponse.actions,
          action_results: actionResults,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("[AI] Error saving AI message:", saveError);
      // Don't fail the request if we can't save the message
      // The response will still be returned to the user
    }

    // 9. Return response
    return NextResponse.json({
      success: true,
      message: aiResponse.message,
      actions: aiResponse.actions,
      actionResults,
      savedMessage: savedAiMessage, // Include the saved message with ID and timestamps
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
