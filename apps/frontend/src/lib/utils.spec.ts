import { describe, it, expect } from 'vitest';
import { cn, isActiveRoute, formatDate, formatRelativeTime, truncate, pluralize } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resolves conflicts using tailwind-merge', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });
});

describe('isActiveRoute', () => {
  it('matches dashboard route exactly', () => {
    expect(isActiveRoute('/dashboard', '/dashboard')).toBe(true);
  });

  it('does not match dashboard with trailing slash', () => {
    expect(isActiveRoute('/dashboard/', '/dashboard')).toBe(false);
  });

  it('does not match dashboard for sub-routes', () => {
    expect(isActiveRoute('/dashboard/settings', '/dashboard')).toBe(false);
  });

  it('matches prefix routes', () => {
    expect(isActiveRoute('/documents/123', '/documents')).toBe(true);
    expect(isActiveRoute('/chat/new', '/chat')).toBe(true);
  });

  it('does not match unrelated routes', () => {
    expect(isActiveRoute('/documents', '/quiz')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-06-14T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('14');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2026, 0, 1));
    expect(result).toContain('Jan');
    expect(result).toContain('1');
    expect(result).toContain('2026');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent dates', () => {
    expect(formatRelativeTime(new Date())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });

  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2025-01-01');
    const result = formatRelativeTime(oldDate);
    expect(result).toContain('Jan');
    expect(result).toContain('1');
    expect(result).toContain('2025');
  });
});

describe('truncate', () => {
  it('returns the string when shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis when longer', () => {
    expect(truncate('hello world this is long', 10)).toBe('hello worl...');
  });

  it('trims trailing space before ellipsis', () => {
    expect(truncate('hello world', 6)).toBe('hello...');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'document')).toBe('document');
  });

  it('returns plural (suffix s) for other counts', () => {
    expect(pluralize(2, 'document')).toBe('documents');
    expect(pluralize(0, 'document')).toBe('documents');
  });

  it('uses custom plural when provided', () => {
    expect(pluralize(2, 'quiz', 'quizzes')).toBe('quizzes');
  });

  it('returns singular for count of 1 with custom plural', () => {
    expect(pluralize(1, 'quiz', 'quizzes')).toBe('quiz');
  });
});
