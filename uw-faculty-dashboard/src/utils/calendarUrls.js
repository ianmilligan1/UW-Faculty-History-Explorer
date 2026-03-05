export const ARCHIVE_URL = 'https://academic-calendar-archive.uwaterloo.ca/undergraduate-studies/index.html';

export function getCalendarPdfUrl(year) {
  const nextYear = (year + 1) % 100;
  const suffix = String(nextYear).padStart(2, '0');
  return `http://www.ucalendar.uwaterloo.ca/6394/${year}-${suffix}.pdf`;
}
