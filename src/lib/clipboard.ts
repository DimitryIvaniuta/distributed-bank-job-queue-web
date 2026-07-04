/** Copies text only through the secure Clipboard API and reports failure safely. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!window.isSecureContext || navigator.clipboard === undefined) {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
