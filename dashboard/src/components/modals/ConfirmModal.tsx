import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Trash2, CheckCircle2 } from "lucide-react";

type ModalVariant = "delete" | "warning" | "info" | "success";

interface ConfirmModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
  header: string;
  description?: string;
  variant?: ModalVariant;
}

const variantStyles = {
  delete: {
    title: "text-red-600",
    description: "text-red-500",
    confirmButton: "bg-red-600 hover:bg-red-700",
    icon: Trash2,
  },
  warning: {
    title: "text-yellow-600",
    description: "text-yellow-500",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700",
    icon: AlertTriangle,
  },
  info: {
    title: "text-blue-600",
    description: "text-blue-500",
    confirmButton: "bg-blue-600 hover:bg-blue-700",
    icon: Info,
  },
  success: {
    title: "text-green-600",
    description: "text-green-500",
    confirmButton: "bg-green-600 hover:bg-green-700",
    icon: CheckCircle2,
  },
};

export const ConfirmModal = ({
  children,
  onConfirm,
  disabled,
  header,
  description,
  variant = "info",
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4">
            <Icon className={cn("h-12 w-12", styles.title)} />
          </div>
          <AlertDialogTitle
            className={cn("text-center text-2xl", styles.title)}
          >
            {header}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn("text-balance text-center", styles.description)}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            onClick={handleConfirm}
            className={styles.confirmButton}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
