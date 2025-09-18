"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface FinanceData {
  fixedCosts: number
  infrastructure: number
  perUser: number
  totalThisMonth: number
  previousMonth: number
}

export function FinanceCards() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - will be replaced with real API
    const mockData: FinanceData = {
      fixedCosts: 89, // Cursor + ChatGPT + Vercel
      infrastructure: 23, // Firebase/Supabase
      perUser: 15, // Per user costs
      totalThisMonth: 127,
      previousMonth: 104
    }
    
    setTimeout(() => {
      setFinanceData(mockData)
      setLoading(false)
    }, 800)
  }, [])

  if (loading || !financeData) {
    return (
      <div className="modern-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 gradient-accent rounded-xl">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Resumo Financeiro
            </h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const monthlyChange = financeData.totalThisMonth - financeData.previousMonth
  const changePercentage = ((monthlyChange / financeData.previousMonth) * 100).toFixed(1)
  const isIncrease = monthlyChange > 0

  return (
    <div className="modern-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 gradient-accent rounded-xl">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Resumo Financeiro
          </h3>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Custos do mês atual
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Total Monthly Cost */}
        <div className="text-center p-6 gradient-accent rounded-xl text-white">
          <div className="text-3xl font-bold mb-2">
            ${financeData.totalThisMonth}
          </div>
          <div className={`flex items-center justify-center gap-2 text-sm ${
            isIncrease ? 'text-white/90' : 'text-white/90'
          }`}>
            {isIncrease ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {isIncrease ? '+' : ''}{changePercentage}% vs mês anterior
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Custos Fixos</span>
            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>${financeData.fixedCosts}</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Infraestrutura</span>
            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>${financeData.infrastructure}</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Por Usuário</span>
            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>${financeData.perUser}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Custo
        </Button>
      </div>
    </div>
  )
}
