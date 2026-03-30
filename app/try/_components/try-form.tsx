'use client'

import { useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Github, Code2, User, Mail, Sparkles, FileText, X, Plus, Link as LinkIcon } from 'lucide-react'
import { getPlatformName, detectPlatformUrls } from '@/lib/platform-utils'

/** Detect display name for a single URL. Falls back to "Profile" on invalid input. */
function detectPlatformName(url: string): string {
  const detected = detectPlatformUrls(url)
  const platformId = Object.keys(detected)[0]
  return platformId ? getPlatformName(platformId) : 'Profile'
}

const trySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  github_url: z.string().url('Enter a valid GitHub URL').optional().or(z.literal('')),
  leetcode_url: z.string().url('Enter a valid LeetCode URL').optional().or(z.literal('')),
})

type FormFields = z.infer<typeof trySchema>

interface AdditionalLink {
  id: string
  url: string
  platformName: string
}

export type TryFormData = FormFields & {
  resume?: File
  additionalLinks: AdditionalLink[]
}

interface TryFormProps {
  onSubmit: (data: TryFormData) => void
  loading: boolean
}

export function TryForm({ onSubmit, loading }: TryFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLink[]>([])
  const [linkError, setLinkError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(trySchema),
    defaultValues: {
      name: '',
      email: '',
      github_url: '',
      leetcode_url: '',
    },
  })

  const githubValue = watch('github_url')
  const leetcodeValue = watch('leetcode_url')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setResumeFile(null)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setResumeFile(null)
        return
      }
      setResumeFile(file)
    }
  }

  const removeFile = () => {
    setResumeFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addLink = useCallback(() => {
    setAdditionalLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), url: '', platformName: '' },
    ])
    setLinkError(null)
  }, [])

  const updateLink = useCallback((id: string, url: string) => {
    setAdditionalLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? { ...link, url, platformName: url.trim() ? detectPlatformName(url.trim()) : '' }
          : link
      )
    )
    setLinkError(null)
  }, [])

  const removeLink = useCallback((id: string) => {
    setAdditionalLinks((prev) => prev.filter((link) => link.id !== id))
    setLinkError(null)
  }, [])

  const onFormSubmit = (data: FormFields) => {
    // Validate additional links have valid URLs
    const filledLinks = additionalLinks.filter((l) => l.url.trim())
    const invalidLink = filledLinks.find((l) => {
      try {
        new URL(l.url.trim())
        return false
      } catch {
        return true
      }
    })
    if (invalidLink) {
      setLinkError('Please enter valid URLs for all additional links')
      return
    }

    // Validate at least one input
    const hasAnyUrl = data.github_url || data.leetcode_url || filledLinks.length > 0
    if (!hasAnyUrl && !resumeFile) {
      setLinkError('At least one profile URL or resume is required')
      return
    }

    onSubmit({ ...data, resume: resumeFile || undefined, additionalLinks: filledLinks })
  }

  const hasAnyInput = githubValue || leetcodeValue || additionalLinks.some((l) => l.url.trim()) || resumeFile

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Glassmorphic Card */}
      <div className="relative">
        {/* Glow border effect */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-cyan-500/50 blur-sm opacity-60" />

        <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4"
            >
              <Sparkles className="w-7 h-7 text-purple-400" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Get Your Credibility Report
            </h2>
            <p className="text-gray-400 text-sm">
              Enter your profiles and we'll analyze them in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className="h-12 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600 transition-all"
                disabled={loading}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="h-12 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600 transition-all"
                disabled={loading}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-gray-500">Profile Links</span>
              </div>
            </div>

            {/* GitHub */}
            <div>
              <Label htmlFor="github" className="text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-500" />
                GitHub URL
              </Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                {...register('github_url')}
                className="h-12 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600 transition-all"
                disabled={loading}
              />
              {errors.github_url && <p className="text-red-400 text-xs mt-1">{errors.github_url.message}</p>}
            </div>

            {/* LeetCode */}
            <div>
              <Label htmlFor="leetcode" className="text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-gray-500" />
                LeetCode URL
              </Label>
              <Input
                id="leetcode"
                placeholder="https://leetcode.com/u/username"
                {...register('leetcode_url')}
                className="h-12 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600 transition-all"
                disabled={loading}
              />
              {errors.leetcode_url && <p className="text-red-400 text-xs mt-1">{errors.leetcode_url.message}</p>}
            </div>

            {/* Additional Profile Links */}
            {additionalLinks.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      {link.platformName || 'Profile URL'}
                    </Label>
                    <Input
                      placeholder="https://kaggle.com/username"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, e.target.value)}
                      className="h-12 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600 transition-all"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    disabled={loading}
                    className="mt-7 p-2 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Add Profile Link button */}
            <button
              type="button"
              onClick={addLink}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Profile Link
            </button>

            {/* Link-level errors */}
            {linkError && <p className="text-red-400 text-xs">{linkError}</p>}

            {/* Validation hint */}
            {!hasAnyInput && (
              <p className="text-gray-500 text-xs">At least one profile URL or resume is required</p>
            )}

            {/* Resume Upload */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-gray-500">Resume (optional)</span>
              </div>
            </div>

            <div>
              {resumeFile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{resumeFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(resumeFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={loading}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer ${loading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <FileText className="w-6 h-6 text-gray-500" />
                  <span className="text-sm text-gray-400">
                    Drop your resume here or <span className="text-purple-400">browse</span>
                  </span>
                  <span className="text-xs text-gray-600">PDF only, max 10 MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate My Report
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-600 mt-3">
              Reports are generated using AI and sent to your email
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
