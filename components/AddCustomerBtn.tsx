"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. Validation Schema
const formSchema = z.object({
  name: z.string().min(2, "Masyadong maikli ang pangalan boss."),
  phone_number: z.string().optional(), // Optional kasi baka wala pang cellphone
})

interface Props {
    onSuccess?: () => void
  }

export default function AddCustomerBtn({ onSuccess }: Props) {
  const [open, setOpen] = useState(false) // State para sa open/close ng modal
  const router = useRouter() // Pang refresh ng data
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "",
    },
  })

  // 2. Submit Logic
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Kunin muna sino naka-login (kailangan ng user_id sa database)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Session expired. Login ka ulit boss.")
        return
      }

      // Insert sa Database
      const { error } = await supabase.from("customers").insert({
        name: values.name,
        phone_number: values.phone_number,
        user_id: user.id, // Importante 'to para sayo lang yung customer
      })

      if (error) throw error

      // Success!
      toast.success("Customer Added!", {
        description: `${values.name} is now in your list.`,
      })

      setOpen(false) // Close modal
      form.reset()   // Clear form
      router.refresh() // Refresh page data (pag meron na tayong listahan)

      if (onSuccess) onSuccess() 

    } catch (error: unknown) {
        let message = "Something went wrong."
      
        if (error instanceof Error) {
          message = error.message
        }
      
        toast.error("Error adding customer", {
          description: message,
        })
      }      
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <Plus className="mr-2 h-4 w-4"/> Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <DialogDescription>
            Ilagay ang detalye ng suki mo dito.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="0912..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Customer"
              )}
            </Button>

          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}