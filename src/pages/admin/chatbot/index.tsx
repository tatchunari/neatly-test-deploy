import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import { FileQuestionMark } from "lucide-react";
import { DropDownInput } from "@/components/admin/ui/DropdownInput";
import SuggestionMenu from "@/components/admin/SuggestionMenu";

type RoomTypePayload = {
  rooms: string[];
  buttonName: string;
};

type OptionDetail = {
  option: string;
  detail: string;
};

type OptionDetailsPayload = OptionDetail[];

type ReplyPayload = null | RoomTypePayload | OptionDetailsPayload;

interface FAQ {
  id: string;
  topic: string;
  reply_message: string;
  reply_format?: 'message' | 'room_type' | 'option_details';
  reply_payload?: ReplyPayload;
  created_at: string;
  updated_at: string;
  aliases?: Array<{ id: string; alias: string }>;
}

interface Context {
  id: string;
  content: string;
  created_at: string;
  created_by?: string;
}

export default function ChatbotAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showCreateFAQ, setShowCreateFAQ] = useState<boolean>(false);

  // Greeting and Fallback states
  const [greetingMessage, setGreetingMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);
  const [isEditingFallback, setIsEditingFallback] = useState(false);

  // Context states
  const [contexts, setContexts] = useState<Context[]>([]);
  const [newContext, setNewContext] = useState({ content: "" });
  const [editingContext, setEditingContext] = useState<Context | null>(null);

  // Load FAQs and Contexts on component mount
  useEffect(() => {
    fetchFAQs();
    fetchContexts();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/chat/faqs");
      const data = await response.json();
      const faqsData = data.faqs || [];

      // หา greeting และ fallback messages
      const greetingFaq = faqsData.find(
        (faq: FAQ) => faq.topic === "::greeting::"
      );
      const fallbackFaq = faqsData.find(
        (faq: FAQ) => faq.topic === "::fallback::"
      );

      if (greetingFaq) {
        setGreetingMessage(greetingFaq.reply_message);
      }
      if (fallbackFaq) {
        setFallbackMessage(fallbackFaq.reply_message);
      }

      // ดึง aliases สำหรับแต่ละ FAQ
      const faqsWithAliases = await Promise.all(
        faqsData.map(async (faq: FAQ) => {
          try {
            const aliasesResponse = await fetch(
              `/api/chat/aliases?faq_id=${faq.id}`
            );
            const aliasesData = await aliasesResponse.json();
            return { ...faq, aliases: aliasesData.aliases || [] };
          } catch (error) {
            console.error("Error fetching aliases for FAQ:", faq.id, error);
            return { ...faq, aliases: [] };
          }
        })
      );

      setFaqs(faqsWithAliases);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handleUpdateFAQ = async () => {
    if (
      !editingFAQ ||
      !editingFAQ.topic.trim() ||
      !editingFAQ.reply_message.trim()
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/faqs?id=${editingFAQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: editingFAQ.topic,
          reply_message: editingFAQ.reply_message,
          reply_format: editingFAQ.reply_format || 'message',
          reply_payload: editingFAQ.reply_payload || null,
        }),
      });

      if (response.ok) {
        console.log("FAQ updated with ID:", editingFAQ.id);
        setEditingFAQ(null);
        fetchFAQs();
      } else {
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/faqs?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFAQs();
      } else {
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlias = async (aliasId: string) => {
    try {
      await fetch(`/api/chat/aliases?id=${aliasId}`, {
        method: "DELETE",
      });
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting alias:", error);
    }
  };

  const handleSaveGreeting = async () => {
    setLoading(true);
    try {
      // หา greeting message ที่มีอยู่
      const existingGreeting = faqs.find(
        (faq) => faq.topic === "::greeting::"
      );

      const response = await fetch(
        `/api/chat/faqs${existingGreeting ? `?id=${existingGreeting.id}` : ""}`,
        {
          method: existingGreeting ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "::greeting::",
            reply_message: greetingMessage,
            reply_format: 'message',
            reply_payload: null,
          }),
        }
      );

      if (response.ok) {
        setIsEditingGreeting(false);
        fetchFAQs();
      } else {
      }
    } catch (error) {
      console.error("Error saving greeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFallback = async () => {
    setLoading(true);
    try {
      // หา fallback message ที่มีอยู่
      const existingFallback = faqs.find(
        (faq) => faq.topic === "::fallback::"
      );

      const response = await fetch(
        `/api/chat/faqs${existingFallback ? `?id=${existingFallback.id}` : ""}`,
        {
          method: existingFallback ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "::fallback::",
            reply_message: fallbackMessage,
            reply_format: 'message',
            reply_payload: null,
          }),
        }
      );

      if (response.ok) {
        setIsEditingFallback(false);
        fetchFAQs();
      } else {
      }
    } catch (error) {
      console.error("Error saving fallback:", error);
    } finally {
      setLoading(false);
    }
  };

  // Context Management Functions
  const fetchContexts = async () => {
    try {
      const response = await fetch("/api/chat/contexts");
      const data = await response.json();
      setContexts(data.contexts || []);
    } catch (error) {
      console.error("Error fetching contexts:", error);
    }
  };

  const handleCreateContext = async () => {
    console.log("🟡 Admin: handleCreateContext called");

    if (!newContext.content.trim()) {
      console.log("❌ Admin: Content is empty, returning");
      return;
    }

    console.log(
      "🟡 Admin: Starting context creation with content:",
      newContext.content
    );
    setLoading(true);
    try {
      // Admin operation - no auth needed
      console.log("🟡 Admin: Creating context (admin operation)");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      console.log("🟡 Admin: Making API request to /api/chat/contexts");
      const response = await fetch("/api/chat/contexts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newContext.content,
        }),
      });

      console.log("🟡 Admin: API response status:", response.status);

      if (response.ok) {
        console.log("✅ Admin: Context created successfully");
        const responseData = await response.json();
        console.log("✅ Admin: Response data:", responseData);
        setNewContext({ content: "" });
        fetchContexts();
      } else {
        console.error(
          "❌ Admin: Context creation failed with status:",
          response.status
        );
        const errorText = await response.text();
        console.error("❌ Admin: Error response:", errorText);
      }
    } catch (error) {
      console.error("❌ Admin: Error creating context:", error);
    } finally {
      console.log("🟡 Admin: Setting loading to false");
      setLoading(false);
    }
  };

  const handleUpdateContext = async () => {
    if (!editingContext || !editingContext.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/chat/contexts?id=${editingContext.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: editingContext.content,
          }),
        }
      );

      if (response.ok) {
        setEditingContext(null);
        fetchContexts();
      } else {
      }
    } catch (error) {
      console.error("Error updating context:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContext = async (id: string) => {
    if (!confirm("Are you sure you want to delete this context?")) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/contexts?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContexts();
      } else {
      }
    } catch (error) {
      console.error("Error deleting context:", error);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 flex-1" style={{ minHeight: "100vh" }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="w-full px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chatbot Setup</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Default Chatbot Messages */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Default Chatbot Messages
              </h2>

              {/* Greeting Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Greeting Message
                </label>
                <div className="space-y-2">
                  <textarea
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Enter greeting message..."
                    className={`w-full p-3 border border-gray-300 rounded-md h-24 resize-none outline-none ${
                      isEditingGreeting
                        ? "hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                        : "text-gray-500"
                    }`}
                    disabled={!isEditingGreeting}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveGreeting}
                      disabled={loading || !isEditingGreeting}
                      className={`cursor-pointer ${
                        isEditingGreeting
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-300 cursor-not-allowed text-gray-600"
                      }`}
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={
                        isEditingGreeting
                          ? () => setIsEditingGreeting(false)
                          : () => setIsEditingGreeting(true)
                      }
                      variant="outline"
                      className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      {isEditingGreeting ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Fallback Message */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fallback Message
                </label>
                <div className="space-y-2">
                  <textarea
                    value={fallbackMessage}
                    onChange={(e) => setFallbackMessage(e.target.value)}
                    placeholder="Enter fallback message..."
                    className={`w-full p-3 border border-gray-300 rounded-md h-24 resize-none outline-none ${
                      isEditingFallback
                        ? "hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                        : "text-gray-500"
                    }`}
                    disabled={!isEditingFallback}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveFallback}
                      disabled={loading || !isEditingFallback}
                      className={`cursor-pointer ${
                        isEditingFallback
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-300 cursor-not-allowed text-gray-600"
                      }`}
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={
                        isEditingFallback
                          ? () => setIsEditingFallback(false)
                          : () => setIsEditingFallback(true)
                      }
                      variant="outline"
                      className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      {isEditingFallback ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thick Gray Divider */}
            <div className="border-t-4 border-gray-300 mt-10 mb-15"></div>

            {/* Context Management Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Helpful Details Management
              </h2>

              {/* Create New Context */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Detail
                    </label>
                    <textarea
                      value={newContext.content}
                      onChange={(e) =>
                        setNewContext({
                          ...newContext,
                          content: e.target.value,
                        })
                      }
                      placeholder="Enter detail..."
                      className="w-full bg-white p-3 border border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateContext}
                      disabled={loading}
                      className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => setNewContext({ content: "" })}
                      disabled={loading}
                      variant="ghost"
                      className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Context List */}
              <div className="space-y-2">
                {/* <h3 className="text-md font-medium text-gray-900">
                  Existing Details ({contexts.length})
                </h3> */}
                {contexts.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {contexts.map((context) => (
                      <span
                        key={context.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded border border-gray-200"
                      >
                        <span
                          className="max-w-xs truncate"
                          title={context.content}
                        >
                          {context.content}
                        </span>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button
                          onClick={() => setEditingContext(context)}
                          className="text-orange-500 hover:text-orange-700 cursor-pointer -m-1"
                          title="Edit"
                        >
                          <img src="/pencil.svg" alt="Edit" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteContext(context.id)}
                          className="text-orange-500 hover:text-orange-700 cursor-pointer -m-1"
                          title="Delete"
                        >
                          <img src="/delete.svg" alt="Delete" className="w-5 h-5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No contexts found. Create your first context above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thick Gray Divider */}
            <div className="border-t-4 border-gray-300 mt-10 mb-15"></div>

            {/* Suggestion Menu & Responses */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Suggestion Menu & Responses
              </h2>
              
              {/* Existing FAQs List (Read-only) */}
              <div className="space-y-10 mb-6">
                {faqs
                  .filter(
                    (faq) =>
                      faq.topic !== "::greeting::" &&
                      faq.topic !== "::fallback::"
                  )
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((faq) => (
                    <SuggestionMenu 
                      key={faq.id}
                      faqs={[faq]}
                      loading={loading}
                      onFetchFAQs={fetchFAQs}
                      onDeleteFAQ={handleDeleteFAQ}
                      onDeleteAlias={handleDeleteAlias}
                      isReadOnly={editingFAQ?.id !== faq.id}
                      faq={faq}
                      onEdit={() => {
                        setEditingFAQ(faq);
                      }}
                      onClose={() => setEditingFAQ(null)}
                    />
                  ))}
                {faqs.filter(
                  (faq) =>
                    faq.topic !== "::greeting::" &&
                    faq.topic !== "::fallback::"
                ).length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No suggestion menu yet
                  </div>
                )}
              </div>

              {/* Create FAQ Form (Only show when + Add Suggestion menu is clicked) */}
              {showCreateFAQ && (
                <SuggestionMenu 
                  faqs={faqs}
                  loading={loading}
                  onFetchFAQs={fetchFAQs}
                  onDeleteFAQ={handleDeleteFAQ}
                  onDeleteAlias={handleDeleteAlias}
                  onClose={() => setShowCreateFAQ(false)}
                />
              )}

              
              {!showCreateFAQ && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowCreateFAQ(true)}
                    variant="outline"
                    className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    + Add Suggestion menu
                  </Button>
                </div>
              )}
            </div>

          </div>

          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>


        {/* Edit Context Modal */}
        {editingContext && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Context</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Context Content
                  </label>
                  <textarea
                    value={editingContext.content}
                    onChange={(e) =>
                      setEditingContext({
                        ...editingContext,
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter context information..."
                    className="w-full bg-white p-3 border border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md h-32 resize-none outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateContext}
                    disabled={loading}
                    className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => setEditingContext(null)}
                    variant="outline"
                    className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}