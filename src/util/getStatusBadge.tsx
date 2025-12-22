import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
  switch (status) {
    // ---- Patient / General Status ----
    case 'ACTIVE':
      return (
        <Badge className="bg-green-100 text-green-800">
          Active
        </Badge>
      );

    case 'INACTIVE':
      return (
        <Badge variant="destructive">
          Inactive
        </Badge>
      );

    // ---- Visit Status ----
    case 'PENDING_PAYMENT':
      return (
        <Badge className="bg-orange-100 text-orange-800">
          Pending Payment
        </Badge>
      );

    case 'PAID_WAITING':
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Paid • Waiting
        </Badge>
      );

    case 'IN_CONSULTATION':
      return (
        <Badge className="bg-purple-100 text-purple-800">
          In Consultation
        </Badge>
      );

    case 'COMPLETED':
      return (
        <Badge className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );

    case 'NO_SHOW':
      return (
        <Badge className="bg-gray-200 text-gray-800">
          No Show
        </Badge>
      );

    case 'CANCELLED':
      return (
        <Badge className="bg-red-100 text-red-800">
          Cancelled
        </Badge>
      );

    // ---- Payment Status (for safety) ----
    case 'PAID':
      return (
        <Badge className="bg-green-100 text-green-800">
          Paid
        </Badge>
      );

    case 'UNPAID':
      return (
        <Badge className="bg-orange-100 text-orange-800">
          Unpaid
        </Badge>
      );

    // ---- Fallback ----
    default:
      return (
        <Badge variant="secondary">
          {status || 'Unknown'}
        </Badge>
      );
  }
};