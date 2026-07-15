import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { logError } from '@utils/monitoring'
import { validateEmail } from '@utils/validation'

interface UseWaitlistSubscribeResult {
  email: string
  setEmail: (email: string) => void
  isSubmitted: boolean
  isLoading: boolean
  error: string | null
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>
  reset: () => void
}

/**
 * Encapsulates waitlist email submission: validation, the subscribe API call,
 * and the resulting loading/error/success state. Shared by every UI surface
 * that lets a user join the waitlist (the dedicated section and the CTA modal).
 */
export function useWaitlistSubscribe(componentName: string): UseWaitlistSubscribeResult {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Tracks the in-flight request so reset() (e.g. closing a modal mid-submit)
  // can cancel it — otherwise a late response could overwrite fresh state
  // after the form has already been reset or resubmitted.
  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = (): void => {
    abortControllerRef.current?.abort()
    setEmail('')
    setIsSubmitted(false)
    setIsLoading(false)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    const validation = validateEmail(normalizedEmail)
    if (!validation.isValid) {
      setError(validation.error ?? 'Please enter a valid email address.')
      return
    }

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}))
        const serverMessage =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : undefined

        if (res.status === 400 || res.status === 429) {
          // User-caused error — display message without logging to monitoring
          setIsLoading(false)
          setError(
            serverMessage ??
              (res.status === 429
                ? 'Too many requests. Please try again later.'
                : 'Invalid email address. Please check and try again.')
          )
          return
        }

        // Unexpected server error — propagate to catch block for monitoring
        throw new Error(serverMessage ?? 'Subscription failed')
      }

      setIsLoading(false)
      setIsSubmitted(true)
    } catch (err) {
      // Aborted by a subsequent reset()/resubmit — the requester no longer
      // cares about this result, so don't touch state or log it as an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      const error = err instanceof Error ? err : new Error(String(err))
      logError(
        error,
        {
          tags: {
            component: componentName,
            action: 'subscribe',
            errorType: error.name,
          },
          ...(!(err instanceof Error)
            ? { errorInfo: { originalError: String(err).slice(0, 200) } }
            : {}),
        },
        componentName
      )

      let message = "Couldn't add you to the waitlist. Check your connection and try again."
      if (
        error.name === 'TypeError' ||
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch')
      ) {
        message = 'Connection error. Check your internet and try again.'
      } else if (
        error.message.toLowerCase().includes('invalid') ||
        error.message.toLowerCase().includes('validation')
      ) {
        message = "That email address doesn't look right. Please check and try again."
      }

      setIsLoading(false)
      setError(message)
    }
  }

  return { email, setEmail, isSubmitted, isLoading, error, handleSubmit, reset }
}
