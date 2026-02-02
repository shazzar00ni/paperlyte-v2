import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackWidget } from './FeedbackWidget';

describe('FeedbackWidget', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Floating Button', () => {
    it('renders floating feedback button', () => {
      render(<FeedbackWidget />);
      const button = screen.getByRole('button', { name: /open feedback form/i });
      expect(button).toBeInTheDocument();
    });

    it('opens modal when floating button is clicked', async () => {
      render(<FeedbackWidget />);
      const button = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Send Feedback' })).toBeInTheDocument();
      });
    });
  });

  describe('Modal Functionality', () => {
    it('closes modal when close button is clicked', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close feedback form/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes modal when Escape key is pressed', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes modal when backdrop is clicked', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click backdrop
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('prevents body scroll when modal is open', async () => {
      render(<FeedbackWidget />);
      expect(document.body.style.overflow).toBe('');

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close feedback form/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      });
    });
  });

  describe('Feedback Type Selection', () => {
    it('defaults to bug report type', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const bugButton = screen.getByRole('button', { name: /report a bug/i });
        expect(bugButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('switches to feature request type when clicked', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /request a feature/i })).toBeInTheDocument();
      });

      const featureButton = screen.getByRole('button', { name: /request a feature/i });
      fireEvent.click(featureButton);

      await waitFor(() => {
        expect(featureButton).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText(/share your feature idea/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows error when trying to submit empty message', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Type only whitespace
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');

      // Try to submit the form directly (tests defensive validation logic)
      const form = textarea.closest('form');
      if (!form) throw new Error('Form not found in test');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/please enter a message/i)).toBeInTheDocument();
      });
    });

    it('submits feedback and shows confirmation', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter feedback message
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a test bug report');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Check for confirmation
      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument();
        expect(
          screen.getByText(/your feedback has been submitted successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('stores feedback in localStorage by default', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter feedback message
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test feedback message');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Check localStorage
      await waitFor(() => {
        const storedFeedback = localStorage.getItem('paperlyte_feedback');
        expect(storedFeedback).toBeTruthy();

        const feedbackArray = JSON.parse(storedFeedback!);
        expect(feedbackArray).toHaveLength(1);
        expect(feedbackArray[0]).toMatchObject({
          type: 'bug',
          message: 'Test feedback message',
        });
        expect(feedbackArray[0].timestamp).toBeTruthy();
      });
    });

    it('calls custom onSubmit handler when provided', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      render(<FeedbackWidget onSubmit={mockSubmit} />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter feedback message
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Custom handler test');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          type: 'bug',
          message: 'Custom handler test',
        });
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<FeedbackWidget onSubmit={mockSubmit} />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter feedback message
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test error handling');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to submit feedback/i)).toBeInTheDocument();
      });
    });

    it('disables submit button when submitting', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FeedbackWidget onSubmit={mockSubmit} />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter feedback message
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test submit button');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/sending.../i)).toBeInTheDocument();

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText(/thank you!/i)).toBeInTheDocument();
      });
    });

    it('automatically closes modal 2 seconds after successful submission', async () => {
      vi.useFakeTimers();

      try {
        render(<FeedbackWidget />);

        // Open modal
        const openButton = screen.getByRole('button', { name: /open feedback form/i });
        fireEvent.click(openButton);

        await vi.waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Enter feedback message
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Test auto-close' } });

        // Submit form by clicking submit button
        const submitButton = screen.getByRole('button', { name: /send feedback/i });
        fireEvent.click(submitButton);

        // Confirmation should be shown
        await vi.waitFor(() => {
          expect(screen.getByText(/thank you!/i)).toBeInTheDocument();
        });

        // Modal should still be open
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Fast-forward time by 2 seconds
        act(() => {
          vi.advanceTimersByTime(2000);
        });

        // Modal should now be closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('clears timeout when modal is manually closed before auto-close', async () => {
      vi.useFakeTimers();

      try {
        render(<FeedbackWidget />);

        // Open modal
        const openButton = screen.getByRole('button', { name: /open feedback form/i });
        fireEvent.click(openButton);

        await vi.waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Enter feedback message and submit
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Test timeout cleanup' } });
        const submitButton = screen.getByRole('button', { name: /send feedback/i });
        fireEvent.click(submitButton);

        // Wait for confirmation
        await vi.waitFor(() => {
          expect(screen.getByText(/thank you!/i)).toBeInTheDocument();
        });

        // Manually close the modal before the 2-second auto-close
        const closeButton = screen.getByRole('button', { name: /close feedback form/i });
        fireEvent.click(closeButton);

        // Modal should be closed immediately
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Fast-forward past the original timeout
        act(() => {
          vi.advanceTimersByTime(2000);
        });

        // Modal should remain closed (timeout was cleaned up)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title');
      });
    });

    it('has accessible form labels', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('id', 'feedback-message');

        const label = screen.getByText(/describe the issue you encountered/i);
        expect(label).toHaveAttribute('for', 'feedback-message');
      });
    });

    it('has proper fieldset with legend for feedback type selector', async () => {
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const typeSelector = document.querySelector('fieldset');
        expect(typeSelector).toBeInTheDocument();

        const legend = typeSelector?.querySelector('legend');
        expect(legend).toBeInTheDocument();
        expect(legend).toHaveTextContent('Feedback type selection');
        expect(legend).toHaveClass('sr-only');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate between feedback type buttons with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const bugButton = screen.getByRole('button', { name: /report a bug/i });
      const featureButton = screen.getByRole('button', { name: /request a feature/i });

      bugButton.focus();
      expect(bugButton).toHaveFocus();

      await user.keyboard('{ArrowRight}');

      expect(featureButton).toHaveFocus();
    });

    it('should navigate between feedback type buttons with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const bugButton = screen.getByRole('button', { name: /report a bug/i });
      const featureButton = screen.getByRole('button', { name: /request a feature/i });

      featureButton.focus();
      expect(featureButton).toHaveFocus();

      await user.keyboard('{ArrowLeft}');

      expect(bugButton).toHaveFocus();
    });

    it('should wrap navigation from last to first button with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const bugButton = screen.getByRole('button', { name: /report a bug/i });
      const featureButton = screen.getByRole('button', { name: /request a feature/i });

      featureButton.focus();
      expect(featureButton).toHaveFocus();

      await user.keyboard('{ArrowRight}');

      expect(bugButton).toHaveFocus();
    });

    it('should wrap navigation from first to last button with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<FeedbackWidget />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open feedback form/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const bugButton = screen.getByRole('button', { name: /report a bug/i });
      const featureButton = screen.getByRole('button', { name: /request a feature/i });

      bugButton.focus();
      expect(bugButton).toHaveFocus();

      await user.keyboard('{ArrowLeft}');

      expect(featureButton).toHaveFocus();
    });
  });
});
