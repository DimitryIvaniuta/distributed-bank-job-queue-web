/**
 * Executes asynchronous work with a fixed concurrency ceiling while preserving
 * input order. Individual failures are returned instead of cancelling the batch.
 */
export async function mapSettledWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError('Concurrency must be a positive integer');
  }

  const results: (PromiseSettledResult<R> | undefined)[] = Array.from({
    length: items.length,
  });
  let cursor = 0;

  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      if (item === undefined) {
        continue;
      }
      try {
        results[index] = { status: 'fulfilled', value: await task(item, index) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => worker()),
  );
  return results.map((result) => {
    if (result === undefined) {
      throw new Error('Concurrency worker did not produce a result');
    }
    return result;
  });
}
