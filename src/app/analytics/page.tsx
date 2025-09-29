"use client"

import { motion } from "framer-motion"
import { EChartLabsStaked } from "@/components/charts/echart-labs-staked"
import { EChartXLabsData } from "@/components/charts/echart-xlabs-data"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex-1 max-w-7xl"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="text-center py-6 sm:py-8 md:py-12 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-8 right-16 w-20 h-20 rounded-full bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 blur-sm animate-pulse"></div>
        <div className="absolute top-20 right-32 w-12 h-12 rounded-full bg-gradient-to-br from-[#4AFFBA]/20 to-[#2dd4aa]/20 blur-sm animate-pulse delay-300"></div>
        <div className="absolute top-12 right-48 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 blur-sm animate-pulse delay-700"></div>
        
        <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 flex items-center justify-center border border-[#4a85ff]/30">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#4a85ff]" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
          Analytics Dashboard
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
          Track LABS staking activity and xLABS rewards distribution with comprehensive charts and analytics.
        </p>
      </motion.div>

      {/* Charts Section - Side by Side */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto mb-8 sm:mb-12 px-2 sm:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* LABS Staking Chart */}
          <div className="w-full">
            <EChartLabsStaked className="h-full" />
          </div>

          {/* xLABS Rewards Chart */}
          <div className="w-full">
            <EChartXLabsData className="h-full" />
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
