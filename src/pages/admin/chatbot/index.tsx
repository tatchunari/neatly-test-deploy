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
}

export default function ChatbotAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Load FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/chat/faqs');
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const createEmbedding = async (text: string) => {
    try {
      const response = await fetch('/api/chat/embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      return null;
    }
  };

  const handleCreateFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      alert('กรุณากรอกคำถามและคำตอบ');
      return;
    }

    setLoading(true);
    try {
      // Create embedding from question
      const embedding = await createEmbedding(newFAQ.question);
      console.log('Created embedding:', embedding ? `${embedding.length} dimensions` : 'null');
      
      const response = await fetch('/api/chat/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newFAQ.question,
          answer: newFAQ.answer,
          embedding: embedding // ส่ง embedding ไปด้วย
        })
      });

      if (response.ok) {
        setNewFAQ({ question: '', answer: '' });
        fetchFAQs(); // Reload FAQs
        alert('สร้าง FAQ สำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการสร้าง FAQ');
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ || !editingFAQ.question.trim() || !editingFAQ.answer.trim()) {
      alert('กรุณากรอกคำถามและคำตอบ');
      return;
    }

    setLoading(true);
    try {
      // Create new embedding from updated question
      const embedding = await createEmbedding(editingFAQ.question);
      console.log('Created embedding for update:', embedding ? `${embedding.length} dimensions` : 'null');
      
      const response = await fetch(`/api/chat/faqs?id=${editingFAQ.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingFAQ.question,
          answer: editingFAQ.answer,
          embedding: embedding // ส่ง embedding ไปด้วย
        })
      });

      if (response.ok) {
        setEditingFAQ(null);
        fetchFAQs(); // Reload FAQs
        alert('แก้ไข FAQ สำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการแก้ไข FAQ');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไข FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ FAQ นี้?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/faqs?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchFAQs(); // Reload FAQs
        alert('ลบ FAQ สำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการลบ FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('เกิดข้อผิดพลาดในการลบ FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Chatbot FAQ Management</h1>
        
        {/* Create New FAQ */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">สร้าง FAQ ใหม่</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">คำถาม</label>
              <Input
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                placeholder="กรอกคำถาม..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">คำตอบ</label>
              <textarea
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                placeholder="กรอกคำตอบ..."
                className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
              />
            </div>
            <Button 
              onClick={handleCreateFAQ} 
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้าง FAQ'}
            </Button>
          </div>
        </div>

        {/* Edit FAQ Modal */}
        {editingFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">แก้ไข FAQ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">คำถาม</label>
                  <Input
                    value={editingFAQ.question}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">คำตอบ</label>
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
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                  <Button 
                    onClick={() => setEditingFAQ(null)}
                    variant="outline"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">รายการ FAQ ({faqs.length})</h2>
          </div>
          <div className="divide-y">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm mb-2">{faq.answer}</p>
                    <p className="text-xs text-gray-400">
                      สร้างเมื่อ: {new Date(faq.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      onClick={() => setEditingFAQ(faq)}
                      size="sm"
                      variant="outline"
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      onClick={() => handleDeleteFAQ(faq.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                ยังไม่มี FAQ
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
