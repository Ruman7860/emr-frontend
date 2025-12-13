'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

interface CollectPaymentModalProps {
  open: boolean;
  onClose: () => void;
  registrationFee: number;

  // 👇 server action passed from parent
  onConfirm: (data: {
    amount: number;
    paymentMode: 'CASH' | 'UPI' | 'CARD';
    markPaid: boolean;
  }) => Promise<void>;
}

export default function CollectPaymentModal({
  open,
  onClose,
  registrationFee,
  onConfirm,
}: CollectPaymentModalProps) {
  const [amount, setAmount] = useState(registrationFee);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [markPaid, setMarkPaid] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm({ amount, paymentMode, markPaid });
      toast.success("Payment collected!");
      onClose();
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <Select value={paymentMode} onValueChange={v => setPaymentMode(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox checked={markPaid} onCheckedChange={(v) => setMarkPaid(!!v)} />
            <span className="text-sm">Mark as Paid</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
