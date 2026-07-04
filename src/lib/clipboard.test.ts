import { copyText } from './clipboard';

describe('copyText', () => {
  it('copies through the secure Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('isSecureContext', true);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    await expect(copyText('job-id')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('job-id');
  });

  it('fails safely when clipboard access is unavailable', async () => {
    vi.stubGlobal('isSecureContext', false);
    await expect(copyText('job-id')).resolves.toBe(false);
  });
});
