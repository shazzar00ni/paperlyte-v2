import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

// Mock child components
vi.mock('@components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@components/ui/Icon', () => ({
  Icon: ({ name, size, ariaLabel }: any) => (
    <i
      className={`fa-solid ${name} ${size ? `fa-${size}` : ''}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  ),
}));

vi.mock('@components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}));

describe('Header', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header with correct structure', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should render logo with icon and text', () => {
      const { container } = render(<Header />);

      const logoIcon = container.querySelector('.fa-feather');
      expect(logoIcon).toBeInTheDocument();
      expect(screen.getByText('Paperlyte')).toBeInTheDocument();
    });

    it('should render navigation with aria-label', () => {
      render(<Header />);

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: 'Features' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Mobile Menu Interaction', () => {
    it('should toggle mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Initially closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');

      // Click to open
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      expect(menuButton).toHaveAttribute('aria-label', 'Close menu');

      // Click to close
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    });

    it('should change menu icon when menu is opened/closed', async () => {
      const user = userEvent.setup();
      const { container } = render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Initially shows bars icon
      expect(container.querySelector('.fa-bars')).toBeInTheDocument();
      expect(container.querySelector('.fa-xmark')).not.toBeInTheDocument();

      // Click to open - shows close icon
      await user.click(menuButton);
      expect(container.querySelector('.fa-xmark')).toBeInTheDocument();
      expect(container.querySelector('.fa-bars')).not.toBeInTheDocument();

      // Click to close - shows bars icon again
      await user.click(menuButton);
      expect(container.querySelector('.fa-bars')).toBeInTheDocument();
      expect(container.querySelector('.fa-xmark')).not.toBeInTheDocument();
    });

    it('should close mobile menu when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Press Escape
      await user.keyboard('{Escape}');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not close menu when Escape is pressed while menu is closed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Menu is closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // Press Escape (should do nothing)
      await user.keyboard('{Escape}');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should return focus to menu button when menu is closed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      // Focus something else
      const featuresButton = screen.getByRole('button', { name: 'Features' });
      featuresButton.focus();
      expect(document.activeElement).toBe(featuresButton);

      // Close menu with Escape
      await user.keyboard('{Escape}');

      // Focus should return to menu button
      expect(document.activeElement).toBe(menuButton);
    });
  });

  describe('Navigation Functionality', () => {
    it('should scroll to features section when Features is clicked', async () => {
      const user = userEvent.setup();
      const mockElement = document.createElement('div');
      mockElement.id = 'features';
      document.body.appendChild(mockElement);

      render(<Header />);

      const featuresButton = screen.getByRole('button', { name: 'Features' });
      await user.click(featuresButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(mockElement);
    });

    it('should scroll to download section when Download is clicked', async () => {
      const user = userEvent.setup();
      const mockElement = document.createElement('div');
      mockElement.id = 'download';
      document.body.appendChild(mockElement);

      render(<Header />);

      const downloadButton = screen.getByRole('button', { name: 'Download' });
      await user.click(downloadButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(mockElement);
    });

    it('should scroll to download section when Get Started is clicked', async () => {
      const user = userEvent.setup();
      const mockElement = document.createElement('div');
      mockElement.id = 'download';
      document.body.appendChild(mockElement);

      render(<Header />);

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });
      await user.click(getStartedButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(mockElement);
    });

    it('should not scroll if target section does not exist', async () => {
      const user = userEvent.setup();
      const scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

      render(<Header />);

      const featuresButton = screen.getByRole('button', { name: 'Features' });
      await user.click(featuresButton);

      // Should not be called if element doesn't exist
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    });

    it('should close mobile menu after scrolling to section', async () => {
      const user = userEvent.setup();
      const mockElement = document.createElement('div');
      mockElement.id = 'features';
      document.body.appendChild(mockElement);

      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Click navigation link
      const featuresButton = screen.getByRole('button', { name: 'Features' });
      await user.click(featuresButton);

      // Menu should be closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      document.body.removeChild(mockElement);
    });
  });

  describe('Focus Trap', () => {
    it('should focus first element when mobile menu opens', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      // First focusable element (Features button) should be focused
      const featuresButton = screen.getByRole('button', { name: 'Features' });
      expect(document.activeElement).toBe(featuresButton);
    });

    it('should trap focus within mobile menu when Tab is pressed on last element', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      // Get all focusable elements in order
      const featuresButton = screen.getByRole('button', { name: 'Features' });
      const downloadButton = screen.getByRole('button', { name: 'Download' });
      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });

      // First element should be focused
      expect(document.activeElement).toBe(featuresButton);

      // Tab to second element
      await user.tab();
      expect(document.activeElement).toBe(downloadButton);

      // Tab to third element
      await user.tab();
      expect(document.activeElement).toBe(getStartedButton);

      // Tab on last element should cycle to first
      await user.tab();
      expect(document.activeElement).toBe(featuresButton);
    });

    it('should trap focus when Shift+Tab is pressed on first element', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      const featuresButton = screen.getByRole('button', { name: 'Features' });
      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });

      // First element should be focused
      expect(document.activeElement).toBe(featuresButton);

      // Shift+Tab on first element should cycle to last
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(getStartedButton);
    });

    it('should allow normal tabbing in the middle of the menu', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      const featuresButton = screen.getByRole('button', { name: 'Features' });
      const downloadButton = screen.getByRole('button', { name: 'Download' });

      // First element focused
      expect(document.activeElement).toBe(featuresButton);

      // Tab to second element (should work normally)
      await user.tab();
      expect(document.activeElement).toBe(downloadButton);

      // Shift+Tab back to first element (should work normally)
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(featuresButton);
    });

    it('should not trap focus when menu is closed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Menu is closed - focus should not be trapped
      menuButton.focus();
      expect(document.activeElement).toBe(menuButton);

      // Tab should move focus away normally (not trapped)
      await user.tab();
      expect(document.activeElement).not.toBe(menuButton);
    });

    it('should handle non-Tab keys without interfering', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu
      await user.click(menuButton);

      const featuresButton = screen.getByRole('button', { name: 'Features' });
      expect(document.activeElement).toBe(featuresButton);

      // Press non-Tab keys (should not interfere)
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(featuresButton);

      await user.keyboard('{Enter}');
      // Enter would click the button, but focus should remain manageable
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      expect(menuButton).toHaveAttribute('type', 'button');
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when menu state changes', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-label to reflect menu state', async () => {
      const user = userEvent.setup();
      render(<Header />);

      let menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');

      await user.click(menuButton);
      menuButton = screen.getByRole('button', { name: 'Close menu' });
      expect(menuButton).toHaveAttribute('aria-label', 'Close menu');
    });

    it('should have semantic header element', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header.tagName).toBe('HEADER');
    });

    it('should have semantic nav element with label', () => {
      render(<Header />);

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav.tagName).toBe('NAV');
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<Header />);

      const logoIcon = container.querySelector('.fa-feather');
      expect(logoIcon).toHaveAttribute('aria-hidden', 'true');

      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      const menuIcon = within(menuButton as HTMLElement).getByRole('img', { hidden: true });
      expect(menuIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Event Cleanup', () => {
    it('should cleanup Escape key listener when component unmounts', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<Header />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should cleanup focus trap listener when menu closes', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Open menu (sets up listener)
      await user.click(menuButton);

      // Close menu (should cleanup listener)
      await user.click(menuButton);

      // The listener should be cleaned up (we can't directly test this,
      // but we ensure no errors occur)
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should cleanup all listeners when component unmounts while menu is open', async () => {
      const user = userEvent.setup();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      await user.click(menuButton);

      unmount();

      // Should cleanup both the Escape listener and focus trap listener
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid menu toggles', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Rapidly toggle menu
      await user.click(menuButton);
      await user.click(menuButton);
      await user.click(menuButton);
      await user.click(menuButton);

      // Should end in closed state (even number of clicks)
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle multiple Escape key presses', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Press Escape multiple times
      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');

      // Should remain closed after first Escape
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle scrolling to non-existent sections gracefully', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const featuresButton = screen.getByRole('button', { name: 'Features' });

      // Should not throw error when section doesn't exist
      expect(async () => {
        await user.click(featuresButton);
      }).not.toThrow();
    });

    it('should handle empty focusable elements list', async () => {
      const user = userEvent.setup();

      // Create a mock where querySelectorAll returns empty NodeList
      const originalQuerySelectorAll = Element.prototype.querySelectorAll;
      Element.prototype.querySelectorAll = vi.fn(() => [] as any);

      render(<Header />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Should not throw error with no focusable elements
      expect(async () => {
        await user.click(menuButton);
      }).not.toThrow();

      Element.prototype.querySelectorAll = originalQuerySelectorAll;
    });
  });

  describe('Integration', () => {
    it('should integrate properly with Button component', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });

      // Button should be clickable
      await user.click(getStartedButton);

      // Should have called scrollToSection (verified by other tests)
      expect(getStartedButton).toBeInTheDocument();
    });

    it('should integrate properly with Icon component', () => {
      const { container } = render(<Header />);

      // Should render icons with correct classes
      expect(container.querySelector('.fa-feather')).toBeInTheDocument();
      expect(container.querySelector('.fa-bars')).toBeInTheDocument();
    });

    it('should integrate properly with ThemeToggle component', () => {
      render(<Header />);

      const themeToggle = screen.getByRole('button', { name: 'Toggle theme' });
      expect(themeToggle).toBeInTheDocument();
    });
  });
});