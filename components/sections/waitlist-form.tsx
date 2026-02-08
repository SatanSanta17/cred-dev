'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, Code2, Target } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  userType: z.enum(['developer', 'recruiter']),
  githubProfile: z.string().optional(),
  organization: z.string().optional(),
  willingToConnect: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export function WaitlistForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: 'developer',
      willingToConnect: false,
    },
  })

  const userType = watch('userType')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    
    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          email: data.email,
          user_type: data.userType,
          github_profile: data.githubProfile || null,
          organization: data.organization || null,
          willing_to_connect: data.willingToConnect,
        },
      ])

      if (error) {
        // Check if email already exists
        if (error.code === '23505') {
          toast.error('Already on the list!', {
            description: "This email is already registered. We'll contact you soon!"
          })
          return
        }
        throw error
      }

      // Success!
      setSubmitted(true)
      toast.success('🎉 Welcome to CredDev!', {
        description: "You're on the waitlist. We'll notify you when we launch!",
      })

      // Optional: Track in analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          user_type: data.userType,
          has_github: !!data.githubProfile,
        })
      }
      
    } catch (error: any) {
      console.error('Waitlist submission error:', error)
      toast.error('Something went wrong', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="waitlist" className="py-20 px-6 bg-gradient-to-b from-black to-slate-900">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-green-400" />
                </motion.div>
                <h3 className="text-4xl font-bold mb-4">You're In! 🎉</h3>
                <p className="text-gray-300 text-lg mb-2">
                  Welcome to CredDev. We'll reach out soon with early access.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Check your email for confirmation
                </p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                  Waitlist Position: Top 1000
                </Badge>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" className="py-20 px-6 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-purple-500/50 text-purple-400">
            Early Access
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Waitlist
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg px-4">
            Be among the first verified developers on CredDev
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 bg-slate-900/80 backdrop-blur-lg border-slate-800 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="text-base text-gray-200">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* User Type Toggle */}
              <div>
                <Label className="text-base text-gray-200 mb-3 block">I am a *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      value="developer"
                      {...register('userType')}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="p-4 border-2 border-slate-700 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition-all hover:border-slate-600 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 peer-checked:opacity-100 transition-opacity" />
                      <div className="relative z-10 text-center">
                        <Code2 className="w-8 h-8 mx-auto mb-2 text-purple-400 peer-checked:scale-110 transition-transform" />
                        <div className="font-semibold">Developer</div>
                      </div>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      value="recruiter"
                      {...register('userType')}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="p-4 border-2 border-slate-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all hover:border-slate-600 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 peer-checked:opacity-100 transition-opacity" />
                      <div className="relative z-10 text-center">
                        <Target className="w-8 h-8 mx-auto mb-2 text-blue-400 peer-checked:scale-110 transition-transform" />
                        <div className="font-semibold">Recruiter</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* GitHub Profile */}
              <div>
                <Label htmlFor="github" className="text-base text-gray-200">
                  GitHub Profile{' '}
                  <span className="text-gray-500 text-sm font-normal">(optional)</span>
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  {...register('githubProfile')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Organization */}
              <div>
                <Label htmlFor="org" className="text-base text-gray-200">
                  {userType === 'developer' ? 'College / Company' : 'Company'}{' '}
                  <span className="text-gray-500 text-sm font-normal">(optional)</span>
                </Label>
                <Input
                  id="org"
                  placeholder={
                    userType === 'developer' 
                      ? 'e.g. MIT, Google, Meta' 
                      : 'Your company name'
                  }
                  {...register('organization')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Willing to Connect (Developers only) */}
              {userType === 'developer' && (
                <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="willing"
                    {...register('willingToConnect')}
                    className="mt-1 w-4 h-4 accent-purple-500"
                    disabled={loading}
                  />
                  <Label htmlFor="willing" className="cursor-pointer text-sm leading-relaxed text-gray-300">
                    I'm willing to connect my GitHub to get my CredDev score first
                  </Label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining Waitlist...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                By joining, you agree to receive updates about CredDev
              </p>
            </form>
          </Card>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>100% free early access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Unsubscribe anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
