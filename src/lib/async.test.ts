import { mapSettledWithConcurrency } from './async';

describe('mapSettledWithConcurrency', () => {
  it('preserves order, limits concurrency, and isolates failures', async () => {
    let active = 0;
    let peak = 0;
    const results = await mapSettledWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await Promise.resolve();
      active -= 1;
      if (value === 3) {
        throw new Error('failed');
      }
      return value * 10;
    });

    expect(peak).toBeLessThanOrEqual(2);
    expect(results[0]).toEqual({ status: 'fulfilled', value: 10 });
    expect(results[2]).toMatchObject({ status: 'rejected' });
    expect(results[4]).toEqual({ status: 'fulfilled', value: 50 });
  });

  it('rejects invalid concurrency', async () => {
    await expect(
      mapSettledWithConcurrency([1], 0, (value) => Promise.resolve(value)),
    ).rejects.toThrow('Concurrency must be a positive integer');
  });
});
