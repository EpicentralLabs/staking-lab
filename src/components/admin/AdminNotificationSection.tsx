interface AdminNotificationSectionProps {
  type: 'success' | 'error';
  text: string;
  show: boolean;
  onClose: () => void;
}

export function AdminNotificationSection({
  type,
  text,
  show,
  onClose
}: AdminNotificationSectionProps) {
  if (!show) return null;

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className={`p-4 rounded-lg border-l-4 ${
        type === 'success' 
          ? 'bg-green-900/20 border-green-500 text-green-100' 
          : 'bg-red-900/20 border-red-500 text-red-100'
      }`}>
        <div className="flex items-center justify-between">
          <p className="text-sm">{text}</p>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}