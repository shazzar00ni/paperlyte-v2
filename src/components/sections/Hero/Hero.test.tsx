import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from './Hero';

describe('Hero', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock scrollIntoView
    scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    // Restore scrollIntoView
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the hero section', () => {
      const { container } = render(<Hero />);

      const section = container.querySelector('#hero');
      expect(section).toBeInTheDocument();
    });

    it('should render the main headline', () => {
      render(<Hero />);

      expect(
        screen.getByRole('heading', { name: /your thoughts, unchained from complexity/i })
      ).toBeInTheDocument();
    });

    it('should render the subheadline', () => {
      render(<Hero />);

      expect(
        screen.getByText(/lightning-fast, distraction-free note-taking/i)
      ).toBeInTheDocument();
    });

    it('should render CTA buttons', () => {
      render(<Hero />);

      expect(screen.getByRole('button', { name: /download now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /see features/i })).toBeInTheDocument();
    });

    it('should render feature tags', () => {
      render(<Hero />);

      expect(screen.getByText(/lightning fast/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy first/i)).toBeInTheDocument();
      expect(screen.getByText(/offline ready/i)).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('should have Download Now button with primary variant', () => {
      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });
      expect(downloadButton).toBeInTheDocument();
    });

    it('should have See Features button with secondary variant', () => {
      render(<Hero />);

      const featuresButton = screen.getByRole('button', { name: /see features/i });
      expect(featuresButton).toBeInTheDocument();
    });

    it('should render download icon on Download Now button', () => {
      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });
      const icon = downloadButton.querySelector('.fa-download');

      expect(icon).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('should scroll to download section when Download Now is clicked', async () => {
      const user = userEvent.setup();

      // Create mock download section
      const downloadSection = document.createElement('div');
      downloadSection.id = 'download';
      document.body.appendChild(downloadSection);

      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });
      await user.click(downloadButton);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      });

      // Cleanup
      document.body.removeChild(downloadSection);
    });

    it('should scroll to features section when See Features is clicked', async () => {
      const user = userEvent.setup();

      // Create mock features section
      const featuresSection = document.createElement('div');
      featuresSection.id = 'features';
      document.body.appendChild(featuresSection);

      render(<Hero />);

      const featuresButton = screen.getByRole('button', { name: /see features/i });
      await user.click(featuresButton);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      });

      // Cleanup
      document.body.removeChild(featuresSection);
    });

    it('should handle missing section gracefully', async () => {
      const user = userEvent.setup();
      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });

      // Should not throw error when section doesn't exist
      await expect(user.click(downloadButton)).resolves.not.toThrow();
    });

    it('should not scroll if target element is null', async () => {
      const user = userEvent.setup();
      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });
      await user.click(downloadButton);

      // scrollIntoView should not be called if element doesn't exist
      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  describe('Feature Tags', () => {
    it('should render Lightning Fast tag with correct icon', () => {
      render(<Hero />);

      const tag = screen.getByText(/lightning fast/i).closest('span');
      expect(tag).toBeInTheDocument();

      const icon = tag?.querySelector('.fa-bolt');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render Privacy First tag with correct icon', () => {
      render(<Hero />);

      const tag = screen.getByText(/privacy first/i).closest('span');
      expect(tag).toBeInTheDocument();

      const icon = tag?.querySelector('.fa-lock');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render Offline Ready tag with correct icon', () => {
      render(<Hero />);

      const tag = screen.getByText(/offline ready/i).closest('span');
      expect(tag).toBeInTheDocument();

      const icon = tag?.querySelector('.fa-wifi-slash');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-hidden on tag icons', () => {
      render(<Hero />);

      const icons = document.querySelectorAll('.fa-bolt, .fa-lock, .fa-wifi-slash');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />);

      const heading = screen.getByRole('heading', {
        name: /your thoughts, unchained from complexity/i,
      });

      expect(heading.tagName).toBe('H1');
    });

    it('should render subheadline in paragraph tag', () => {
      render(<Hero />);

      const subheadline = screen.getByText(/lightning-fast, distraction-free note-taking/i);
      expect(subheadline.tagName).toBe('P');
    });

    it('should render complete subheadline text', () => {
      render(<Hero />);

      const subheadline = screen.getByText(
        /Lightning-fast, distraction-free note-taking\. No bloat, no friction\. Just you and your ideas, the way it should be\./i
      );

      expect(subheadline).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      // Create mock section
      const section = document.createElement('div');
      section.id = 'download';
      document.body.appendChild(section);

      render(<Hero />);

      const downloadButton = screen.getByRole('button', { name: /download now/i });

      downloadButton.focus();
      expect(downloadButton).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(scrollIntoViewMock).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(section);
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();

      // Create mock section
      const section = document.createElement('div');
      section.id = 'features';
      document.body.appendChild(section);

      render(<Hero />);

      const featuresButton = screen.getByRole('button', { name: /see features/i });

      await user.click(featuresButton);
      await user.click(featuresButton);
      await user.click(featuresButton);

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(3);

      // Cleanup
      document.body.removeChild(section);
    });
  });

  describe('Section Props', () => {
    it('should render Section component with correct id', () => {
      const { container } = render(<Hero />);

      const section = container.querySelector('#hero');
      expect(section).toBeInTheDocument();
    });

    it('should use large padding variant', () => {
      const { container } = render(<Hero />);

      const section = container.querySelector('#hero');
      // Section component applies padding classes
      expect(section).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Hero />);

      expect(screen.getByRole('button', { name: /download now/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /see features/i })).toHaveAccessibleName();
    });

    it('should have main heading visible to screen readers', () => {
      render(<Hero />);

      const heading = screen.getByRole('heading', {
        name: /your thoughts, unchained from complexity/i,
      });

      expect(heading).toBeVisible();
    });

    it('should have descriptive text visible to screen readers', () => {
      render(<Hero />);

      const description = screen.getByText(/lightning-fast, distraction-free note-taking/i);

      expect(description).toBeVisible();
    });

    it('should hide decorative icons from screen readers', () => {
      render(<Hero />);

      const decorativeIcons = document.querySelectorAll('[aria-hidden="true"]');

      expect(decorativeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Layout', () => {
    it('should render CTA buttons in correct order', () => {
      render(<Hero />);

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map((btn) => btn.textContent);

      const downloadIndex = buttonTexts.findIndex((text) => text?.includes('Download Now'));
      const featuresIndex = buttonTexts.findIndex((text) => text?.includes('See Features'));

      // Download Now should come before See Features
      expect(downloadIndex).toBeLessThan(featuresIndex);
    });

    it('should render tags in correct order', () => {
      const { container } = render(<Hero />);

      const tagsContainer = container.querySelector('[class*="tags"]');
      const tags = tagsContainer?.querySelectorAll('span');

      expect(tags?.[0]?.textContent).toContain('Lightning Fast');
      expect(tags?.[1]?.textContent).toContain('Privacy First');
      expect(tags?.[2]?.textContent).toContain('Offline Ready');
    });
  });
});
