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

const formSchema = z.object({
  name: z.string().min(2, "Masyadong maikli ang pangalan boss."),
  phone_number: z.string().optional(),
})

interface Props {
    onSuccess?: () => void
}

export default function AddCustomerBtn({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Session expired. Login ka ulit boss.")
        return
      }

      const { error } = await supabase.from("customers").insert({
        name: values.name,
        phone_number: values.phone_number,
        user_id: user.id,
      })

      if (error) throw error

      toast.success("Customer Added!", {
        description: `${values.name} is now in your list.`,
      })

      setOpen(false)
      form.reset()
      router.refresh()

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
      
      <DialogContent className="sm:max-w-106.25 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
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
                  <FormLabel className="text-slate-700 dark:text-slate-300">Customer Name</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Juan Dela Cruz" 
                        {...field} 
                        className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
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
                  <FormLabel className="text-slate-700 dark:text-slate-300">Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="0912..." 
                        {...field} 
                        className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
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