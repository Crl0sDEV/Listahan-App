"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. Props Interface
// Ano ang kailangan ipasa sa component na ito?
interface Props {
  customerId: string
  type: "UTANG" | "BAYAD"
  onSuccess: () => void // Function na tatawagin pag success (para mag refresh ang table)
}

// 2. Validation Schema
const formSchema = z.object({
  amount: z.number().min(1, "Dapat may amount boss."),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function AddTransactionBtn({ customerId, type, onSuccess }: Props) {
  const [open, setOpen] = useState(false)

  // Logic para sa kulay at text (Dynamic)
  const isUtang = type === "UTANG"
  const colorClass = isUtang ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
  const label = isUtang ? "Mag-Utang" : "Mag-Bayad"

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Insert sa Database
      const { error } = await supabase.from("transactions").insert({
        customer_id: customerId,
        user_id: user.id,
        type: type, // 'UTANG' or 'BAYAD'
        amount: values.amount,
        description: values.description || (isUtang ? "Utang" : "Payment"),
      })

      if (error) throw error

      toast.success("Success!", {
        description: `Successfully added ${type} of ₱${values.amount}`,
      })

      setOpen(false)
      form.reset()
      onSuccess() // Refresh parent data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      toast.error("Error", { description: errorMessage })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`w-full h-12 text-lg ${colorClass}`}>
          {isUtang ? <Plus className="mr-2" /> : <Minus className="mr-2" />}
          {isUtang ? "UTANG" : "BAYAD"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Input amount and details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₱)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder={isUtang ? "e.g. 2 Corned Beef" : "e.g. Partial Payment"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={`w-full ${colorClass}`} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Save Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
