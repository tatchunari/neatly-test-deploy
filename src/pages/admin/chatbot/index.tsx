import { useState, useEffect } from 'react';
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";

interface FAQ {
  id: string;
  question: string;
  answer: string;
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
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  
  // Greeting and Fallback states
  const [greetingMessage, setGreetingMessage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);
  const [isEditingFallback, setIsEditingFallback] = useState(false);
  
  // Aliases states
  const [newAliasesUI, setNewAliasesUI] = useState<string[]>([]);
  const [editAliasesUI, setEditAliasesUI] = useState<string[]>([]);
  const [newAliasInput, setNewAliasInput] = useState<string>('');
  const [showAliases, setShowAliases] = useState(false);

  // Context states
  const [contexts, setContexts] = useState<Context[]>([]);
  const [newContext, setNewContext] = useState({ content: '' });
  const [editingContext, setEditingContext] = useState<Context | null>(null);

  // Load FAQs and Contexts on component mount
  useEffect(() => {
    fetchFAQs();
    fetchContexts();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/chat/faqs');
      const data = await response.json();
      const faqsData = data.faqs || [];
      
      // หา greeting และ fallback messages
      const greetingFaq = faqsData.find((faq: FAQ) => faq.question === '::greeting::');
      const fallbackFaq = faqsData.find((faq: FAQ) => faq.question === '::fallback::');
      
      if (greetingFaq) {
        setGreetingMessage(greetingFaq.answer);
      }
      if (fallbackFaq) {
        setFallbackMessage(fallbackFaq.answer);
      }
      
      // ดึง aliases สำหรับแต่ละ FAQ
      const faqsWithAliases = await Promise.all(
        faqsData.map(async (faq: FAQ) => {
          try {
            const aliasesResponse = await fetch(`/api/chat/aliases?faq_id=${faq.id}`);
            const aliasesData = await aliasesResponse.json();
            return { ...faq, aliases: aliasesData.aliases || [] };
          } catch (error) {
            console.error('Error fetching aliases for FAQ:', faq.id, error);
            return { ...faq, aliases: [] };
          }
        })
      );
      
      setFaqs(faqsWithAliases);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleCreateFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      alert('Please enter both topic and reply message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/chat/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newFAQ.question,
          answer: newFAQ.answer
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('FAQ creation response:', data);
        const newFaqId = data.faq?.id;
        
        console.log('FAQ created with ID:', newFaqId);
        
        if (!newFaqId) {
          console.error('No FAQ ID returned from API');
          alert('Error: No FAQ ID returned');
          return;
        }
        
        // ส่ง aliases ถ้ามี (await ให้แน่ใจว่า FAQ สร้างเสร็จแล้ว)
        if (newAliasesUI.length > 0 && newAliasesUI[0].trim()) {
          const cleanedAliases = newAliasesUI.filter(alias => alias.trim());
          if (cleanedAliases.length > 0) {
            console.log('Creating aliases for FAQ ID:', newFaqId, 'with aliases:', cleanedAliases);
            const aliasResponse = await fetch('/api/chat/aliases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                faq_id: newFaqId,
                aliases: cleanedAliases
              })
            });
            
            if (!aliasResponse.ok) {
              console.error('Failed to create aliases:', await aliasResponse.text());
              alert('FAQ created but failed to create aliases');
            } else {
              console.log('Aliases created successfully');
            }
          }
        }
        
