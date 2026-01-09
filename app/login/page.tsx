"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CardFooter } from "@/components/ui/card"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Boss, paki-ayos ang email format.",
  }),
  password: z.string().min(6, {
    message: "Masyadong maikli ang password boss (min 6).",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error("Login Failed", {
          description: error.message,
        })
        return
      }

      toast.success("Welcome back boss!", {
        description: "Redirecting to dashboard...",
      })
      
      router.push("/") 
      router.refresh()
      
    } catch (error) {
      toast.error("System Error", error instanceof Error ? { description: error.message } : undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">

      <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Login sa Listahan</CardTitle>
          <CardDescription className="dark:text-slate-400">
            I-enter ang iyong credentials para makapasok.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="tindero@gmail.com" 
                        {...field} 
                        className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        {...field} 
                        className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Wala pang account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
                    Sign up here.
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  )
}