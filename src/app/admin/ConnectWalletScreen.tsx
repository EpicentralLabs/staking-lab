import { FlowingBackground } from '@/components/flowing-background'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export function ConnectWalletScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white flex flex-col">
      <FlowingBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <p>Please connect your wallet to access the admin panel.</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
} 