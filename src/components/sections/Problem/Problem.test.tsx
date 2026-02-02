import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Problem } from './Problem';

describe('Problem Section', () => {
  it('renders the section title', () => {
    render(<Problem />);
    expect(screen.getByText('Why note-taking apps suck right now')).toBeInTheDocument();
  });

  it('renders the problem description', () => {
    render(<Problem />);
    expect(
      screen.getByText(/You just want to capture a thought before it disappears/)
    ).toBeInTheDocument();
  });

  it('renders comparison cards', () => {
    render(<Problem />);
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByText('Obsidian')).toBeInTheDocument();
    expect(screen.getByText('Evernote')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('renders the impact statement', () => {
    render(<Problem />);
    expect(screen.getByText(/You waste/)).toBeInTheDocument();
    expect(screen.getByText('You deserve better.')).toBeInTheDocument();
  });
});
