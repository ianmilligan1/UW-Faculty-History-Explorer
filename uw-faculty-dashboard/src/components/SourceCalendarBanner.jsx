import { X, ExternalLink } from 'lucide-react';
import { getCalendarPdfUrl } from '../utils/calendarUrls';

export default function SourceCalendarBanner({ data, onClose }) {
  if (!data) return null;
  const { year, payload } = data;
  const numYear = Number(year);
  const nextYearSuffix = String((numYear + 1) % 100).padStart(2, '0');

  return (
    <div className="flex items-center justify-between gap-4 mt-3 px-3 py-2.5 bg-uw-gold/10 border border-uw-gold/20 rounded-lg text-sm animate-in">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-uw-gray-900">{year}</span>
        <span className="text-uw-gray-400">|</span>
        {payload.map((entry, i) => (
          <span key={i} className="text-uw-gray-700">
            {entry.name}: <span className="font-medium" style={{ color: entry.color }}>{entry.value}</span>
          </span>
        ))}
        <span className="text-uw-gray-400">|</span>
        <a
          href={getCalendarPdfUrl(numYear)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-uw-gold-dark hover:underline"
        >
          View {year}–{nextYearSuffix} calendar
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <button
        onClick={onClose}
        className="text-uw-gray-400 hover:text-uw-gray-600 shrink-0 cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
