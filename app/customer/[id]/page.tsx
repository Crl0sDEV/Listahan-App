"use client"

import { useEffect, useState, useCallback } from "react" // Add useCallback
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"

import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

// Import our new component
import AddTransactionBtn from "@/components/AddTransactionBtn"

type Customer = Database['public']['Tables']['customers']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Ginawa nating function para pwede tawagin ulit (Refresh)
  const fetchData = useCallback(async () => {
      // Fetch Customer
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single()

      // Fetch Transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false })

      if (customerData) setCustomer(customerData)
      if (transData) setTransactions(transData)
      
      setLoading(false)
  }, [id])

  useEffect(() => {
        if (id) fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [id])

  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.type === 'UTANG') return acc + curr.amount
    if (curr.type === 'BAYAD') return acc - curr.amount
    return acc
  }, 0)

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" /> {/* Back Button */}
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" /> {/* Name */}
                        <Skeleton className="h-4 w-24" /> {/* Phone */}
                    </div>
                </div>
                <Skeleton className="h-32 w-full rounded-xl" /> {/* Balance Card */}
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" /> {/* Table Header */}
                    <Skeleton className="h-10 w-full" /> {/* Rows */}
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer?.name}</h1>
            <p className="text-slate-500 text-sm">
              {customer?.phone_number || "No contact info"}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <Card
          className={
            totalBalance > 0 ? "border-red-500 border-2" : "border-green-500"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Current Balance (Utang)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-bold ${
                totalBalance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ₱ {totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalBalance > 0 ? "Need singilin!" : "Goods, walang utang."}
            </p>
          </CardContent>
        </Card>

        {/* 2. Action Buttons (Replaced Placeholders) */}
        <div className="grid grid-cols-2 gap-4">
          {/* UTANG BUTTON */}
          <AddTransactionBtn
            customerId={id}
            type="UTANG"
            onSuccess={fetchData} // I-refresh ang data pagtapos mag save
          />

          {/* BAYAD BUTTON */}
          <AddTransactionBtn
            customerId={id}
            type="BAYAD"
            onSuccess={fetchData} // I-refresh ang data pagtapos mag save
          />
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-md border">
          {/* ... Keep the same table code from previous step ... */}
          <div className="p-4 border-b font-medium">Transaction History</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-slate-500"
                  >
                    Wala pang transactions. Clean record!
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs text-slate-500">
                      {t.created_at
                        ? format(new Date(t.created_at), "MMM d, h:mm a")
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.type === "UTANG" ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium text-sm">
                          {t.description || t.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        t.type === "UTANG" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {t.type === "UTANG" ? "+" : "-"} ₱
                      {t.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}