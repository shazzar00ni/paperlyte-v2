/** UI copy and configuration for the Email Capture section. */
export const EMAIL_CAPTURE_CONTENT = {
  placeholder: 'your@email.com',
  submitText: 'Join the Waitlist',
  loadingText: 'Joining...',
  privacy: 'We respect your privacy. Unsubscribe anytime. No spam, ever.',
  successTitle: "✓ You're on the list!",
  successText: 'Check your inbox—we just sent you a welcome email with next steps.',
  nextStepsTitle: 'What happens next:',
  nextSteps: [
    "We'll send occasional product updates — no spam",
    "You'll get early access 2 weeks before public launch",
    "You'll shape the product — we'll ask for your input as we build",
  ],
  shareText: "Know someone who'd love this? Share Paperlyte:",
} as const

/** Benefit bullet points shown in the waitlist signup form. */
export const BENEFITS = [
  'Get early access before public launch',
  'Influence features and design decisions',
  'Lock in founder pricing (save 50% for life)',
  'Get early product updates and insider tips',
] as const
