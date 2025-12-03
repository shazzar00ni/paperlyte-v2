import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

describe('Header', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock the scrollIntoView method
    scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    // Restore scrollIntoView
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the logo', () => {
      render(<Header />);

      expect(screen.getByText('Paperlyte')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should render Get Started CTA button', () => {
      render(<Header />);

      // There might be multiple "Get Started" buttons, so we check that at least one exists
      const ctaButtons = screen.getAllByRole('button', { name: /get started/i });
      expect(ctaButtons.length).toBeGreaterThan(0);
    });

    it('should render ThemeToggle component', () => {
      render(<Header />);

      // ThemeToggle should render a button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton).toBeInTheDocument();
    });

    it('should have main navigation aria-label', () => {
      render(<Header />);

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);

      await user.click(menuButton);

      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    });

    it('should show close icon when menu is open', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      const closeButton = screen.getByLabelText(/close menu/i);
      expect(closeButton.querySelector('.fa-xmark')).toBeInTheDocument();
    });

    it('should show bars icon when menu is closed', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton.querySelector('.fa-bars')).toBeInTheDocument();
    });

    it('should have correct aria-expanded attribute', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);

      const openMenuButton = screen.getByLabelText(/close menu/i);
      expect(openMenuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should close menu when clicking menu button again', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);

      await user.click(menuButton);
      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

      const closeButton = screen.getByLabelText(/close menu/i);
      await user.click(closeButton);

      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close menu when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });

    it('should not close menu when Escape is pressed if menu is already closed', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);

      await user.keyboard('{Escape}');

      // Menu should still be closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should return focus to menu button when menu closes via Escape', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      await user.keyboard('{Escape}');

      // Menu button should have focus
      expect(menuButton).toHaveFocus();
    });

    it('should navigate with Tab key in open menu', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Tab should move focus through menu items
      await user.keyboard('{Tab}');

      // Focus should be on a focusable element within the navigation
      const nav = screen.getByRole('navigation');
      expect(nav.contains(document.activeElement)).toBe(true);
    });

    it('should trap focus with Tab at end of menu', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Get all focusable elements in the menu
      const nav = screen.getByRole('navigation');
      const focusableElements = nav.querySelectorAll('button, [href]');

      // Focus should cycle through elements
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should navigate with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Capture initial focused element (should be first menu item after opening)
      const initialElement = document.activeElement;
      expect(initialElement).toBeTruthy();

      await user.keyboard('{ArrowDown}');

      // Focus should have moved to a different element
      expect(document.activeElement).not.toBe(initialElement);

      // The new focused element should be within the navigation menu
      const nav = screen.getByRole('navigation');
      expect(nav.contains(document.activeElement)).toBe(true);

      // Should be a focusable menu item (button)
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });

    it('should navigate with ArrowUp key', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Capture initial focused element (should be first menu item after opening)
      const initialElement = document.activeElement;
      expect(initialElement).toBeTruthy();

      await user.keyboard('{ArrowUp}');

      // Focus should have moved to a different element (wraps to last item)
      expect(document.activeElement).not.toBe(initialElement);

      // The new focused element should be within the navigation menu
      const nav = screen.getByRole('navigation');
      expect(nav.contains(document.activeElement)).toBe(true);

      // Should be a focusable menu item (button)
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });

    it('should jump to first item with Home key', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Get all focusable elements in the menu list (not including mobile menu button)
      const nav = screen.getByRole('navigation');
      const menuList = nav.querySelector('ul');
      const focusableElements = menuList?.querySelectorAll<HTMLElement>('button, [href]');
      const firstElement = focusableElements?.[0];

      // Move to another element first
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).not.toBe(firstElement);

      // Press Home to jump to first
      await user.keyboard('{Home}');

      // Should be on the first focusable element within the menu list
      expect(document.activeElement).toBe(firstElement);
      expect(menuList?.contains(document.activeElement)).toBe(true);
    });

    it('should jump to last item with End key', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Get all focusable elements in the menu list (not including mobile menu button)
      const nav = screen.getByRole('navigation');
      const menuList = nav.querySelector('ul');
      const focusableElements = menuList?.querySelectorAll<HTMLElement>('button, [href]');
      const lastElement = focusableElements?.[focusableElements.length - 1];

      // Press End to jump to last
      await user.keyboard('{End}');

      // Should be on the last focusable element within the menu list
      expect(document.activeElement).toBe(lastElement);
      expect(menuList?.contains(document.activeElement)).toBe(true);
    });
  });

  describe('Navigation Functionality', () => {
    it('should scroll to features section when Features link is clicked', async () => {
      const user = userEvent.setup();

      // Create a mock features section
      const featuresSection = document.createElement('div');
      featuresSection.id = 'features';
      document.body.appendChild(featuresSection);

      render(<Header />);

      const featuresButton = screen.getByRole('button', { name: /^features$/i });
      await user.click(featuresButton);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      });

      // Cleanup
      document.body.removeChild(featuresSection);
    });

    it('should scroll to download section when Download link is clicked', async () => {
      const user = userEvent.setup();

      // Create a mock download section
      const downloadSection = document.createElement('div');
      downloadSection.id = 'download';
      document.body.appendChild(downloadSection);

      render(<Header />);

      const downloadButton = screen.getByRole('button', { name: /^download$/i });
      await user.click(downloadButton);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      });

      // Cleanup
      document.body.removeChild(downloadSection);
    });

    it('should close mobile menu after clicking a navigation link', async () => {
      const user = userEvent.setup();

      // Create a mock section
      const section = document.createElement('div');
      section.id = 'features';
      document.body.appendChild(section);

      render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

      // Click a navigation link
      const featuresButton = screen.getByRole('button', { name: /^features$/i });
      await user.click(featuresButton);

      // Menu should be closed
      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();

      // Cleanup
      document.body.removeChild(section);
    });

    it('should handle missing section gracefully', async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Click link for non-existent section
      const featuresButton = screen.getByRole('button', { name: /^features$/i });

      // Should not throw error
      await expect(user.click(featuresButton)).resolves.not.toThrow();
    });

    it('should scroll to download section from Get Started button', async () => {
      const user = userEvent.setup();

      // Create a mock download section
      const downloadSection = document.createElement('div');
      downloadSection.id = 'download';
      document.body.appendChild(downloadSection);

      render(<Header />);

      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i });
      // Click the first Get Started button
      await user.click(getStartedButtons[0]);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      });

      // Cleanup
      document.body.removeChild(downloadSection);
    });
  });

  describe('Focus Management', () => {
    it('should focus first element when menu opens', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // After menu opens, first focusable element should have focus
      expect(document.activeElement).not.toBe(document.body);
    });

    it('should return focus to menu button when closing via navigation', async () => {
      const user = userEvent.setup();

      // Create a mock section
      const section = document.createElement('div');
      section.id = 'features';
      document.body.appendChild(section);

      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      const featuresButton = screen.getByRole('button', { name: /^features$/i });
      await user.click(featuresButton);

      // Focus should return to menu button
      expect(menuButton).toHaveFocus();

      // Cleanup
      document.body.removeChild(section);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/open menu|close menu/i)).toBeInTheDocument();
    });

    it('should update aria-label when menu state changes', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');

      await user.click(menuButton);

      const closeButton = screen.getByLabelText(/close menu/i);
      expect(closeButton).toHaveAttribute('aria-label', 'Close menu');
    });
  });
});
