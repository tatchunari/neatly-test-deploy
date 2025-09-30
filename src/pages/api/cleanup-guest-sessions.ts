import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "authorization, x-client-info, apikey, content-type"
    );
    return res.status(200).json({ message: "ok" });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    console.log("Starting guest session cleanup...");

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find guest sessions older than 24 hours
    const { data: oldGuestSessions, error: findError } = await supabase
      .from("chatbot_sessions")
      .select("id, anonymous_id, created_at")
      .is("customer_id", null) // Only guest sessions
      .not("anonymous_id", "is", null) // Has anonymous_id
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (findError) {
      console.error("Error finding old guest sessions:", findError);
      throw findError;
    }

    if (!oldGuestSessions || oldGuestSessions.length === 0) {
      console.log("No old guest sessions found to cleanup");
      return res.status(200).json({
        message: "No old guest sessions found",
        cleanedSessions: 0,
        cleanedMessages: 0,
      });
    }

    console.log(
      `Found ${oldGuestSessions.length} old guest sessions to cleanup`
    );

    // Get session IDs for deletion
    const sessionIds = oldGuestSessions.map((session) => session.id);

    // First, delete all messages from these sessions
    const { error: messagesDeleteError } = await supabase
      .from("chatbot_messages")
      .delete()
      .in("session_id", sessionIds);

    if (messagesDeleteError) {
      console.error("Error deleting old guest messages:", messagesDeleteError);
      throw messagesDeleteError;
    }

    // Then, delete the sessions themselves
    const { error: sessionsDeleteError } = await supabase
      .from("chatbot_sessions")
      .delete()
      .in("id", sessionIds);

    if (sessionsDeleteError) {
      console.error("Error deleting old guest sessions:", sessionsDeleteError);
      throw sessionsDeleteError;
    }

    console.log(
      `Successfully cleaned up ${oldGuestSessions.length} guest sessions and their messages`
    );

    return res.status(200).json({
      message: "Guest session cleanup completed successfully",
      cleanedSessions: oldGuestSessions.length,
      cleanedMessages: "All messages from cleaned sessions",
      sessions: oldGuestSessions.map((s) => ({
        id: s.id,
        anonymous_id: s.anonymous_id,
        created_at: s.created_at,
      })),
    });
  } catch (error) {
    console.error("Error in guest session cleanup:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to cleanup guest sessions",
      details: error,
      message: errorMessage,
    });
  }
}
