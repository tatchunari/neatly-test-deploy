import { useState, useEffect, useCallback } from "react";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import { FileQuestionMark } from "lucide-react";
import { ChatbotDropdown } from "@/components/admin/ui/ChatbotDropdown";

// Types for reply payloads
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

interface SuggestionMenuProps {
  faqs: FAQ[];
  loading: boolean;
  onFetchFAQs: () => void;
  onDeleteFAQ: (id: string) => void;
  onDeleteAlias: (aliasId: string) => void;
  isReadOnly?: boolean;
  faq?: FAQ;
  onClose?: () => void;
  onEdit?: () => void;
}

export default function SuggestionMenu({ 
  faqs, 
  loading, 
  onFetchFAQs, 
  onDeleteFAQ, 
  onDeleteAlias,
  isReadOnly = false,
  faq,
  onClose,
  onEdit
}: SuggestionMenuProps) {
  // Base input styles
  const baseInputStyles = "w-full border !bg-white border-gray-300 rounded-md text-sm px-3 py-2";
   const readOnlyStyles = isReadOnly ? "text-gray-600 !bg-white !border-gray-300 !opacity-50" : "hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer";
  const inputClassName = `${baseInputStyles} ${readOnlyStyles}`;
  // Helper function to get format display string
  const getFormatDisplayString = (format?: string): string => {
    switch (format) {
      case 'message': return 'Message';
      case 'room_type': return 'Room type';
      case 'option_details': return 'Option with details';
      default: return 'Message';
    }
  };

  const [newFAQ, setNewFAQ] = useState({ 
    question: faq?.topic || "", 
    answer: faq?.reply_message || "", 
    format: faq ? getFormatDisplayString(faq.reply_format) : "",
    replyTitle: "",
    roomType: "",
    buttonName: "",
    options: [{ option: "", detail: "" }]
  });



  // Room types state
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);

  const formatOptions = ["Message", "Room type", "Option with details"];

  // Load FAQ data when component mounts or faq changes
  useEffect(() => {
    if (faq) {
      const displayFormat = getFormatDisplayString(faq.reply_format);
      
      // Parse reply_payload for Room type and Option with details
      let replyTitle = "";
      let roomTypesSelection: string[] = [];
      let buttonName = "";
      let options = [{ option: "", detail: "" }];

      if (faq.reply_format === 'room_type' && faq.reply_payload) {
        const payload = faq.reply_payload as RoomTypePayload;
        if (payload.rooms) {
          roomTypesSelection = payload.rooms;
        }
        if (payload.buttonName) {
          buttonName = payload.buttonName;
        }
        // For room_type, reply_message is the replyTitle
        replyTitle = faq.reply_message;
      } else if (faq.reply_format === 'option_details' && faq.reply_payload) {
        const payload = faq.reply_payload as OptionDetailsPayload;
        if (payload && payload.length > 0) {
          options = payload;
        }
        // For option_details, reply_message is the replyTitle
        replyTitle = faq.reply_message;
      } else if (faq.reply_format === 'message') {
        // For message, reply_message is the answer
        replyTitle = "";
      }

      setNewFAQ({
        question: faq.topic,
        answer: faq.reply_format === 'message' ? faq.reply_message : replyTitle,
        format: displayFormat,
        replyTitle: replyTitle,
        roomType: roomTypesSelection.join(","),
        buttonName: buttonName,
        options: options
      });

      setSelectedRoomTypes(roomTypesSelection);
      
      // Load existing aliases into newAliasesUI when editing
      if (faq.aliases && faq.aliases.length > 0) {
        setNewAliasesUI(faq.aliases.map(alias => alias.alias));
      } else {
        setNewAliasesUI([]);
      }
    } else {
      // Reset for new FAQ creation
      setNewFAQ({
        question: "",
        answer: "",
        format: "",
        replyTitle: "",
        roomType: "",
        buttonName: "",
        options: [{ option: "", detail: "" }]
      });
      setSelectedRoomTypes([]);
      setNewAliasesUI([]);
    }
  }, [faq]);

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await fetch('/api/room_types');
        const data = await response.json();
        const types = data.data?.map((roomType: { name: string }) => roomType.name) || [];
        setRoomTypes(types);
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };
    fetchRoomTypes();
  }, [faq]);


  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Aliases states
  const [newAliasesUI, setNewAliasesUI] = useState<string[]>([]);
  const [editAliasesUI, setEditAliasesUI] = useState<string[]>([]);
  const [newAliasInput, setNewAliasInput] = useState<string>("");
  const [showAliases, setShowAliases] = useState(false);

  const handleCreateFAQ = async () => {
    // Validation based on format
    if (!newFAQ.question.trim()) {
      alert("Please fill in Topic field");
      return;
    }

    if (!newFAQ.format.trim()) {
      alert("Please select a Reply format");
      return;
    }

    if (newFAQ.format === "Message" && !newFAQ.answer.trim()) {
      alert("Please fill in Reply message field");
      return;
    }

    if ((newFAQ.format === "Room type" || newFAQ.format === "Option with details") && !newFAQ.replyTitle.trim()) {
      alert("Please fill in Reply title field");
      return;
    }

    try {
      // Prepare payload based on format
      let reply_format: 'message' | 'room_type' | 'option_details' = 'message';
      let reply_payload: ReplyPayload = null;
      let reply_message = "";

      if (newFAQ.format === "Message") {
        reply_format = 'message';
        reply_payload = null;
        reply_message = newFAQ.answer;
      } else if (newFAQ.format === "Room type") {
        reply_format = 'room_type';
        reply_payload = {
          rooms: selectedRoomTypes,
          buttonName: newFAQ.buttonName || "View Details"
        };
        reply_message = newFAQ.replyTitle;
      } else if (newFAQ.format === "Option with details") {
        reply_format = 'option_details';
        reply_payload = newFAQ.options.filter(opt => opt.option.trim() && opt.detail.trim());
        reply_message = newFAQ.replyTitle;
      }

      console.log("Sending FAQ data:", {
        topic: newFAQ.question,
        reply_message,
        reply_format,
        reply_payload,
        created_by: "admin-user-id",
        aliases: newAliasesUI.filter(alias => alias.trim())
      });

      const isEditing = Boolean(faq?.id);
      const url = isEditing ? `/api/chat/faqs?id=${faq?.id}` : "/api/chat/faqs";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? {
            topic: newFAQ.question,
            reply_message,
            reply_format,
            reply_payload,
            aliases: newAliasesUI.filter(alias => alias.trim()),
          }
        : {
            topic: newFAQ.question,
            reply_message,
            reply_format,
            reply_payload,
            created_by: null,
            aliases: newAliasesUI.filter(alias => alias.trim()),
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("FAQ creation response:", data);

        setNewFAQ({ 
          question: "", 
          answer: "", 
          format: "",
          replyTitle: "",
          roomType: "",
          buttonName: "",
          options: [{ option: "", detail: "" }]
        });
        setNewAliasesUI([]);
        setNewAliasInput("");
        setShowAliases(false);
        setSelectedRoomTypes([]);
        onFetchFAQs();
        alert(isEditing ? "FAQ updated successfully!" : "FAQ created successfully!");
        // Close the create form
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to create FAQ:", errorData);
        alert(`Failed to create FAQ: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      alert(`Error creating FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div>

      {/* Create New FAQ */}
      <div className="mb-6 pl-4 pr-0 py-4 border border-gray-200 rounded-lg bg-gray-100">
        <div className="flex gap-0">
          {/* Left side - Form fields (95%) */}
          <div className="flex-1 w-[95%] space-y-4">
             <div>
               <div className="flex gap-2 items-end">
                 <div className="flex-1 [&_label]:text-gray-900">
                   <label className="block text-sm font-medium mb-2">
                     Topic *
                   </label>
                   <div className="relative">
                     <Input
                       value={newFAQ.question}
                       onChange={(e) =>
                         setNewFAQ({ ...newFAQ, question: e.target.value })
                       }
                       placeholder="Enter topic..."
                       disabled={isReadOnly}
                       className={`${inputClassName} pr-10 !bg-white`}
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
                <div className="flex-1 [&_label]:text-gray-900">
                  <ChatbotDropdown
                    label="Reply format"
                    options={formatOptions}
                    value={newFAQ.format}
                    onChange={(value) => {
                      if (typeof value === 'string') {
                        setNewFAQ(prev => ({ ...prev, format: value }));
                      }
                    }}
                    placeholder="Select reply format..."
                    disabled={isReadOnly}
                  />
                </div>
               </div>
             </div>
          {showAliases && (
            <div className="space-y-2 [&_label]:text-gray-900">
              <label className="block text-sm font-medium mb-2">
                Linked Questions
              </label>
              
              {/* Input section - only show when not read-only */}
              {!isReadOnly && (
                <div className="flex gap-2">
                  <Input
                    value={newAliasInput}
                    onChange={(e) => setNewAliasInput(e.target.value)}
                    placeholder="Enter alias phrase..."
                    className={`${inputClassName} flex-1 !bg-white`}
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
              )}
              {/* Existing aliases */}
              {faq?.aliases && faq.aliases.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {faq.aliases.map((alias) => (
                    <div
                      key={alias.id}
                      className={`flex items-center rounded-md px-3 py-1 text-sm ${
                        isReadOnly ? "bg-gray-200 text-gray-600" : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      <span>{alias.alias}</span>
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            onDeleteAlias(alias.id);
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New aliases being added */}
              {newAliasesUI.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newAliasesUI.map((alias, index) => (
                    <div
                      key={index}
                      className={`flex items-center rounded-md px-3 py-1 text-sm ${
                        isReadOnly ? "bg-gray-200 text-gray-600" : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      <span>{alias}</span>
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            setNewAliasesUI(
                              newAliasesUI.filter((_, i) => i !== index)
                            );
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Dynamic fields based on format */}
          {newFAQ.format === "Message" && (
            <div className="[&_label]:text-gray-900">
              <label className="block text-sm font-medium mb-2">
                Reply message
              </label>
              <textarea
                value={newFAQ.answer}
                onChange={(e) =>
                  setNewFAQ({ ...newFAQ, answer: e.target.value })
                }
                placeholder="Enter reply message..."
                disabled={isReadOnly}
                className={`${inputClassName} h-24 resize-none outline-none !bg-white`}
              />
            </div>
          )}

          {newFAQ.format === "Room type" && (
            <>
              <div className="[&_label]:text-gray-900">
                <label className="block text-sm font-medium mb-2">
                  Reply title
                </label>
                <Input
                  value={newFAQ.replyTitle}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, replyTitle: e.target.value })
                  }
                  placeholder="Enter reply title..."
                  disabled={isReadOnly}
                  className={`${inputClassName} !bg-white`}
                />
              </div>
              <div className="[&_label]:text-gray-900">
                <ChatbotDropdown
                  label="Room Type"
                  options={roomTypes}
                  value={selectedRoomTypes}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      setSelectedRoomTypes(value);
                      setNewFAQ(prev => ({ ...prev, roomType: value.join(",") }));
                    }
                  }}
                  placeholder="Select room types..."
                  disabled={isReadOnly}
                  multiple={true}
                  searchable={true}
                  showAllOption={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Button Name
                </label>
                <Input
                  value={newFAQ.buttonName}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, buttonName: e.target.value })
                  }
                  placeholder="Enter button name..."
                  disabled={isReadOnly}
                  className={`${inputClassName} !bg-white`}
                />
              </div>
            </>
          )}

          {newFAQ.format === "Option with details" && (
            <>
              <div className="[&_label]:text-gray-900">
                <label className="block text-sm font-medium mb-2">
                  Reply title
                </label>
                <Input
                  value={newFAQ.replyTitle}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, replyTitle: e.target.value })
                  }
                  placeholder="Enter reply title..."
                  disabled={isReadOnly}
                  className={`${inputClassName} !bg-white`}
                />
              </div>
              <div>
                {newFAQ.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-1 [&_label]:text-gray-900">
                      <label className="block text-sm font-medium mb-2">
                        Option
                      </label>
                      <Input
                        value={option.option}
                        onChange={(e) => {
                          const newOptions = [...newFAQ.options];
                          newOptions[index].option = e.target.value;
                          setNewFAQ({ ...newFAQ, options: newOptions });
                        }}
                        placeholder="Enter option..."
                        disabled={isReadOnly}
                        className={`${inputClassName} !bg-white`}
                      />
                    </div>
                    <div className="flex-1 [&_label]:text-gray-900">
                      <label className="block text-sm font-medium mb-2">
                        Detail
                      </label>
                      <Input
                        value={option.detail}
                        onChange={(e) => {
                          const newOptions = [...newFAQ.options];
                          newOptions[index].detail = e.target.value;
                          setNewFAQ({ ...newFAQ, options: newOptions });
                        }}
                        placeholder="Enter detail..."
                        disabled={isReadOnly}
                        className={`${inputClassName} !bg-white`}
                      />
                    </div>
                    {newFAQ.options.length > 1 && !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = newFAQ.options.filter((_, i) => i !== index);
                          setNewFAQ({ ...newFAQ, options: newOptions });
                        }}
                        className="px-2 py-1 text-red-500 text-sm cursor-pointer hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <Button
                    type="button"
                    onClick={() => {
                      setNewFAQ({
                        ...newFAQ,
                        options: [...newFAQ.options, { option: "", detail: "" }]
                      });
                    }}
                    variant="outline"
                    className="mt-2 bg-white cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </>
          )}
          {!isReadOnly && (
            <div className="flex gap-2">
              <Button
                onClick={handleCreateFAQ}
                disabled={loading}
                className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => {
                  if (faq) {
                    // If editing existing FAQ, reset to original values
                    const displayFormat = getFormatDisplayString(faq.reply_format);
                    
                    // Parse original reply_payload
                    let replyTitle = "";
                    let roomTypesSelection: string[] = [];
                    let buttonName = "";
                    let options = [{ option: "", detail: "" }];

                    if (faq.reply_format === 'room_type' && faq.reply_payload) {
                      const payload = faq.reply_payload as RoomTypePayload;
                      if (payload.rooms) {
                        roomTypesSelection = payload.rooms;
                      }
                      if (payload.buttonName) {
                        buttonName = payload.buttonName;
                      }
                      replyTitle = faq.reply_message;
                    } else if (faq.reply_format === 'option_details' && faq.reply_payload) {
                      const payload = faq.reply_payload as OptionDetailsPayload;
                      if (payload && payload.length > 0) {
                        options = payload;
                      }
                      replyTitle = faq.reply_message;
                    } else if (faq.reply_format === 'message') {
                      replyTitle = "";
                    }

                    setNewFAQ({
                      question: faq.topic,
                      answer: faq.reply_format === 'message' ? faq.reply_message : replyTitle,
                      format: displayFormat,
                      replyTitle: replyTitle,
                      roomType: roomTypesSelection.join(","),
                      buttonName: buttonName,
                      options: options
                    });

                    setSelectedRoomTypes(roomTypesSelection);
                  } else {
                    // If creating new FAQ, clear form
                    setNewFAQ({ 
                      question: "", 
                      answer: "", 
                      format: "",
                      replyTitle: "",
                      roomType: "",
                      buttonName: "",
                      options: [{ option: "", detail: "" }]
                    });
                    setSelectedRoomTypes([]);
                  }
                  setNewAliasesUI([]);
                  setNewAliasInput("");
                  setShowAliases(false);
                  if (onClose) {
                    onClose();
                  }
                }}
                disabled={loading}
                variant="ghost"
                className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          )}
          </div>

          {/* Right side - Icons (5%) */}
          <div className="w-[5%] flex flex-col items-center justify-start">
            <button className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" title="Drag">
              <img src="/drag.svg" alt="Drag" className="w-5 h-5" />
            </button>
            {faq && (
              <button 
                className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" 
                title="Edit"
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  }
                }}
              >
                <img src="/pencil.svg" alt="Edit" className="w-5 h-5" />
              </button>
            )}
            {faq && (
              <button 
                className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer" 
                title="Delete"
                onClick={() => {
                  if (onDeleteFAQ) {
                    onDeleteFAQ(faq.id);
                  }
                }}
              >
                <img src="/delete.svg" alt="Delete" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}