        setNewFAQ({ question: '', answer: '' });
        setNewAliasesUI([]);
        setNewAliasInput('');
        setShowAliases(false);
        fetchFAQs();
        alert('FAQ created successfully');
      } else {
        alert('Error creating FAQ');
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
      alert('Error creating FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ || !editingFAQ.question.trim() || !editingFAQ.answer.trim()) {
      alert('Please enter both topic and reply message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/faqs?id=${editingFAQ.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingFAQ.question,
          answer: editingFAQ.answer
        })
      });

      if (response.ok) {
        console.log('FAQ updated with ID:', editingFAQ.id);
        
        // อัปเดต aliases ถ้ามี (await ให้แน่ใจว่า FAQ อัปเดตเสร็จแล้ว)
        if (editAliasesUI.length > 0 && editAliasesUI[0].trim()) {
          const cleanedAliases = editAliasesUI.filter(alias => alias.trim());
          if (cleanedAliases.length > 0) {
            console.log('Updating aliases for FAQ ID:', editingFAQ.id, 'with aliases:', cleanedAliases);
            const aliasResponse = await fetch('/api/chat/aliases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                faq_id: editingFAQ.id,
                aliases: cleanedAliases
              })
            });
            
            if (!aliasResponse.ok) {
              console.error('Failed to update aliases:', await aliasResponse.text());
              alert('FAQ updated but failed to update aliases');
            } else {
              console.log('Aliases updated successfully');
            }
          }
        }
        
        setEditingFAQ(null);
        setEditAliasesUI([]);
        fetchFAQs();
        alert('FAQ updated successfully');
      } else {
        alert('Error updating FAQ');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('Error updating FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/faqs?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchFAQs();
        alert('FAQ deleted successfully');
      } else {
        alert('Error deleting FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error deleting FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlias = async (aliasId: string) => {
    try {
      await fetch(`/api/chat/aliases?id=${aliasId}`, {
        method: 'DELETE'
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting alias:', error);
    }
  };

  const handleSaveGreeting = async () => {
    setLoading(true);
    try {
      // หา greeting message ที่มีอยู่
      const existingGreeting = faqs.find(faq => faq.question === '::greeting::');
      
      const response = await fetch(`/api/chat/faqs${existingGreeting ? `?id=${existingGreeting.id}` : ''}`, {
        method: existingGreeting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: '::greeting::',
          answer: greetingMessage
        })
      });
      
      if (response.ok) {
        setIsEditingGreeting(false);
        fetchFAQs();
        alert('Greeting message saved');
      } else {
        alert('Error saving greeting message');
      }
    } catch (error) {
      console.error('Error saving greeting:', error);
      alert('Error saving greeting message');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFallback = async () => {
    setLoading(true);
    try {
      // หา fallback message ที่มีอยู่
      const existingFallback = faqs.find(faq => faq.question === '::fallback::');
      
      const response = await fetch(`/api/chat/faqs${existingFallback ? `?id=${existingFallback.id}` : ''}`, {
        method: existingFallback ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: '::fallback::',
          answer: fallbackMessage
        })
      });
      
      if (response.ok) {
        setIsEditingFallback(false);
        fetchFAQs();
        alert('Fallback message saved');
      } else {
        alert('Error saving fallback message');
      }
    } catch (error) {
      console.error('Error saving fallback:', error);
      alert('Error saving fallback message');
    } finally {
      setLoading(false);
    }
  };

  // Context Management Functions
  const fetchContexts = async () => {
    try {
      const response = await fetch('/api/chat/contexts');
      const data = await response.json();
      setContexts(data.contexts || []);
    } catch (error) {
      console.error('Error fetching contexts:', error);
    }
  };

  const handleCreateContext = async () => {
    if (!newContext.content.trim()) {
      alert('Please enter context content');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/chat/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContext.content
        })
      });

      if (response.ok) {
        setNewContext({ content: '' });
        fetchContexts();
        alert('Context created successfully');
      } else {
        alert('Failed to create context');
      }
    } catch (error) {
      console.error('Error creating context:', error);
      alert('Error creating context');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContext = async () => {
    if (!editingContext || !editingContext.content.trim()) {
      alert('Please enter context content');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/contexts?id=${editingContext.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editingContext.content
        })
      });

      if (response.ok) {
        setEditingContext(null);
        fetchContexts();
        alert('Context updated successfully');
      } else {
        alert('Failed to update context');
      }
    } catch (error) {
      console.error('Error updating context:', error);
      alert('Error updating context');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContext = async (id: string) => {
    if (!confirm('Are you sure you want to delete this context?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/contexts?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchContexts();
        alert('Context deleted successfully');
      } else {
        alert('Failed to delete context');
      }
    } catch (error) {
      console.error('Error deleting context:', error);
      alert('Error deleting context');
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chatbot Setup</h1>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Default Chatbot Messages */}
          <div>
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Default Chatbot Messages</h2>
            
            {/* Greeting Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Message</label>
              <div className="space-y-2">
                <textarea
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Enter greeting message..."
                  className={`w-full p-3 border border-gray-300 rounded-md h-24 resize-none ${
                    isEditingGreeting ? 'hover:border-gray-400 text-black' : 'text-gray-500'
                  }`}
                  disabled={!isEditingGreeting}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveGreeting}
                    disabled={loading || !isEditingGreeting}
                    className={`cursor-pointer ${
                      isEditingGreeting 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={isEditingGreeting ? () => setIsEditingGreeting(false) : () => setIsEditingGreeting(true)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    {isEditingGreeting ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Fallback Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
              <div className="space-y-2">
                <textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  placeholder="Enter fallback message..."
                  className={`w-full p-3 border border-gray-300 rounded-md h-24 resize-none ${
                    isEditingFallback ? 'hover:border-gray-400 text-black' : 'text-gray-500'
                  }`}
                  disabled={!isEditingFallback}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveFallback}
                    disabled={loading || !isEditingFallback}
                    className={`cursor-pointer ${
                      isEditingFallback 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={isEditingFallback ? () => setIsEditingFallback(false) : () => setIsEditingFallback(true)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    {isEditingFallback ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thick Gray Divider */}
          <div className="border-t-4 border-gray-300 my-6"></div>

          {/* Suggestion Menu & Responses */}
          <div>
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Suggestion Menu & Responses</h2>
            
            {/* Create New FAQ */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <div className="flex gap-2">
                    <Input
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                      placeholder="Enter topic..."
                      className="flex-1 border bg-white border-gray-300 rounded-md resize-none"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAliases(!showAliases);
                        if (!showAliases) {
                          setNewAliasesUI([]);
                          setNewAliasInput('');
                        }
                      }}
                      className="cursor-pointer whitespace-nowrap"
                    >
                      {showAliases ? 'Hide Aliases' : 'Add Aliases'}
                    </Button>
                  </div>
                </div>
                {showAliases && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Aliases</label>
                    <div className="flex gap-2">
                      <Input
                        value={newAliasInput}
                        onChange={(e) => setNewAliasInput(e.target.value)}
                        placeholder="Enter alias phrase..."
                        className="flex-1 border bg-white border-gray-300 rounded-md resize-none"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (newAliasInput.trim()) {
                            setNewAliasesUI([...newAliasesUI, newAliasInput.trim()]);
                            setNewAliasInput('');
                          }
                        }}
                        className="cursor-pointer"
                      >
                        + Add
                      </Button>
                    </div>
                    {newAliasesUI.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newAliasesUI.map((alias, index) => (
                          <div key={index} className="flex items-center bg-gray-300 rounded-md px-3 py-1 text-sm">
                            <span>{alias}</span>
                            <button
                              onClick={() => setNewAliasesUI(newAliasesUI.filter((_, i) => i !== index))}
                              className="ml-2 text-black hover:text-red-600 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Reply message</label>
                  <textarea
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                    placeholder="Enter reply message..."
                    className="w-full bg-white p-3 border border-gray-300 rounded-md h-24 resize-none"
                  />
                </div>
                <Button
                  onClick={handleCreateFAQ}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create FAQ'}
                </Button>
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Existing FAQs ({faqs.filter(faq => faq.question !== '::greeting::' && faq.question !== '::fallback::').length})</h3>
              {faqs
                .filter(faq => faq.question !== '::greeting::' && faq.question !== '::fallback::')
                .map((faq) => (
                <div key={faq.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm mb-2">{faq.answer}</p>
                      
                      {/* Display aliases */}
                      {faq.aliases && faq.aliases.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Aliases:</p>
                          <div className="flex flex-wrap gap-1">
                            {faq.aliases.map((alias) => (
                              <span
                                key={alias.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {alias.alias}
                                <button
                                  onClick={() => handleDeleteAlias(alias.id)}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400">
                        Created: {new Date(faq.created_at).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        onClick={() => {
                          setEditingFAQ(faq);
                          setEditAliasesUI(faq.aliases?.map(a => a.alias) || ['']);
                        }}
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleDeleteFAQ(faq.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {faqs.filter(faq => faq.question !== '::greeting::' && faq.question !== '::fallback::').length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No FAQs yet
                </div>
              )}
            </div>


            {/* Thick Gray Divider */}
            <div className="border-t-4 border-gray-300 my-6"></div>
            {/* Context Management Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Context Management</h2>

              {/* Create New Context */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Context Content</label>
                    <textarea
                      value={newContext.content}
                      onChange={(e) => setNewContext({ ...newContext, content: e.target.value })}
                      placeholder="Enter additional context information for chatbot responses..."
                      className="w-full bg-white p-3 border border-gray-300 rounded-md resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleCreateContext}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
                  >
                    {loading ? 'Creating...' : 'Create Context'}
                  </Button>
                </div>
              </div>

              {/* Context List */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Existing Contexts ({contexts.length})</h3>
                {contexts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {contexts.map((context) => (
                      <div
                        key={context.id}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border"
                      >
                        <span className="max-w-xs truncate" title={context.content}>
                          {context.content}
                        </span>
                        <button
                          onClick={() => setEditingContext(context)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteContext(context.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer text-xs"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
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
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Input
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reply message</label>
                <textarea
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateFAQ} 
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={() => {
                    setEditingFAQ(null);
                    setEditAliasesUI(['']);
                  }}
                  variant="outline"
                  className="cursor-pointer"
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
                <label className="block text-sm font-medium mb-2">Context Content</label>
                <textarea
                  value={editingContext.content}
                  onChange={(e) => setEditingContext({ ...editingContext, content: e.target.value })}
                  placeholder="Enter context information..."
                  className="w-full bg-white p-3 border border-gray-300 rounded-md h-32 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateContext}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={() => setEditingContext(null)}
                  variant="outline"
                  className="cursor-pointer"
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
