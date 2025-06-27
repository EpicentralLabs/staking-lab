import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export function AdminNotification({ type, text, show, onClose }: {
  type: 'success' | 'error',
  text: string,
  show: boolean,
  onClose: () => void
}) {
  return (
    <Transition
      show={show}
      as="div"
      className="mb-4"
      enter="transition-all duration-300 ease-out"
      enterFrom="max-h-0 opacity-0"
      enterTo="max-h-40 opacity-100"
      leave="transition-all duration-300 ease-in"
      leaveFrom="max-h-40 opacity-100"
      leaveTo="max-h-0 opacity-0"
      afterLeave={onClose}
    >
      <div
        className={`p-4 rounded-lg flex items-center space-x-3 text-white border ${type === 'success'
          ? 'bg-green-900/50 border-green-500/50'
          : 'bg-red-900/50 border-red-500/50'
          }`}
      >
        {type === 'success' ? (
          <CheckCircleIcon className="h-6 w-6 text-green-400" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-red-400" />
        )}
        <span>{text}</span>
      </div>
    </Transition>
  )
} 