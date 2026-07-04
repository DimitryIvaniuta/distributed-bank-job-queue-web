import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '../../components/ui/Card';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <Card>
        <div className="empty-state">
          <div className="empty-state__icon">
            <Compass />
          </div>
          <span className="eyebrow">404</span>
          <h1>Page not found</h1>
          <p>The requested operations route does not exist.</p>
          <Link className="button button--primary" to="/">
            Return to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
