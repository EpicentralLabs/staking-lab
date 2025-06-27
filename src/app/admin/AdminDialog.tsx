import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmClassName = '',
  cancelClassName = ''
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  title: string,
  description: string,
  onConfirm: () => void,
  onCancel: () => void,
  confirmText: string,
  cancelText: string,
  confirmClassName?: string,
  cancelClassName?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className={cancelClassName || "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={confirmClassName || "bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 