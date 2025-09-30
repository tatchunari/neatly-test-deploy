import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { anonymousId, customerId } = req.body;

      if (!anonymousId && !customerId) {
        return res
          .status(400)
          .json({ error: "Anonymous ID or Customer ID is required" });
      }

      console.log("Creating new chat session:", { anonymousId, customerId });

      // Check if there's an existing active session
      let existingSession;
      if (customerId) {
        // Check for user session
        const { data, error: checkError } = await supabase
          .from("chatbot_sessions")
          .select("*")
          .eq("customer_id", customerId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing user session:", checkError);
          throw checkError;
        }
        existingSession = data;
      } else if (anonymousId) {
        // Check for guest session
        const { data, error: checkError } = await supabase
          .from("chatbot_sessions")
          .select("*")
          .eq("anonymous_id", anonymousId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing guest session:", checkError);
          throw checkError;
        }
        existingSession = data;
      }

      // If existing session found, return it
      if (existingSession) {
        console.log("Found existing session:", existingSession.id);
        return res.status(200).json({ session: existingSession });
      }

      // Create new chat session
      const sessionData: {
        customer_id?: string;
        anonymous_id?: string;
        status: string;
      } = { status: "active" };
      if (customerId) {
        sessionData.customer_id = customerId;
      } else if (anonymousId) {
        sessionData.anonymous_id = anonymousId;
      }

      const { data: session, error } = await supabase
        .from("chatbot_sessions")
        .insert(sessionData)
        .select()
        .single();

      console.log("Supabase session result:", { session, error });

      if (error) {
        console.error("Supabase session error:", error);
        throw error;
      }

      res.status(201).json({ session });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({
        error: "Failed to create session",
        details: error,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "GET") {
    try {
      const { anonymousId, customerId } = req.query;

      if (!anonymousId && !customerId) {
        return res
          .status(400)
          .json({ error: "Anonymous ID or Customer ID is required" });
      }

      let query = supabase
        .from("chatbot_sessions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
        console.log(
          "🔍 Searching for user sessions with customer_id:",
          customerId
        );
      } else if (anonymousId) {
        query = query.eq("anonymous_id", anonymousId);
        console.log(
          "🔍 Searching for guest sessions with anonymous_id:",
          anonymousId
        );
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }

      res.status(200).json({ sessions: sessions || [] });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({
        error: "Failed to fetch sessions",
        details: error,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
