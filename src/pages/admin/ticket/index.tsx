import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import TicketActions from "@/components/admin/TicketActions";

interface Ticket {
  id: string;
  session_id: string;
  user_message: string;
  status: string;
  created_at: string;
  closed_at?: string;
}

export default function TicketAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ticket/tickets");
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter((ticket) => {
    let matchesStatus = false;
    if (filterStatus === "all") {
      matchesStatus = true;
    } else if (filterStatus === "solved") {
      matchesStatus = ticket.status === "solved";
    } else {
      matchesStatus = ticket.status === filterStatus;
    }

    const matchesSearch =
      searchTerm === "" ||
      ticket.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "solved":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Pending";
      case "in_progress":
        return "Accepted";
      case "solved":
        return "Solved";
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 flex-1" style={{ minHeight: "100vh" }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="w-full px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Support Tickets
            </h1>
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
                    className="w-full hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilterStatus("all")}
                    variant={filterStatus === "all" ? undefined : "outline"}
                    className={`cursor-pointer ${
                      filterStatus === "all"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "border-orange-500 text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    All ({tickets.length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus("open")}
                    variant={filterStatus === "open" ? undefined : "outline"}
                    className={`cursor-pointer ${
                      filterStatus === "open"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "border-orange-500 text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    Pending ({tickets.filter((t) => t.status === "open").length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus("in_progress")}
                    variant={filterStatus === "in_progress" ? undefined : "outline"}
                    className={`cursor-pointer ${
                      filterStatus === "in_progress"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "border-orange-500 text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    Accepted (
                    {tickets.filter((t) => t.status === "in_progress").length})
                  </Button>
                  <Button
                    onClick={() => setFilterStatus("solved")}
                    variant={filterStatus === "solved" ? undefined : "outline"}
                    className={`cursor-pointer ${
                      filterStatus === "solved"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "border-orange-500 text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    Solved ({tickets.filter((t) => t.status === "solved").length}
                    )
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
                  <div
                    key={ticket.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {getStatusText(ticket.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Session: {ticket.session_id.substring(0, 8)}...
                          </span>
                        </div>

                        <h4 className="font-medium text-gray-900 mb-2">
                          {ticket.user_message.length > 100
                            ? `${ticket.user_message.substring(0, 100)}...`
                            : ticket.user_message}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            Created:{" "}
                            {new Date(ticket.created_at).toLocaleString(
                              "en-US"
                            )}
                          </span>
                          {ticket.closed_at && (
                            <span>
                              Closed:{" "}
                              {new Date(ticket.closed_at).toLocaleString(
                                "en-US"
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <TicketActions
                          ticketId={ticket.id}
                          status={ticket.status}
                          onStatusUpdate={(newStatus) => {
                            setTickets((prev) =>
                              prev.map((t) =>
                                t.id === ticket.id
                                  ? { ...t, status: newStatus }
                                  : t
                              )
                            );
                          }}
                          onTicketDelete={() => {
                            setTickets((prev) =>
                              prev.filter((t) => t.id !== ticket.id)
                            );
                          }}
                          variant="list"
                          showViewDetail={true}
                        />
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
