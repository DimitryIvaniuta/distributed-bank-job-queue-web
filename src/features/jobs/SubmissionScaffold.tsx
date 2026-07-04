import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export function SubmissionScaffold({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page-stack">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="content-grid content-grid--form">
        <Card className="form-card">{children}</Card>
        <aside className="guidance-card">
          <div className="guidance-card__icon">
            <ShieldCheck size={22} />
          </div>
          <span className="eyebrow">Safe submission</span>
          <h2>Idempotency is part of the request</h2>
          <p>
            Retrying with the same key and identical content returns the original job. Reusing that
            key for different content is rejected with HTTP 409.
          </p>
          <ul className="check-list">
            <li>Keys are sent in the Idempotency-Key header.</li>
            <li>High and low work use physically separate Kafka topics.</li>
            <li>Committed business effects remain unique after redelivery.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
