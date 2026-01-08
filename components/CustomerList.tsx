"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { User, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
interface CustomerWithData extends Customer {
  transactions: {
    type: "UTANG" | "BAYAD" | string;
    amount: number;
  }[];
}

interface Props {
  refreshTrigger: number;
}

export default function CustomerList({ refreshTrigger }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      let request = supabase
        .from("customers")
        .select("*, transactions(type, amount)")
        .order("created_at", { ascending: false });

      if (query.trim().length > 0) {
        request = request.ilike("name", `%${query}%`);
      }

      const { data, error } = await request;

      if (error) throw error;
      if (data) setCustomers(data as unknown as CustomerWithData[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchCustomers, refreshTrigger]);

  const getBalance = (transactions: CustomerWithData["transactions"]) => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === "UTANG") return acc + curr.amount;
      if (curr.type === "BAYAD") return acc - curr.amount;
      return acc;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 animate-spin" />
        ) : (
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        )}

        <Input
          type="search"
          placeholder="Search customer name..."
          className="pl-9 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-800 border-dashed">
          <User className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery ? "No customer found." : "Wala pang customers, boss."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950">
              <TableRow>
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Name
                </TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Phone
                </TableHead>
                {/* ADDED HEADER */}
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Balance
                </TableHead>
                <TableHead className="text-right text-slate-500 dark:text-slate-400">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const balance = getBalance(customer.transactions);

                return (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800"
                    onClick={() => router.push(`/customer/${customer.id}`)}
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {customer.phone_number || "-"}
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        balance > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      ₱ {balance.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right text-slate-500 dark:text-slate-500">
                      {customer.created_at
                        ? format(new Date(customer.created_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
