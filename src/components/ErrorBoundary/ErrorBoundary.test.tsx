import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Suppress console.error in tests to keep output clean
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    // Restore all environment stubs
    vi.unstubAllEnvs();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children without errors', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/We're sorry, but something unexpected happened/i)
      ).toBeInTheDocument();
    });

    it('should call console.error with error details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should use custom fallback if provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    it('should show error details in development mode', () => {
      // Set DEV mode
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const details = screen.getByText(/Error details \(development only\)/i);
      expect(details).toBeInTheDocument();
    });

    it('should display error stack trace in development mode', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorText = screen.getByText(/Error: Test error/i);
      expect(errorText).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      // Set production mode
      vi.stubEnv('DEV', false);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.queryByText(/Error details \(development only\)/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should render "Try Again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render "Reload Page" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('should reset error state when "Try Again" is clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Conditional error');
        }
        return <div>Component recovered</div>;
      };

      render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      // Error should be shown
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click Try Again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Should show recovered component
      expect(screen.getByText('Component recovered')).toBeInTheDocument();
    });

    it('should reload page when "Reload Page" is clicked', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.fn();

      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      await user.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" on error container', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-hidden on error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      expect(tryAgainButton).toHaveAttribute('type', 'button');
      expect(reloadButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple consecutive errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // First error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Reset
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      tryAgainButton.click();

      // Another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle errors with no stack trace', () => {
      const ErrorWithoutStack = () => {
        const error = new Error('No stack');
        delete error.stack;
        throw error;
      };

      render(
        <ErrorBoundary>
          <ErrorWithoutStack />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should set hasError to true when error is thrown', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // If hasError is true, fallback UI should be shown
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should store the error in state', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error should be stored and displayed
      expect(screen.getByText(/Error: Test error/i)).toBeInTheDocument();
    });
  });
});
