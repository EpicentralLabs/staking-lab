'use client'

import { 
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Chip,
} from '@heroui/react'
import { ArrowDownRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useMouseGlow } from '@/hooks/useMouseGlow'

interface UnstakeModalProps {
  isOpen: boolean
  onOpenChange: () => void
  stakedAmount: number
  onUnstake: (amount: string) => Promise<void>
  isProcessing?: boolean
  isRefetching?: boolean
}

export function UnstakeModal({ 
  isOpen, 
  onOpenChange, 
  stakedAmount,
  onUnstake,
  isProcessing = false,
  isRefetching = false
}: UnstakeModalProps) {
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [unstakeError, setUnstakeError] = useState('')
  const modalContentRef = useMouseGlow()

  // Helper to format numbers with commas
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const [intPart, decPart] = value.replace(/,/g, '').split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString();
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  // Input validation
  const validateUnstakeAmount = (amount: string) => {
    const numAmount = Number.parseFloat(amount.replace(/,/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount"
    }
    if (numAmount > stakedAmount) {
      return `Insufficient staked amount. Staked: ${stakedAmount.toFixed(2)} LABS`
    }
    return ""
  };

  // Handle amount change with validation
  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/,/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setUnstakeAmount(rawValue);
      if (rawValue) {
        setUnstakeError(validateUnstakeAmount(rawValue));
      } else {
        setUnstakeError('');
      }
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0) return;
    
    const error = validateUnstakeAmount(unstakeAmount);
    if (error) {
      setUnstakeError(error);
      return;
    }

    await onUnstake(unstakeAmount);
    setUnstakeAmount('');
    setUnstakeError('');
  };

  const handleModalClose = () => {
    setUnstakeAmount('');
    setUnstakeError('');
    onOpenChange();
  };

  const handleMaxClick = () => {
    setUnstakeAmount(stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setUnstakeError('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={handleModalClose}
      size="lg"
      backdrop="blur"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }
          },
          exit: {
            y: -20,
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: [0.4, 0, 1, 1]
            }
          }
        }
      }}
      classNames={{
        base: "bg-transparent",
        wrapper: "items-center justify-center p-4",
        body: "p-0"
      }}
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <div ref={modalContentRef}>
        <ModalContent 
          className="border border-gray-700/40 backdrop-blur-lg max-h-[90vh] overflow-hidden relative transition-all duration-300 ease-out rounded-2xl"
          style={{
            background: `
              radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(251, 146, 60, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                rgba(249, 115, 22, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                rgba(251, 146, 60, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                transparent 75%
              ),
              linear-gradient(to bottom right, 
                rgb(15 23 42 / 0.9), 
                rgb(30 41 59 / 0.8), 
                rgb(51 65 85 / 0.7)
              )
            `,
            transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
          }}
        >
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-white/5 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center border border-orange-400/20">
                  <ArrowDownRight className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white/95">
                    Unstake Tokens
                  </h2>
                  <p className="text-sm text-white/60">
                    Withdraw your staked LABS tokens
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-8 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Unstake Input Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-base font-medium text-white/80">Amount to Unstake</label>
                    <Input
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="Enter amount to unstake"
                      value={formatWithCommas(unstakeAmount)}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      size="lg"
                      endContent={
                        <Chip size="sm" variant="flat" className="bg-orange-400/10 text-orange-400 border-orange-400/20">
                          LABS
                        </Chip>
                      }
                      classNames={{
                        base: "max-w-full",
                        label: "text-white/80 text-base",
                        input: "text-white/95 text-lg font-medium",
                        inputWrapper: "bg-white/5 border-white/10 hover:border-white/20 data-[hover=true]:bg-white/8 data-[focus=true]:!bg-white/8 data-[focus-visible=true]:!bg-white/8 focus:!bg-white/8 data-[focus=true]:!border-orange-400/40 data-[focus-visible=true]:!border-orange-400/40 focus:!border-orange-400/40 h-14 rounded-xl"
                      }}
                      isInvalid={!!unstakeError}
                      errorMessage={unstakeError}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Staked Balance:</span>
                    <div className="flex items-center gap-2">
                      {isRefetching && (
                        <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white/95 border border-white/10 hover:border-white/20 transition-all duration-200 rounded-lg h-8"
                        onClick={handleMaxClick}
                      >
                        {stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="p-6 rounded-xl bg-gray-950/40 border border-white/5 space-y-3">
                  <h4 className="text-base font-medium text-white/90 mb-4">Transaction Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">You&apos;re unstaking:</span>
                      <span className="text-white/95 font-medium">
                        {unstakeAmount ? `${formatWithCommas(unstakeAmount)} LABS` : '0 LABS'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Remaining staked:</span>
                      <span className="text-white/95 font-medium">
                        {unstakeAmount ? 
                          `${Math.max(0, stakedAmount - Number.parseFloat(unstakeAmount.replace(/,/g, '') || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS` 
                          : `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Section */}
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-400/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-400/20 flex items-center justify-center mt-0.5">
                      <span className="text-orange-400 text-xs">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-orange-400/90 text-sm font-medium mb-1">Important Notice</p>
                      <p className="text-orange-400/70 text-xs leading-relaxed">
                        Unstaking will immediately stop earning rewards on the withdrawn amount. Make sure this is what you want to do.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ModalBody>

            <ModalFooter className="border-t border-white/5 px-8 py-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Unstake Transaction</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="flat"
                    size="lg"
                    onPress={onClose}
                    className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white/95 border border-white/10 hover:border-white/20 transition-all duration-200 rounded-xl px-6 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className={cn(
                      "font-semibold transition-all duration-300 rounded-xl px-8 h-12 min-w-[120px]",
                      (!isProcessing && unstakeAmount && !unstakeError && Number.parseFloat(unstakeAmount.replace(/,/g, '')) > 0)
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.02]"
                        : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                    )}
                    isDisabled={
                      isProcessing ||
                      !unstakeAmount ||
                      !!unstakeError ||
                      Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0
                    }
                    isLoading={isProcessing}
                    onPress={handleUnstake}
                  >
                    {isProcessing ? "Unstaking..." : "Confirm Unstake"}
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
      </div>
    </Modal>
  )
}
