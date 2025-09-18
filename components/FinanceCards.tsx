"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const monthlyChange = financeData.totalThisMonth - financeData.previousMonth
  const changePercentage = ((monthlyChange / financeData.previousMonth) * 100).toFixed(1)
  const isIncrease = monthlyChange > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo Financeiro
        </CardTitle>
        <CardDescription>
          Custos do mês atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Monthly Cost */}
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${financeData.totalThisMonth}
            </div>
            <div className={`flex items-center justify-center gap-1 text-sm ${
              isIncrease ? 'text-red-600' : 'text-green-600'
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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Custos Fixos</span>
              <span className="font-medium">${financeData.fixedCosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Infraestrutura</span>
              <span className="font-medium">${financeData.infrastructure}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Por Usuário</span>
              <span className="font-medium">${financeData.perUser}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Custo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
