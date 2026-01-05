"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import AddCustomerBtn from "@/components/AddCustomerBtn"
import CustomerList from "@/components/CustomerList"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const [stats, setStats] = useState({
    collectibles: 0,
    activeCustomers: 0
  })

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    async function getDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push("/login")
          return
        }

        setUserEmail(user.email ?? null)

        const [customersResponse, transactionsResponse] = await Promise.all([
           supabase.from('customers').select('*', { count: 'exact', head: true }),
           supabase.from('transactions').select('type, amount')
        ])

        const customerCount = customersResponse.count || 0

        const transactions = transactionsResponse.data || []
        const totalCollectibles = transactions.reduce((acc, curr) => {
            if (curr.type === 'UTANG') return acc + curr.amount
            if (curr.type === 'BAYAD') return acc - curr.amount
            return acc
        }, 0)

        setStats({
            activeCustomers: customerCount,
            collectibles: totalCollectibles
        })

      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    getDashboardData()
  }, [router, refreshTrigger])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // 3. UPDATED LOADING STATE: Gamit ang Skeleton
  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Fake Header */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </header>
            <main className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Fake Title & Button */}
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                {/* Fake Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                {/* Fake List */}
                <Skeleton className="h-64 w-full rounded-xl" />
            </main>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Listahan App
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">
            {userEmail}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h2>
          <AddCustomerBtn onSuccess={handleRefresh} />
        </div>

        <div className="grid gap-4 md:grid-cols-2"> 
          
          {/* 4. UPDATED CARD: Gamit na ang Wallet Icon */}
          <Card className={stats.collectibles > 0 ? "border-l-4 border-l-orange-500 shadow-sm" : "shadow-sm"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Collectibles</CardTitle>
              {/* Dito natin pinalit yung Wallet icon */}
              <Wallet className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.collectibles > 0 ? "text-orange-600" : "text-slate-900"}`}>
                ₱ {stats.collectibles.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.collectibles > 0 
                    ? "Kabuuang pautang na nasa labas pa." 
                    : "Walang utang ang mga suki!"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
              <User className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.activeCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered suki count
              </p>
            </CardContent>
          </Card>

        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-slate-700">My Customers</h3>
          <CustomerList refreshTrigger={refreshTrigger} />
        </div>

      </main>
    </div>
  )
}