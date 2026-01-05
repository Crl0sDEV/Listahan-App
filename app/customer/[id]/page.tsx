"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, MoreHorizontal, Trash } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const fetchData = useCallback(async () => {
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single()

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
  }, [id, fetchData])

  async function handleDelete(transactionId: string) {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId)

        if (error) throw error

        toast.success("Transaction deleted")
        fetchData() 

    } catch (error) {
        toast.error("Error deleting transaction")
        console.error(error)
    }
  }

  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.type === 'UTANG') return acc + curr.amount
    if (curr.type === 'BAYAD') return acc - curr.amount
    return acc
  }, 0)

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                 <Skeleton className="h-10 w-40 mb-4" />
                 <Skeleton className="h-32 w-full rounded-xl" />
                 <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer?.name}</h1>
            <p className="text-slate-500 text-sm">{customer?.phone_number || "No contact info"}</p>
          </div>
        </div>

        <Card className={totalBalance > 0 ? "border-l-4 border-l-red-500 shadow-sm" : "border-l-4 border-l-green-500 shadow-sm"}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                    Current Balance (Utang)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-4xl font-bold ${totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₱ {totalBalance.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    {totalBalance > 0 ? "Need singilin!" : "Goods, walang utang."}
                </p>
            </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
            <AddTransactionBtn 
                customerId={id} 
                type="UTANG" 
                onSuccess={fetchData} 
            />
            <AddTransactionBtn 
                customerId={id} 
                type="BAYAD" 
                onSuccess={fetchData} 
            />
        </div>

        <div className="bg-white rounded-md border shadow-sm">
            <div className="p-4 border-b font-medium bg-slate-50/50">Transaction History</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {/* TINANGGAL KO COMMENTS DITO PARA DI MAG ERROR */}
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-12.5"></TableHead> 
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-slate-500">
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
                                        {t.type === 'UTANG' ? (
                                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                        )}
                                        <span className="font-medium text-sm text-slate-700">{t.description || t.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right font-bold ${t.type === 'UTANG' ? 'text-red-600' : 'text-green-600'}`}>
                                    {t.type === 'UTANG' ? '+' : '-'} ₱{t.amount.toLocaleString()}
                                </TableCell>
                                
                                {/* TINANGGAL KO COMMENTS DITO RIN */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                onClick={() => handleDelete(t.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete Transaction
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

      </div>
    </div>
  )
}