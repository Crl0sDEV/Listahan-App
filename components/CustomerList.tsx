"use client"

import { useEffect, useState, useCallback } from "react"
import { format } from "date-fns"
import { User, Search, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
    refreshTrigger: number
  }

export default function CustomerList({ refreshTrigger }: Props) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("") // 1. State para sa Search box

  // 2. Fetch Function na tumatanggap ng query
  const fetchCustomers = useCallback(async (query: string = "") => {
    setLoading(true)
    try {
      let request = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      // 3. Filter Logic: Kung may tinype, search sa database using ILIKE
      if (query.trim().length > 0) {
        request = request.ilike('name', `%${query}%`) // %query% means "contains"
      }

      const { data, error } = await request

      if (error) throw error
      if (data) setCustomers(data)
        
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 4. DEBOUNCE EFFECT
  useEffect(() => {
    // Gumawa ng timer
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery)
    }, 500) // Maghintay ng 500ms (kalahating segundo) bago mag search

    // Cleanup function: Kapag nag-type ulit si user bago matapos ang 500ms,
    // icancel ang dating timer at gumawa ng bago.
    return () => clearTimeout(timer)
  }, [searchQuery, fetchCustomers, refreshTrigger])

  return (
    <div className="space-y-4">
      {/* 5. SEARCH BAR SECTION */}
      <div className="relative">
        {loading ? (
            <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 animate-spin" />
        ) : (
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        )}
        
        <Input
          type="search"
          placeholder="Search customer name..."
          className="pl-9 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : customers.length === 0 ? (
        // EMPTY STATE
        <div className="text-center py-10 border rounded-lg bg-white border-dashed">
          <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {searchQuery ? "No customer found." : "Wala pang customers, boss."}
          </p>
          {!searchQuery && (
            <p className="text-xs text-slate-400">
              Click mo yung &quot;+ Add Customer&quot; sa taas.
            </p>
          )}
        </div>
      ) : (
        // DATA TABLE
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/customer/${customer.id}`)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone_number || "-"}</TableCell>
                  <TableCell className="text-right text-slate-500">
                    {customer.created_at
                      ? format(new Date(customer.created_at), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}