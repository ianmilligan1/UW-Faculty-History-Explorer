import { ExternalLink } from 'lucide-react';
import { getCalendarPdfUrl } from '../utils/calendarUrls';

export default function CalendarLink({ year, label }) {
  return (
    <a
      href={getCalendarPdfUrl(year)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-uw-gold-dark hover:text-uw-gold hover:underline"
      title={`View ${year}–${(year + 1) % 100 < 10 ? '0' : ''}${(year + 1) % 100} calendar (PDF)`}
    >
      {label && <span className="text-xs">{label}</span>}
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
