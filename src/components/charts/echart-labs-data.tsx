"use client"

import { useEffect, useRef } from "react"
import { Card, CardBody, CardHeader } from "@heroui/react"
import { motion } from "framer-motion"
import * as echarts from "echarts"
import { useMouseGlow } from "@/hooks/useMouseGlow"
import { TrendingUp } from "lucide-react"

interface LabsStakedDataPoint {
  date: string
  staked: number
  unstaked: number
}

interface LabsStakedChartProps {
  data?: LabsStakedDataPoint[]
  className?: string
  isLoading?: boolean
}

export function EChartLabsStaked({ 
  data = [], 
  className = "",
  isLoading = false 
}: LabsStakedChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const cardRef = useMouseGlow()

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    const chart = echarts.init(chartRef.current, 'dark')
    chartInstanceRef.current = chart

    // Prepare data or show empty state
    const dates = data.length > 0 ? data.map(d => d.date) : []
    const stakedData = data.length > 0 ? data.map(d => d.staked) : []
    const unstakedData = data.length > 0 ? data.map(d => d.unstaked) : []

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(74, 133, 255, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
          fontSize: 12
        },
        formatter: function (params: any) {
          if (!params || params.length === 0) return ''
          
          let result = `<div style="padding: 4px;">
            <div style="margin-bottom: 8px; font-weight: bold;">${params[0].axisValue}</div>`
          
          params.forEach((param: any) => {
            const color = param.color
            const value = Number(param.value).toLocaleString()
            result += `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 8px;"></span>
                <span style="flex: 1;">${param.seriesName}:</span>
                <span style="font-weight: bold; margin-left: 12px;">${value} LABS</span>
              </div>`
          })
          
          result += '</div>'
          return result
        }
      },
      legend: {
        data: ['Staked', 'Unstaked'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12
        },
        itemGap: 20,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisTick: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10,
          formatter: function (value: string) {
            if (!value) return ''
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisTick: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10,
          formatter: function (value: number) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M'
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K'
            }
            return value.toString()
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Staked',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(74, 133, 255, 0.4)' },
                { offset: 0.5, color: 'rgba(74, 133, 255, 0.2)' },
                { offset: 1, color: 'rgba(74, 133, 255, 0.05)' }
              ]
            }
          },
          lineStyle: {
            color: '#4a85ff',
            width: 3,
            shadowColor: 'rgba(74, 133, 255, 0.3)',
            shadowBlur: 10
          },
          itemStyle: {
            color: '#4a85ff',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(74, 133, 255, 0.8)'
            }
          },
          data: stakedData
        },
        {
          name: 'Unstaked',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245, 101, 101, 0.4)' },
                { offset: 0.5, color: 'rgba(245, 101, 101, 0.2)' },
                { offset: 1, color: 'rgba(245, 101, 101, 0.05)' }
              ]
            }
          },
          lineStyle: {
            color: '#f56565',
            width: 2,
            shadowColor: 'rgba(245, 101, 101, 0.3)',
            shadowBlur: 8
          },
          itemStyle: {
            color: '#f56565',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(245, 101, 101, 0.8)'
            }
          },
          data: unstakedData
        }
      ]
    }

    // Show loading or empty state
    if (isLoading) {
      chart.showLoading('default', {
        text: 'Loading...',
        color: '#4a85ff',
        textColor: '#ffffff',
        maskColor: 'rgba(0, 0, 0, 0.3)',
        zlevel: 0
      })
    } else {
      chart.hideLoading()
      chart.setOption(option)
    }

    // Handle resize
    const handleResize = () => {
      chart.resize()
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chartInstanceRef.current = null
    }
  }, [data, isLoading])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card
        ref={cardRef}
        className="bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-800/40 border border-slate-700/30 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
        style={{
          background: `
            radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(74, 133, 255, calc(0.1 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
              rgba(88, 80, 236, calc(0.05 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
              rgba(74, 133, 255, calc(0.02 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
              transparent 75%
            ),
            linear-gradient(to bottom right, 
              rgb(2 6 23 / 0.8), 
              rgb(15 23 42 / 0.6), 
              rgb(30 41 59 / 0.4)
            )
          `,
          transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 flex items-center justify-center border border-[#4a85ff]/30">
              <TrendingUp className="w-4 h-4 text-[#4a85ff]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white/95">LABS Staking Activity</h3>
              <p className="text-sm text-white/60">Daily staked and unstaked amounts over time</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <div 
            ref={chartRef} 
            className="w-full h-[300px] sm:h-[350px] md:h-[400px]"
            style={{ minHeight: '300px' }}
          />
          {!isLoading && data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No LABS staking data available</p>
                <p className="text-xs mt-1">Data will appear once staking activity is tracked</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  )
}
