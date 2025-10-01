import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { useRouter } from "next/router";

interface TicketActionsProps {
  ticketId: string;
  status: string;
  onStatusUpdate?: (newStatus: string) => void;
  onTicketDelete?: () => void;
  variant?: 'list' | 'detail';
  showViewDetail?: boolean;
}

export default function TicketActions({
  ticketId,
  status,
  onStatusUpdate,
  onTicketDelete,
  variant = 'list',
  showViewDetail = true
}: TicketActionsProps) {
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/ticket/tickets?id=${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onStatusUpdate?.(newStatus);
        console.log(`✅ Ticket ${newStatus}`);
      }
    } catch (error) {
      console.error(`Error updating ticket to ${newStatus}:`, error);
    }
  };

  const handleDeleteTicket = async () => {
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/ticket/tickets?id=${ticketId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('✅ Ticket deleted');
          onTicketDelete?.();
          if (variant === 'detail') {
            router.push('/admin/ticket');
          }
        }
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleViewDetail = () => {
    router.push(`/admin/ticket/${ticketId}`);
  };

  const buttonSize = variant === 'list' ? 'sm' : undefined;
  const buttonClassName = variant === 'list' 
    ? 'cursor-pointer' 
    : 'px-4 py-2';

  return (
    <div className="flex gap-2">
      {/* View Detail Button - แสดงเมื่อ variant = list และ showViewDetail = true */}
      {showViewDetail && variant === 'list' && (
        <Button
          onClick={handleViewDetail}
          size={buttonSize}
          variant="outline"
          className={`border-orange-500 text-orange-500 hover:bg-orange-50 ${buttonClassName}`}
        >
          View Detail
        </Button>
      )}

      {/* Accept Button - แสดงเมื่อ status = open */}
      {status === 'open' && (
        <Button
          onClick={() => handleUpdateStatus('in_progress')}
          size={buttonSize}
          className={`bg-orange-600 hover:bg-orange-700 text-white ${buttonClassName}`}
        >
          {variant === 'list' ? 'Accept' : 'Accept Ticket'}
        </Button>
      )}

      {/* Solve Button - แสดงเมื่อ status = in_progress */}
      {status === 'in_progress' && (
        <Button
          onClick={() => handleUpdateStatus('solved')}
          size={buttonSize}
          className={`bg-orange-500 hover:bg-orange-600 text-white ${buttonClassName}`}
        >
          {variant === 'list' ? 'Solved' : 'Solve Ticket'}
        </Button>
      )}

      {/* Delete Button - แสดงเมื่อ status = solved */}
      {status === 'solved' && (
        <Button
          onClick={handleDeleteTicket}
          size={buttonSize}
          className={`bg-orange-700 hover:bg-orange-800 text-white ${buttonClassName}`}
        >
          {variant === 'list' ? 'Delete' : 'Delete Ticket'}
        </Button>
      )}

      {/* Back to Tickets Button - แสดงเมื่อ variant = detail */}
      {variant === 'detail' && (
        <Button 
          onClick={() => router.push('/admin/ticket')} 
          variant="outline"
          className="border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          Back to Tickets
        </Button>
      )}
    </div>
  );
}
