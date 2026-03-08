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
import { Loader2, CheckCircle2 } from 'lucide-react'
import { WaitlistCount } from '@/components/shared/waitlist-count'
import { GradientText } from '@/components/shared/gradient-text'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().optional(),
  teamSize: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function RecruiterWaitlistForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          email: data.email,
          user_type: 'recruiter',
          organization: data.organization || null,
          github_profile: null,
          willing_to_connect: false,
        },
      ])

      if (error) {
        if (error.code === '23505') {
          toast.error('Already on the list!', {
            description: "This email is already registered. We'll contact you when recruiter tools launch!",
          })
          return
        }
        throw error
      }

      setSubmitted(true)
      toast.success('You\'re on the list!', {
        description: "We'll reach out when recruiter tools are ready.",
      })
    } catch (error) {
      console.error('Waitlist submission error:', error)
      toast.error('Something went wrong', {
        description: 'Please try again or contact support.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="recruiter-waitlist" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-center relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-cyan-400" />
                </motion.div>
                <h3 className="text-3xl font-bold mb-4">You're on the list!</h3>
                <p className="text-gray-300 text-lg mb-2">
                  We'll reach out when recruiter tools are ready.
                </p>
                <p className="text-gray-500 text-sm">
                  Early access members get priority onboarding.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="recruiter-waitlist" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-cyan-500/50 text-cyan-400">
            Early Access
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Get early{' '}
            <GradientText>access.</GradientText>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg px-4 mb-2">
            Be among the first recruiters to use verified credibility reports.
          </p>
          <WaitlistCount
            userType="recruiter"
            showLabel={true}
            className="text-sm text-gray-500"
            hideUntil={10}
            fallbackText=""
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 bg-slate-900/80 backdrop-blur-lg border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base text-gray-200">
                  Work Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-cyan-500 transition-colors"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <Label htmlFor="org" className="text-base text-gray-200">
                  Company{' '}
                  <span className="text-gray-500 text-sm font-normal">(optional)</span>
                </Label>
                <Input
                  id="org"
                  placeholder="Your company name"
                  {...register('organization')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-cyan-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Team Size */}
              <div>
                <Label htmlFor="teamSize" className="text-base text-gray-200">
                  Hiring team size{' '}
                  <span className="text-gray-500 text-sm font-normal">(optional)</span>
                </Label>
                <Input
                  id="teamSize"
                  placeholder="e.g. 5, 10-20, 50+"
                  {...register('teamSize')}
                  className="mt-2 h-12 bg-slate-800 border-slate-700 focus:border-cyan-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join the Waitlist'
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                By joining, you agree to receive updates about CredDev for recruiters.
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
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Free early access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>No commitment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Priority onboarding</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
