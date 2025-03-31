import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // Trigger is usually handled outside this component
} from "./ui/alert-dialog" // Use the shadcn AlertDialog
import { Button } from "./ui/button"; // Use shadcn Button

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmVariant?: 'default' | 'destructive'; // Optional variant for confirm button
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmVariant = 'destructive', // Default to destructive for confirmation dialogs
}) => {
  // We control the open state via the isOpen prop passed in
  // The onOpenChange handler calls onCancel when closed via overlay click or Escape key

  return (
    <AlertDialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}> 
      <AlertDialogContent> {/* AlertDialogContent handles overlay and centering */} 
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction 
            asChild // Use Button component styles
            onClick={onConfirm} 
            disabled={isLoading}
          >
             {/* Apply the specified variant (default or destructive) */}
            <Button variant={confirmVariant} disabled={isLoading}>
              {isLoading ? 'Processing...' : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog; 