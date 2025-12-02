import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTA } from './CTA';

describe('CTA', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<CTA />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'download');
  });

  it('should render main heading', () => {
    render(<CTA />);
    expect(
      screen.getByText('Ready to declutter your mind?')
    ).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<CTA />);
    expect(
      screen.getByText(
        'Join thousands simplifying their notes. Start free, stay focused.'
      )
    ).toBeInTheDocument();
  });

  it('should render Download for Mac button', () => {
    const { container } = render(<CTA />);

    const macButton = screen.getByRole('link', { name: 'Download for Mac' });
    expect(macButton).toBeInTheDocument();
    expect(macButton).toHaveAttribute('href', '#');

    // Check for Apple icon
    const appleIcon = container.querySelector('.fa-apple');
    expect(appleIcon).toBeInTheDocument();
  });

  it('should render Download for Windows button', () => {
    const { container } = render(<CTA />);

    const windowsButton = screen.getByRole('link', {
      name: 'Download for Windows',
    });
    expect(windowsButton).toBeInTheDocument();
    expect(windowsButton).toHaveAttribute('href', '#');

    // Check for Windows icon
    const windowsIcon = container.querySelector('.fa-windows');
    expect(windowsIcon).toBeInTheDocument();
  });

  it('should render platform links for iOS, Android, and Linux', () => {
    render(<CTA />);

    expect(screen.getByText(/Also available for/i)).toBeInTheDocument();

    const iosLink = screen.getByRole('link', { name: 'iOS' });
    expect(iosLink).toBeInTheDocument();
    expect(iosLink).toHaveAttribute('href', '#');

    const androidLink = screen.getByRole('link', { name: 'Android' });
    expect(androidLink).toBeInTheDocument();
    expect(androidLink).toHaveAttribute('href', '#');

    const linuxLink = screen.getByRole('link', { name: 'Linux' });
    expect(linuxLink).toBeInTheDocument();
    expect(linuxLink).toHaveAttribute('href', '#');
  });

  it('should render GitHub badge', () => {
    const { container } = render(<CTA />);

    expect(screen.getByText('Open source on GitHub')).toBeInTheDocument();

    const githubIcon = container.querySelector('.fa-github');
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have proper heading hierarchy', () => {
    render(<CTA />);

    const mainHeading = screen.getByText('Ready to declutter your mind?');
    expect(mainHeading.tagName).toBe('H2');
  });

  it('should render download buttons with correct styling classes', () => {
    const { container } = render(<CTA />);

    const buttons = container.querySelectorAll('a[class*="downloadButton"]');
    expect(buttons).toHaveLength(2); // Mac and Windows buttons
  });

  it('should render without crashing', () => {
    const { container } = render(<CTA />);
    expect(container).toBeDefined();
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
