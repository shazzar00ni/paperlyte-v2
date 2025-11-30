import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should render Paperlyte logo with icon and text', () => {
    render(<Footer />);

    const logoIcon = document.querySelector('.fa-feather');
    expect(logoIcon).toBeInTheDocument();
    expect(logoIcon).toHaveAttribute('aria-label', 'Paperlyte logo');

    expect(screen.getByText('Paperlyte')).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(<Footer />);
    expect(
      screen.getByText('Your thoughts, unchained from complexity')
    ).toBeInTheDocument();
  });

  it('should render Product link group', () => {
    render(<Footer />);

    expect(screen.getByText('Product')).toBeInTheDocument();

    const featuresLink = screen.getByRole('link', { name: 'Features' });
    expect(featuresLink).toBeInTheDocument();
    expect(featuresLink).toHaveAttribute('href', '#features');

    const downloadLink = screen.getByRole('link', { name: 'Download' });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '#download');
  });

  it('should render Legal link group', () => {
    render(<Footer />);

    expect(screen.getByText('Legal')).toBeInTheDocument();

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '#privacy');

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '#terms');
  });

  it('should render Connect link group with social links', () => {
    render(<Footer />);

    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('should render GitHub link with proper attributes', () => {
    render(<Footer />);

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubIcon = document.querySelector('.fa-github');
    expect(githubIcon).toBeInTheDocument();
  });

  it('should render Twitter link with proper attributes', () => {
    render(<Footer />);

    const twitterLink = screen.getByRole('link', { name: 'Twitter' });
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');

    const twitterIcon = document.querySelector('.fa-twitter');
    expect(twitterIcon).toBeInTheDocument();
  });

  it('should render Email link with mailto', () => {
    render(<Footer />);

    const emailLink = screen.getByRole('link', { name: 'Email' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@paperlyte.com');
    expect(emailLink).not.toHaveAttribute('target');

    const emailIcon = document.querySelector('.fa-envelope');
    expect(emailIcon).toBeInTheDocument();
  });

  it('should render copyright with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Paperlyte. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    const { container } = render(<Footer />);

    // Check that link groups use proper heading structure
    const headings = container.querySelectorAll('h3');
    expect(headings).toHaveLength(3); // Product, Legal, Connect

    // Check that links are in lists
    const lists = container.querySelectorAll('ul');
    expect(lists.length).toBeGreaterThanOrEqual(2); // Product and Legal lists
  });

  it('should render all navigation sections', () => {
    const { container } = render(<Footer />);

    // Check all major sections are present
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();

    // Verify footer has the expected structure
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
