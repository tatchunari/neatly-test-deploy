import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
<<<<<<< HEAD
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  anonymousId: string | null;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Generate or retrieve anonymous ID from localStorage
const getOrCreateAnonymousId = (): string => {
  if (typeof window === "undefined") return "";

  let anonId = localStorage.getItem("neatly_anonymous_id");
  if (!anonId) {
    // Generate a UUID v4
    anonId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    localStorage.setItem("neatly_anonymous_id", anonId);
  }
  return anonId;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [pendingAnonymousId, setPendingAnonymousId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadSession = async () => {
      console.log("🚀 AuthContext: loadSession started");
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "🔍 AuthContext: Current session:",
        session?.user?.email || "No user"
      );
      setUser(session?.user ?? null);

      // Always keep anonymous ID for potential session linking
      const currentAnonId = getOrCreateAnonymousId();
      console.log("🔑 AuthContext: Current anonymous ID:", currentAnonId);
      setAnonymousId(currentAnonId);

      if (session?.user) {
        console.log(
          "👤 AuthContext: User is logged in, keeping anonymous ID for potential linking"
        );
        setPendingAnonymousId(currentAnonId);
      } else {
        console.log("🔓 AuthContext: No user, using anonymous ID for guest");
        setPendingAnonymousId(null);
      }

      setLoading(false);
      console.log("✅ AuthContext: loadSession completed");
=======

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
    };

    loadSession();

<<<<<<< HEAD
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AuthContext: onAuthStateChange triggered", {
          event,
          userEmail: session?.user?.email,
        });
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle session linking when user logs in
        if (event === "SIGNED_IN" && session?.user) {
          console.log(
            "🎉 AuthContext: SIGNED_IN event detected for user:",
            session.user.email
          );

          // Get current anonymous ID from localStorage
          const currentAnonId = localStorage.getItem("neatly_anonymous_id");

          console.log("🔍 AuthContext: Checking for anonymous ID to link:", {
            currentAnonId,
            willLink: !!currentAnonId,
          });

          if (currentAnonId) {
            try {
              console.log(
                "🔗 AuthContext: Attempting to link guest session to user account:",
                currentAnonId
              );

              // Get the current session to include auth token
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (!session?.access_token) {
                console.error(
                  "❌ AuthContext: No access token available for linking"
                );
                return;
              }

              // Link guest session to user account
              const linkResponse = await fetch("/api/chat/link-session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ anonymousId: currentAnonId }),
              });

              console.log(
                "📡 AuthContext: Link session API response status:",
                linkResponse.status
              );

              if (linkResponse.ok) {
                const result = await linkResponse.json();
                console.log(
                  "✅ AuthContext: Link session API response:",
                  result
                );

                // Clear anonymous ID if user has existing sessions OR if linking was successful
                if (
                  result.userHasExistingSessions ||
                  result.linkedSessions > 0
                ) {
                  localStorage.removeItem("neatly_anonymous_id");
                  setAnonymousId(null);
                  setPendingAnonymousId(null);
                  if (result.userHasExistingSessions) {
                    console.log(
                      "🧹 AuthContext: User has existing sessions, cleared anonymous ID"
                    );
                  } else {
                    console.log(
                      "🧹 AuthContext: Successfully linked sessions, cleared anonymous ID"
                    );
                  }
                } else {
                  console.log(
                    "ℹ️ AuthContext: No sessions to link, keeping anonymous ID for future use"
                  );
                }
              } else {
                const errorText = await linkResponse.text();
                console.error("❌ AuthContext: Link session failed:", {
                  status: linkResponse.status,
                  error: errorText,
                });
                console.log(
                  "⚠️ AuthContext: Keeping anonymous ID due to link failure"
                );
              }
            } catch (error) {
              console.error(
                "❌ AuthContext: Error linking guest session:",
                error
              );
              console.log("⚠️ AuthContext: Keeping anonymous ID due to error");
            }
          } else {
            console.log(
              "ℹ️ AuthContext: No anonymous ID found to link - user might not have used chatbot as guest"
            );
          }
        } else if (event === "SIGNED_OUT") {
          console.log("👋 AuthContext: SIGNED_OUT event detected");
          // Clear user data and regenerate anonymous ID
          setUser(null);
          const newAnonId = getOrCreateAnonymousId();
          setAnonymousId(newAnonId);
          console.log(
            "🔑 AuthContext: User signed out, created new anonymous ID:",
            newAnonId
          );
        }
      }
    );
=======
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)

    return () => sub.subscription.unsubscribe();
  }, []);

<<<<<<< HEAD
  const isGuest = !user && !!anonymousId;

  return (
    <AuthContext.Provider value={{ user, loading, anonymousId, isGuest }}>
=======
  return (
    <AuthContext.Provider value={{ user, loading }}>
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
      {children}
    </AuthContext.Provider>
  );
};

<<<<<<< HEAD
export const useAuth = () => useContext(AuthContext);
=======
export const useAuth = () => useContext(AuthContext);
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
