import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CandidateMatchDriftIndicatorCards } from './CandidateMatchDriftIndicatorCards';

describe('CandidateMatchDriftIndicatorCards', () => {
  afterEach(() => cleanup());
  it('C1: renders criteria-level delta chips', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    expect(screen.getByText('skills: -5')).toBeInTheDocument();
    expect(screen.getByText('domain: -2')).toBeInTheDocument();
    expect(screen.getByText('seniority: -5')).toBeInTheDocument();
    expect(screen.getAllByText('location: 0').length).toBeGreaterThan(0);
  });

  it('C2: exposes tooltip rationales on chips', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    expect(screen.getAllByTitle('Missing React 18 hooks depth').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('SaaS experience gap').length).toBeGreaterThan(0);
  });

  it('C3: filters cards by selected role', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    fireEvent.change(screen.getByLabelText('Role Filter'), { target: { value: 'Backend Engineer' } });
    expect(screen.getByText('Idan Bar — Backend Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Noa Levi — Frontend Engineer')).not.toBeInTheDocument();
  });

  it('C4: sorts cards by overall drift descending', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'driftDesc' } });
    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent('Idan Bar');
  });

  it('C5: renders sortable control set', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Drift (Ascending)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Drift (Descending)' })).toBeInTheDocument();
  });

  it('C6: renders loading fallback', () => {
    render(<CandidateMatchDriftIndicatorCards loading />);
    expect(screen.getByText('Loading drift data...')).toBeInTheDocument();
  });

  it('C7: renders empty fallback', () => {
    render(<CandidateMatchDriftIndicatorCards data={[]} />);
    expect(screen.getByText('No candidates found.')).toBeInTheDocument();
  });

  it('C8: renders error fallback', () => {
    render(<CandidateMatchDriftIndicatorCards error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('C9: shows signed positive delta values', () => {
    render(<CandidateMatchDriftIndicatorCards />);
    expect(screen.getAllByText('skills: +2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('domain: +2').length).toBeGreaterThan(0);
  });
});
