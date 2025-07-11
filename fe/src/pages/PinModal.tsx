import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function PinModal({ isOpen, onClose, onSubmit }: PinModalProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit();
      setPin("");
      onClose();
    }
  }, [pin]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận mã PIN</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <OtpInput
            value={pin}
            onChange={setPin}
            numInputs={4}
            inputType="text"
            shouldAutoFocus
            containerStyle="flex justify-center gap-4"
            inputStyle={{ width: "3rem", height: "3rem" }}
            renderInput={(props) => (
              <input
                {...props}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-20 h-20 aspect-square text-center border border-gray-300 rounded text-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          />
        </div>

        <div className="text-center mt-2 text-sm text-gray-500">
          Nhập đủ 4 số để tự động xác nhận
        </div>
      </DialogContent>
    </Dialog>
  );
}
