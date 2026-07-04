import { act, render, screen } from '@testing-library/react';

import { App } from './App';
import { AppProviders } from './AppProviders';
import { queryClient } from './queryClient';

describe('App', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it('renders the banking shell, all backend workflows, and live health state', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'UP' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    window.history.pushState({}, '', '/');

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    await act(async () => vi.dynamicImportSettled());

    expect(
      await screen.findByRole('heading', { name: 'Distributed job queue' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Transfer settlement' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Reconciliation/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Statement/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Find a job' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Replay dead letter' })).toBeInTheDocument();
    expect(await screen.findByText('Service operational')).toBeInTheDocument();
    expect(document.title).toBe('Dashboard · BankFlow Queue Console');
  });
});
