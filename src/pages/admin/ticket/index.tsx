import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";

interface Ticket {
  id: string;
  session_id: string;
  user_message: string;
  status: string;
  created_at: string;
  closed_at?: string;
}

export default function TicketAdmin() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ticket/tickets');
        const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ticket/tickets?id=${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ticket/tickets?id=${ticketId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      ticket.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 flex-1" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="w-full px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          </div>
        </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Filters and Search */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by message or session ID..."
                    className="w-full"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilterStatus('all')}
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    All ({tickets.length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus('open')}
                    variant={filterStatus === 'open' ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    Open ({tickets.filter(t => t.status === 'open').length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus('in_progress')}
                    variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    In Progress ({tickets.filter(t => t.status === 'in_progress').length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus('closed')}
                    variant={filterStatus === 'closed' ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    Closed ({tickets.filter(t => t.status === 'closed').length})
                  </Button>
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Tickets ({filteredTickets.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Session: {ticket.session_id.substring(0, 8)}...
                          </span>
          </div>

                        <h4 className="font-medium text-gray-900 mb-2">
                          {ticket.user_message.length > 100 
                            ? `${ticket.user_message.substring(0, 100)}...` 
                            : ticket.user_message
                          }
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            Created: {new Date(ticket.created_at).toLocaleString('en-US')}
                          </span>
                          {ticket.closed_at && (
                            <span>
                              Closed: {new Date(ticket.closed_at).toLocaleString('en-US')}
                            </span>
                          )}
                  </div>
                </div>
                      
                      <div className="flex gap-2 ml-4">
                        {/* 1. Accept Ticket - แสดงเฉพาะเมื่อ status = open */}
                        {ticket.status === 'open' && (
                          <Button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 cursor-pointer"
                          >
                            Accept Ticket
                          </Button>
                        )}
                        
                        {/* 2. View Detail - แสดงทุก status */}
                        <Button
                          onClick={() => router.push(`/admin/ticket/${ticket.id}`)}
                          size="sm"
                          variant="outline"
                          className="text-purple-600 hover:text-purple-700 cursor-pointer"
                        >
                          View Detail
                        </Button>
                        
                        {/* 3. Solved - แสดงเฉพาะเมื่อ status = in_progress */}
                        {ticket.status === 'in_progress' && (
                          <Button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Solved
                          </Button>
                        )}
                        
                        {/* Delete - แสดงเฉพาะเมื่อ status = closed */}
                        {ticket.status === 'closed' && (
                          <Button 
                            onClick={() => handleDeleteTicket(ticket.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No tickets found
                  </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </Layout>
  );
}
