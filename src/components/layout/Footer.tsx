import { runtimeConfig } from '../../config/runtimeConfig';

export function Footer() {
  return (
    <footer className="footer">
      <span>BankFlow Queue Console · v{runtimeConfig.release}</span>
      <span>At-least-once delivery · Idempotent side effects</span>
      <span>© {new Date().getFullYear()} Banking Platform Engineering</span>
    </footer>
  );
}
