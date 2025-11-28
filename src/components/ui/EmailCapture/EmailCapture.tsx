import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import styles from './EmailCapture.module.css';

interface EmailCaptureProps {
  variant?: 'inline' | 'centered';
  placeholder?: string;
  buttonText?: string;
}

export const EmailCapture = ({
  variant = 'inline',
  placeholder = 'Enter your email',
  buttonText = 'Join Waitlist',
}: EmailCaptureProps): React.ReactElement => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam protection
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      return;
    }

    // Validation
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!gdprConsent) {
      setStatus('error');
      setErrorMessage('Please agree to receive emails from Paperlyte');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // TODO: Replace with actual ConvertKit API endpoint
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success
      // if (!response.ok) throw new Error('Subscription failed');

      setStatus('success');
      setEmail('');
      setGdprConsent(false);

      // Track conversion (optional - add analytics here)
      // trackEvent('email_signup', { email });

    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
      console.error('Email subscription error:', error);
    }
  };

  if (status === 'success') {
    return (
      <div className={`${styles.container} ${styles[variant]}`}>
        <div className={styles.success} role="alert">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <p className={styles.successMessage}>
            <strong>You're on the list!</strong><br />
            Check your email to confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className={styles.honeypot}
          aria-hidden="true"
        />

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.visuallyHidden}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={styles.input}
            disabled={status === 'loading'}
            required
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'email-error' : undefined}
          />
          <Button
            variant="primary"
            size="medium"
            disabled={status === 'loading'}
            className={styles.button}
          >
            {status === 'loading' ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                Joining...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>

        <div className={styles.gdprWrapper}>
          <label className={styles.gdprLabel}>
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className={styles.checkbox}
              disabled={status === 'loading'}
              required
            />
            <span className={styles.gdprText}>
              I agree to receive emails from Paperlyte. View our{' '}
              <a href="/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {status === 'error' && errorMessage && (
          <div
            id="email-error"
            className={styles.error}
            role="alert"
            aria-live="polite"
          >
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
};
