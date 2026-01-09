"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeName, setStoreName] = useState("")

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('store_name')
        .eq('id', user.id)
        .single()

      if (data) {
        setStoreName(data.store_name || "")
      }
      
      setLoading(false)
    }

    getProfile()
  }, [router])

  async function handleSave() {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            store_name: storeName,
            updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success("Settings Saved!", {
        description: "Your store name has been updated.",
      })
      
      router.refresh()
      
    } catch (error) {
      toast.error("Error", error instanceof Error ? { description: error.message } : undefined)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>

        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Store Profile</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Dito mo palitan ang pangalan na lumalabas sa dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
                <Label htmlFor="storeName" className="dark:text-slate-300">Store Name</Label>
                <Input 
                    id="storeName"
                    placeholder="Aling Nena Store" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
            </div>

            <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                )}
            </Button>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}