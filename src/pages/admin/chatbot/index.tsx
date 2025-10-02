import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import { FileQuestionMark } from "lucide-react";
import { DropDownInput } from "@/components/admin/ui/DropdownInput";

interface FAQ {
  id: string;
  topic: string;
  reply_message: string;
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
  const [newFAQ, setNewFAQ] = useState({ 
    question: "", 
    answer: "", 
    format: "Message",
    replyTitle: "",
    roomType: "",
    buttonName: "",
    options: [{ option: "", detail: "" }]
  });

  // Stable setValue function to prevent infinite loop
  const setFormatValue = useCallback((name: string, value: string) => {
    setNewFAQ(prev => ({ ...prev, format: value }));
  }, []);

  // Room types state
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        const types = [...new Set(data.data?.map((room: { room_type: string }) => room.room_type) || [])] as string[];
        setRoomTypes(types);
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };
    fetchRoomTypes();
  }, []);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Greeting and Fallback states
  const [greetingMessage, setGreetingMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);
  const [isEditingFallback, setIsEditingFallback] = useState(false);

  // Aliases states
  const [newAliasesUI, setNewAliasesUI] = useState<string[]>([]);
  const [editAliasesUI, setEditAliasesUI] = useState<string[]>([]);
  const [newAliasInput, setNewAliasInput] = useState<string>("");
  const [showAliases, setShowAliases] = useState(false);

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

  const handleCreateFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/chat/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newFAQ.question,
          answer: newFAQ.answer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("FAQ creation response:", data);
        const newFaqId = data.faq?.id;

        console.log("FAQ created with ID:", newFaqId);

        if (!newFaqId) {
          console.error("No FAQ ID returned from API");
          return;
        }

        // ส่ง aliases ถ้ามี (await ให้แน่ใจว่า FAQ สร้างเสร็จแล้ว)
        if (newAliasesUI.length > 0 && newAliasesUI[0].trim()) {
          const cleanedAliases = newAliasesUI.filter((alias) => alias.trim());
          if (cleanedAliases.length > 0) {
            console.log(
              "Creating aliases for FAQ ID:",
              newFaqId,
              "with aliases:",
              cleanedAliases
            );
            const aliasResponse = await fetch("/api/chat/aliases", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                faq_id: newFaqId,
                aliases: cleanedAliases,
              }),
            });

            if (!aliasResponse.ok) {
              console.error(
                "Failed to create aliases:",
                await aliasResponse.text()
              );
            } else {
              console.log("Aliases created successfully");
            }
          }
        }

        setNewFAQ({ 
          question: "", 
          answer: "", 
          format: "Message",
          replyTitle: "",
          roomType: "",
          buttonName: "",
          options: [{ option: "", detail: "" }]
        });
        setNewAliasesUI([]);
        setNewAliasInput("");
        setShowAliases(false);
        fetchFAQs();
      } else {
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
    } finally {
      setLoading(false);
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
          question: editingFAQ.topic,
          answer: editingFAQ.reply_message,
        }),
      });

      if (response.ok) {
        console.log("FAQ updated with ID:", editingFAQ.id);

        // อัปเดต aliases ถ้ามี (await ให้แน่ใจว่า FAQ อัปเดตเสร็จแล้ว)
        if (editAliasesUI.length > 0 && editAliasesUI[0].trim()) {
          const cleanedAliases = editAliasesUI.filter((alias) => alias.trim());
          if (cleanedAliases.length > 0) {
            console.log(
              "Updating aliases for FAQ ID:",
              editingFAQ.id,
              "with aliases:",
              cleanedAliases
            );
            const aliasResponse = await fetch("/api/chat/aliases", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                faq_id: editingFAQ.id,
                aliases: cleanedAliases,
              }),
            });

            if (!aliasResponse.ok) {
              console.error(
                "Failed to update aliases:",
                await aliasResponse.text()
              );
            } else {
              console.log("Aliases updated successfully");
            }
          }
        }

        setEditingFAQ(null);
        setEditAliasesUI([]);
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
            question: "::greeting::",
            answer: greetingMessage,
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
            question: "::fallback::",
            answer: fallbackMessage,
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Suggestion Menu & Responses */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Suggestion Menu & Responses
              </h2>

              {/* Create New FAQ */}
              <div className="mb-6 pl-4 pr-0 py-4 border border-gray-200 rounded-lg bg-gray-100">
                <div className="flex gap-0">
                  {/* Left side - Form fields (95%) */}
                  <div className="flex-1 w-[95%] space-y-4">
                     <div>
                       <div className="flex gap-2 items-end">
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Topic *
                           </label>
                           <div className="relative">
                             <Input
                               value={newFAQ.question}
                               onChange={(e) =>
                                 setNewFAQ({ ...newFAQ, question: e.target.value })
                               }
                               placeholder="Enter topic..."
                               className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none pr-10"
                             />
                             <button
                               onClick={() => {
                                 setShowAliases(!showAliases);
                                 if (!showAliases) {
                                   setNewAliasesUI([]);
                                   setNewAliasInput("");
                                 }
                               }}
                               className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-orange-500 hover:text-orange-700 cursor-pointer"
                               title={showAliases ? "Hide Aliases" : "Add Aliases"}
                             >
                               <FileQuestionMark className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         <div className="flex-1">
                           <DropDownInput
                             label="Reply format"
                             options={["Message", "Room Type", "Option with details"]}
                             register={{ 
                               name: "format",
                               onChange: async () => {},
                               onBlur: async () => {},
                               ref: () => {}
                             }}
                             setValue={setFormatValue}
                             name="format"
                             defaultValue="Message"
                           />
                         </div>
                       </div>
                     </div>
                  {showAliases && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Linked Questions
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={newAliasInput}
                          onChange={(e) => setNewAliasInput(e.target.value)}
                          placeholder="Enter alias phrase..."
                          className="flex-1 border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (newAliasInput.trim()) {
                              setNewAliasesUI([
                                ...newAliasesUI,
                                newAliasInput.trim(),
                              ]);
                              setNewAliasInput("");
                            }
                          }}
                          className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          + Add
                        </Button>
                      </div>
                      {newAliasesUI.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newAliasesUI.map((alias, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-gray-300 rounded-md px-3 py-1 text-sm"
                            >
                              <span>{alias}</span>
                              <button
                                onClick={() =>
                                  setNewAliasesUI(
                                    newAliasesUI.filter((_, i) => i !== index)
                                  )
                                }
                                className="ml-2 text-orange-500 hover:text-orange-700 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Dynamic fields based on format */}
                  {newFAQ.format === "Message" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reply message
                      </label>
                      <textarea
                        value={newFAQ.answer}
                        onChange={(e) =>
                          setNewFAQ({ ...newFAQ, answer: e.target.value })
                        }
                        placeholder="Enter reply message..."
                        className="w-full bg-white p-3 border border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md h-24 resize-none outline-none"
                      />
                    </div>
                  )}

                  {newFAQ.format === "Room Type" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Reply title
                        </label>
                        <Input
                          value={newFAQ.replyTitle}
                          onChange={(e) =>
                            setNewFAQ({ ...newFAQ, replyTitle: e.target.value })
                          }
                          placeholder="Enter reply title..."
                          className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Room Type
                        </label>
                        <select
                          value={newFAQ.roomType}
                          onChange={(e) =>
                            setNewFAQ({ ...newFAQ, roomType: e.target.value })
                          }
                          className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md px-3 py-2"
                        >
                          <option value="">Select room type</option>
                          {roomTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Button Name
                        </label>
                        <Input
                          value={newFAQ.buttonName}
                          onChange={(e) =>
                            setNewFAQ({ ...newFAQ, buttonName: e.target.value })
                          }
                          placeholder="Enter button name..."
                          className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none"
                        />
                      </div>
                    </>
                  )}

                  {newFAQ.format === "Option with details" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Reply title
                        </label>
                        <Input
                          value={newFAQ.replyTitle}
                          onChange={(e) =>
                            setNewFAQ({ ...newFAQ, replyTitle: e.target.value })
                          }
                          placeholder="Enter reply title..."
                          className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none"
                        />
                      </div>
                      <div>
                        <div className="flex gap-2 items-end mb-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Option
                            </label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Detail
                            </label>
                          </div>
                        </div>
                        {newFAQ.options.map((option, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <div className="flex-1">
                              <Input
                                value={option.option}
                                onChange={(e) => {
                                  const newOptions = [...newFAQ.options];
                                  newOptions[index].option = e.target.value;
                                  setNewFAQ({ ...newFAQ, options: newOptions });
                                }}
                                placeholder="Enter option..."
                                className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                value={option.detail}
                                onChange={(e) => {
                                  const newOptions = [...newFAQ.options];
                                  newOptions[index].detail = e.target.value;
                                  setNewFAQ({ ...newFAQ, options: newOptions });
                                }}
                                placeholder="Enter detail..."
                                className="w-full border bg-white border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md"
                              />
                            </div>
                            {newFAQ.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = newFAQ.options.filter((_, i) => i !== index);
                                  setNewFAQ({ ...newFAQ, options: newOptions });
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setNewFAQ({
                              ...newFAQ,
                              options: [...newFAQ.options, { option: "", detail: "" }]
                            });
                          }}
                          className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                        >
                          Add Option
                        </button>
                      </div>
                    </>
                  )}
                  <Button
                    onClick={handleCreateFAQ}
                    disabled={loading}
                    className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
                  >
                    {loading ? "Creating..." : "Create FAQ"}
                  </Button>
                  </div>

                  {/* Right side - Icons (5%) */}
                  <div className="w-[5%] flex flex-col items-center justify-start">
                    <button className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" title="Drag">
                      <img src="/drag.svg" alt="Drag" className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" title="Edit">
                      <img src="/pencil.svg" alt="Edit" className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" title="Delete">
                      <img src="/delete.svg" alt="Delete" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">
                  Existing FAQs (
                  {
                    faqs.filter(
                      (faq) =>
                        faq.topic !== "::greeting::" &&
                        faq.topic !== "::fallback::"
                    ).length
                  }
                  )
                </h3>
                {faqs
                  .filter(
                    (faq) =>
                      faq.topic !== "::greeting::" &&
                      faq.topic !== "::fallback::"
                  )
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {faq.topic}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {faq.reply_message}
                          </p>

                          {/* Display aliases */}
                          {faq.aliases && faq.aliases.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">
                                Aliases:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {faq.aliases.map((alias) => (
                                  <span
                                    key={alias.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {alias.alias}
                                    <button
                                      onClick={() =>
                                        handleDeleteAlias(alias.id)
                                      }
                                      className="text-orange-500 hover:text-orange-700 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-400">
                            Created:{" "}
                            {new Date(faq.created_at).toLocaleString("en-US")}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => {
                              setEditingFAQ(faq);
                              setEditAliasesUI(
                                faq.aliases?.map((a) => a.alias) || [""]
                              );
                            }}
                            size="sm"
                            variant="outline"
                            className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            size="sm"
                            className="bg-orange-700 text-white hover:bg-orange-800 cursor-pointer"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {faqs.filter(
                  (faq) =>
                    faq.topic !== "::greeting::" &&
                    faq.topic !== "::fallback::"
                ).length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No FAQs yet
                  </div>
                )}
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
                      <label className="block text-sm font-medium mb-2">
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
                        placeholder="Enter additional context information for chatbot responses..."
                        className="w-full bg-white p-3 border border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md resize-none outline-none"
                      />
                    </div>
                    <Button
                      onClick={handleCreateContext}
                      disabled={loading}
                      className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
                    >
                      {loading ? "Creating..." : "Create Detail"}
                    </Button>
                  </div>
                </div>

                {/* Context List */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Existing Details ({contexts.length})
                  </h3>
                  {contexts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contexts.map((context) => (
                        <span
                          key={context.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200"
                        >
                          <span
                            className="max-w-xs truncate"
                            title={context.content}
                          >
                            {context.content}
                          </span>
                          <button
                            onClick={() => setEditingContext(context)}
                            className="text-orange-500 hover:text-orange-700 cursor-pointer"
                            title="Edit"
                          >
                            <img src="/pencil.svg" alt="Edit" className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteContext(context.id)}
                            className="text-orange-500 hover:text-orange-700 cursor-pointer text-xs"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No contexts found. Create your first context above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>

        {/* Edit FAQ Modal */}
        {editingFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Edit FAQ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topic
                  </label>
                  <Input
                    value={editingFAQ.topic}
                    onChange={(e) =>
                      setEditingFAQ({ ...editingFAQ, topic: e.target.value })
                    }
                    className="w-full hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reply message
                  </label>
                  <textarea
                    value={editingFAQ.reply_message}
                    onChange={(e) =>
                      setEditingFAQ({ ...editingFAQ, reply_message: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md h-24 resize-none outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateFAQ}
                    disabled={loading}
                    className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingFAQ(null);
                      setEditAliasesUI([""]);
                    }}
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
