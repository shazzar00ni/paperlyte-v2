import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackWidget } from './FeedbackWidget'
import type { ComponentProps } from 'react'

/** Renders the widget, opens the modal with fireEvent, and waits for the dialog. */
async function openModal(props?: ComponentProps<typeof FeedbackWidget>) {
  render(<FeedbackWidget {...props} />)
  fireEvent.click(screen.getByRole('button', { name: /open feedback form/i }))
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
}

/** Renders the widget, opens the modal with userEvent, and returns the user instance. */
async function openModalWithUser(props?: ComponentProps<typeof FeedbackWidget>) {
  const user = userEvent.setup()
  render(<FeedbackWidget {...props} />)
  await user.click(screen.getByRole('button', { name: /open feedback form/i }))
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
  return user
}

/** Types a message and clicks the submit button. */
async function typeAndSubmit(user: ReturnType<typeof userEvent.setup>, message: string) {
  await user.type(screen.getByRole('textbox'), message)
  await user.click(screen.getByRole('button', { name: /send feedback/i }))
}

describe('FeedbackWidget', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Floating Button', () => {
    it('renders floating feedback button', () => {
      render(<FeedbackWidget />)
      expect(screen.getByRole('button', { name: /open feedback form/i })).toBeInTheDocument()
    })

    it('opens modal when floating button is clicked', async () => {
      await openModal()
      expect(screen.getByRole('heading', { name: 'Send Feedback' })).toBeInTheDocument()
    })
  })

  describe('Modal Functionality', () => {
    it('closes modal when close button is clicked', async () => {
      await openModal()
      fireEvent.click(screen.getByRole('button', { name: /close feedback form/i }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes modal when Escape key is pressed', async () => {
      await openModal()
      fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes modal when backdrop is clicked', async () => {
      await openModal()
      fireEvent.click(screen.getByRole('dialog'))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('prevents body scroll when modal is open', async () => {
      render(<FeedbackWidget />)
      expect(document.body.style.overflow).toBe('')

      fireEvent.click(screen.getByRole('button', { name: /open feedback form/i }))
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden')
      })

      fireEvent.click(screen.getByRole('button', { name: /close feedback form/i }))
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('')
      })
    })
  })

  describe('Feedback Type Selection', () => {
    it('defaults to bug report type', async () => {
      await openModal()
      expect(screen.getByRole('button', { name: /report a bug/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('switches back to bug report type after selecting feature', async () => {
      await openModal()

      const featureButton = screen.getByRole('button', { name: /request a feature/i })
      fireEvent.click(featureButton)
      await waitFor(() => {
        expect(featureButton).toHaveAttribute('aria-pressed', 'true')
      })

      const bugButton = screen.getByRole('button', { name: /report a bug/i })
      fireEvent.click(bugButton)
      await waitFor(() => {
        expect(bugButton).toHaveAttribute('aria-pressed', 'true')
        expect(featureButton).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('switches to feature request type when clicked', async () => {
      await openModal()

      const featureButton = screen.getByRole('button', { name: /request a feature/i })
      fireEvent.click(featureButton)

      await waitFor(() => {
        expect(featureButton).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText(/share your feature idea/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('shows error when trying to submit empty message', async () => {
      const user = await openModalWithUser()

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '   ')

      const form = textarea.closest('form')
      if (!form) throw new Error('Form not found in test')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/please enter a message/i)).toBeInTheDocument()
      })
    })

    it('submits feedback and shows confirmation', async () => {
      const user = await openModalWithUser()
      await typeAndSubmit(user, 'This is a test bug report')

      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
        expect(
          screen.getByText(/your feedback has been submitted successfully/i)
        ).toBeInTheDocument()
      })
    })

    it('stores feedback in localStorage by default', async () => {
      const user = await openModalWithUser()
      await typeAndSubmit(user, 'Test feedback message')

      await waitFor(() => {
        const storedFeedback = localStorage.getItem('paperlyte_feedback')
        expect(storedFeedback).toBeTruthy()

        const feedbackArray = JSON.parse(storedFeedback!)
        expect(feedbackArray).toHaveLength(1)
        expect(feedbackArray[0]).toMatchObject({
          type: 'bug',
          message: 'Test feedback message',
        })
        expect(feedbackArray[0].timestamp).toBeTruthy()
      })
    })

    it('calls custom onSubmit handler when provided', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined)
      const user = await openModalWithUser({ onSubmit: mockSubmit })
      await typeAndSubmit(user, 'Custom handler test')

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          type: 'bug',
          message: 'Custom handler test',
        })
      })
    })

    it('handles submission errors gracefully', async () => {
      const mockSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
      const user = await openModalWithUser({ onSubmit: mockSubmit })
      await typeAndSubmit(user, 'Test error handling')

      await waitFor(() => {
        expect(screen.getByText(/failed to submit feedback/i)).toBeInTheDocument()
      })
    })

    it('disables submit button when submitting', async () => {
      const mockSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))
      const user = await openModalWithUser({ onSubmit: mockSubmit })

      await user.type(screen.getByRole('textbox'), 'Test submit button')
      const submitButton = screen.getByRole('button', { name: /send feedback/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/sending.../i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
      })
    })

    it('automatically closes modal 2 seconds after successful submission', async () => {
      vi.useFakeTimers()

      try {
        render(<FeedbackWidget />)
        fireEvent.click(screen.getByRole('button', { name: /open feedback form/i }))
        await vi.waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test auto-close' } })
        fireEvent.click(screen.getByRole('button', { name: /send feedback/i }))

        await vi.waitFor(() => {
          expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
        })
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        act(() => {
          vi.advanceTimersByTime(2000)
        })
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('clears timeout when modal is manually closed before auto-close', async () => {
      vi.useFakeTimers()

      try {
        render(<FeedbackWidget />)
        fireEvent.click(screen.getByRole('button', { name: /open feedback form/i }))
        await vi.waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        fireEvent.change(screen.getByRole('textbox'), {
          target: { value: 'Test timeout cleanup' },
        })
        fireEvent.click(screen.getByRole('button', { name: /send feedback/i }))

        await vi.waitFor(() => {
          expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: /close feedback form/i }))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        act(() => {
          vi.advanceTimersByTime(2000)
        })
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('LocalStorage Edge Cases', () => {
    it('handles corrupted localStorage data gracefully', async () => {
      localStorage.setItem('paperlyte_feedback', 'not-valid-json{{{')
      const user = await openModalWithUser()
      await typeAndSubmit(user, 'Test after corruption')

      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
      })

      const stored = JSON.parse(localStorage.getItem('paperlyte_feedback')!)
      expect(stored).toHaveLength(1)
      expect(stored[0].message).toBe('Test after corruption')
    })

    it('handles non-array localStorage data gracefully', async () => {
      localStorage.setItem('paperlyte_feedback', JSON.stringify({ not: 'an array' }))
      const user = await openModalWithUser()
      await typeAndSubmit(user, 'Test non-array recovery')

      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
      })

      const stored = JSON.parse(localStorage.getItem('paperlyte_feedback')!)
      expect(stored).toHaveLength(1)
      expect(stored[0].message).toBe('Test non-array recovery')
    })

    it('shows error when localStorage quota is exceeded', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
        if (key === 'paperlyte_feedback') {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError')
        }
      })

      const user = await openModalWithUser()
      await typeAndSubmit(user, 'Test quota exceeded')

      await waitFor(() => {
        expect(screen.getByText(/failed to submit feedback/i)).toBeInTheDocument()
      })

      setItemSpy.mockRestore()
    })
  })

  describe('Focus Trap', () => {
    /** Opens modal and returns the first and last focusable elements within it. */
    async function getFocusTrapElements() {
      await openModal()
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })

      const modal = screen.getByRole('dialog').querySelector('[class*="modalContent"]')
      expect(modal).toBeInTheDocument()

      const focusable = modal!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      return { first: focusable[0], last: focusable[focusable.length - 1] }
    }

    it('traps focus with Tab key on last element', async () => {
      const { first, last } = await getFocusTrapElements()
      last.focus()
      expect(last).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Tab' })
      expect(first).toHaveFocus()
    })

    it('traps focus with Shift+Tab on first element', async () => {
      const { first, last } = await getFocusTrapElements()
      first.focus()
      expect(first).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(last).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      await openModal()
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title')
    })

    it('has accessible form labels', async () => {
      await openModal()
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', 'feedback-message')

      const label = screen.getByText(/describe the issue you encountered/i)
      expect(label).toHaveAttribute('for', 'feedback-message')
    })

    it('has proper fieldset with legend for feedback type selector', async () => {
      await openModal()
      const typeSelector = document.querySelector('fieldset')
      expect(typeSelector).toBeInTheDocument()

      const legend = typeSelector?.querySelector('legend')
      expect(legend).toBeInTheDocument()
      expect(legend).toHaveTextContent('Feedback type selection')
      expect(legend).toHaveClass('sr-only')
    })
  })

  describe('Keyboard Navigation', () => {
    /** Opens modal and returns the bug/feature type buttons and user instance. */
    async function getTypeButtons() {
      const user = await openModalWithUser()
      return {
        user,
        bugButton: screen.getByRole('button', { name: /report a bug/i }),
        featureButton: screen.getByRole('button', { name: /request a feature/i }),
      }
    }

    it('should navigate between feedback type buttons with ArrowRight', async () => {
      const { user, bugButton, featureButton } = await getTypeButtons()
      bugButton.focus()
      await user.keyboard('{ArrowRight}')
      expect(featureButton).toHaveFocus()
    })

    it('should navigate between feedback type buttons with ArrowLeft', async () => {
      const { user, bugButton, featureButton } = await getTypeButtons()
      featureButton.focus()
      await user.keyboard('{ArrowLeft}')
      expect(bugButton).toHaveFocus()
    })

    it('should wrap navigation from last to first button with ArrowRight', async () => {
      const { user, bugButton, featureButton } = await getTypeButtons()
      featureButton.focus()
      await user.keyboard('{ArrowRight}')
      expect(bugButton).toHaveFocus()
    })

    it('should wrap navigation from first to last button with ArrowLeft', async () => {
      const { user, bugButton, featureButton } = await getTypeButtons()
      bugButton.focus()
      await user.keyboard('{ArrowLeft}')
      expect(featureButton).toHaveFocus()
    })
  })
})
