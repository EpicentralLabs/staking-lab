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
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useMouseGlow } from '@/hooks/useMouseGlow'

interface StakeModalProps {
  isOpen: boolean
  onOpenChange: () => void
  availableBalance: number
  onStake: (amount: string) => Promise<void>
  isProcessing?: boolean
  isRefetching?: boolean
}

export function StakeModal({ 
  isOpen, 
  onOpenChange, 
  availableBalance,
  onStake,
  isProcessing = false,
  isRefetching = false
}: StakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState('')
  const [stakeError, setStakeError] = useState('')
  const modalContentRef = useMouseGlow()

  // Helper function to format numbers intelligently
  const formatNumber = (value: number): string => {
    // If the number is a whole number, show it without decimals
    if (value % 1 === 0) {
      return value.toLocaleString("en-US");
    }
    
    // Otherwise, show up to 4 decimal places, removing trailing zeros
    const formatted = value.toLocaleString("en-US", { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 4 
    });
    
    return formatted;
  };

  // Helper to format numbers with commas
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const [intPart, decPart] = value.replace(/[^\d.\-]/g, '').split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString("en-US");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  // Input validation
  const validateStakeAmount = (amount: string) => {
    const numAmount = Number.parseFloat(amount.replace(/[^\d.\-]/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount"
    }
    if (numAmount > availableBalance) {
      return `Insufficient balance. Available: ${formatNumber(availableBalance)} LABS`
    }
    return ""
  };

  // Handle amount change with validation
  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/[^\d.\-]/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setStakeAmount(rawValue);
      if (rawValue) {
        setStakeError(validateStakeAmount(rawValue));
      } else {
        setStakeError('');
      }
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount.replace(/[^\d.\-]/g, '')) <= 0) return;
    
    const error = validateStakeAmount(stakeAmount);
    if (error) {
      setStakeError(error);
      return;
    }

    await onStake(stakeAmount);
    setStakeAmount('');
    setStakeError('');
  };

  const handleModalClose = () => {
    setStakeAmount('');
    setStakeError('');
    onOpenChange();
  };

  const handleMaxClick = () => {
    setStakeAmount(availableBalance.toString());
    setStakeError('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={handleModalClose}
      size="md"
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
          className="border border-gray-700/30 backdrop-blur-xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden relative transition-all duration-300 ease-out rounded-xl max-w-md mx-auto m-4 sm:m-0"
          style={{
            background: `
              linear-gradient(to bottom right, 
                rgb(15 23 42 / 0.95), 
                rgb(30 41 59 / 0.9), 
                rgb(51 65 85 / 0.85)
              )
            `
          }}
        >
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4a85ff]/10 flex items-center justify-center border border-[#4a85ff]/20">
                  <ArrowUpRight className="w-4 h-4 text-[#4a85ff]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white/95">
                    Stake Tokens
                  </h2>
                  <p className="text-xs text-white/60">
                    Deposit LABS tokens to start earning rewards
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Stake Input Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-base font-medium text-white/80">Amount to Stake</label>
                    <Input
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="Enter amount to stake"
                      value={formatWithCommas(stakeAmount)}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      size="lg"
                      endContent={
                        <Chip size="sm" variant="flat" className="bg-[#4a85ff]/10 text-[#4a85ff] border-[#4a85ff]/20">
                          LABS
                        </Chip>
                      }
                      classNames={{
                        base: "max-w-full",
                        label: "text-white/80 text-base",
                        input: "text-white/95 text-lg font-medium placeholder:font-normal",
                        inputWrapper: "bg-white/5 border-white/10 hover:border-white/20 data-[hover=true]:bg-white/8 data-[focus=true]:!bg-white/8 data-[focus-visible=true]:!bg-white/8 focus:!bg-white/8 data-[focus=true]:!border-[#4a85ff]/40 data-[focus-visible=true]:!border-[#4a85ff]/40 focus:!border-[#4a85ff]/40 h-14 rounded-xl"
                      }}
                      isInvalid={!!stakeError}
                      errorMessage={stakeError}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Available Balance:</span>
                    <div className="flex items-center gap-2">
                      {isRefetching && (
                        <Loader2 className="w-4 h-4 text-[#4a85ff] animate-spin" />
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white/95 border border-white/10 hover:border-white/20 transition-all duration-200 rounded-lg h-8"
                        onClick={handleMaxClick}
                      >
                        {formatNumber(availableBalance)} LABS
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="p-4 sm:p-6 rounded-xl bg-gray-950/40 border border-white/5 space-y-3">
                  <h4 className="text-base font-medium text-white/90 mb-4">Transaction Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">You&apos;re staking:</span>
                      <span className="text-white/95 font-medium">
                        {stakeAmount ? `${formatWithCommas(stakeAmount)} LABS` : '0 LABS'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Remaining balance:</span>
                      <span className="text-white/95 font-medium">
                        {stakeAmount ? 
                          `${formatNumber(Math.max(0, availableBalance - Number.parseFloat(stakeAmount.replace(/[^\d.\-]/g, '') || '0')))} LABS` 
                          : `${formatNumber(availableBalance)} LABS`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ModalBody>

            <ModalFooter className="border-t border-white/10 px-4 sm:px-6 py-4">
              <div className="flex gap-3 w-full">
                <Button
                  variant="flat"
                  size="lg"
                  onPress={onClose}
                  className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white/95 border border-white/10 hover:border-white/20 transition-all duration-200 rounded-xl px-4 sm:px-6 h-12 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "font-semibold transition-all duration-300 rounded-xl px-4 sm:px-8 h-12 min-w-[120px] flex-1 sm:flex-none",
                    (!isProcessing && stakeAmount && !stakeError && Number.parseFloat(stakeAmount.replace(/[^\d.\-]/g, '')) > 0)
                      ? "bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] text-white shadow-xl shadow-[#4a85ff]/40 hover:shadow-[#4a85ff]/60 hover:scale-[1.02]"
                      : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                  )}
                  isDisabled={
                    isProcessing ||
                    !stakeAmount ||
                    !!stakeError ||
                    Number.parseFloat(stakeAmount.replace(/[^\d.\-]/g, '')) <= 0
                  }
                  isLoading={isProcessing}
                  onPress={handleStake}
                >
                  {isProcessing ? "Staking..." : "Confirm Stake"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
      </div>
    </Modal>
  )
}
