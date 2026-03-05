import { useState, useMemo } from 'react';
import { Search, User, Calendar, BookOpen, Award, Building2 } from 'lucide-react';
import ChartCard from './ChartCard';

const AFFILIATE_LABELS = {
  'J': 'St. Jerome\'s College',
  'G': 'Conrad Grebel College',
  'R': 'Renison College',
  'P': 'St. Paul\'s College',
};

export default function IndividualLookup({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return data.people
      .filter(p =>
        p.displayName.toLowerCase().includes(q) ||
        p.lastname.toLowerCase().includes(q) ||
        p.firstname.toLowerCase().includes(q)
      )
      .sort((a, b) => a.lastname.localeCompare(b.lastname))
      .slice(0, 50);
  }, [data, searchQuery]);

  const personDetail = useMemo(() => {
    if (!selectedPerson) return null;

    // Build year-by-year timeline
    const timeline = selectedPerson.entries
      .sort((a, b) => a.year - b.year || a.department.localeCompare(b.department))
      .map(e => ({
        year: e.year,
        department: e.department,
        rank: e.rank,
        degree: e.degree,
        location: e.location,
        other: e.other,
        affiliate: e.affiliate,
        adminRoles: e.adminRoles,
        isPartTime: e.isPartTime,
        isOnLeave: e.isOnLeave,
      }));

    return {
      ...selectedPerson,
      timeline,
    };
  }, [selectedPerson]);

  return (
    <div className="space-y-6 mt-6">
      <ChartCard title="Faculty Search" subtitle="Search by name to see a person's full history at UW">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-uw-gray-400" />
          <input
            type="text"
            placeholder="Search by name (e.g., Tutte, Stanton, McBryde)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSelectedPerson(null);
            }}
            className="w-full pl-10 pr-4 py-3 text-base border border-uw-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-uw-gold/50 focus:border-uw-gold"
          />
        </div>

        {searchResults.length > 0 && !selectedPerson && (
          <div className="mt-3 max-h-80 overflow-y-auto border border-uw-gray-200 rounded-lg divide-y divide-uw-gray-100">
            {searchResults.map(person => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="w-full text-left px-4 py-3 hover:bg-uw-gold/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-uw-gray-900">{person.displayName}</span>
                    <span className="text-sm text-uw-gray-500 ml-2">
                      {person.departments.slice(0, 2).join(', ')}
                      {person.departments.length > 2 && ` +${person.departments.length - 2}`}
                    </span>
                  </div>
                  <span className="text-sm text-uw-gray-400">
                    {person.firstYear}–{person.lastYear}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ChartCard>

      {personDetail && (
        <div className="space-y-6">
          {/* Person header */}
          <div className="bg-uw-black text-white rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-uw-gold/20 p-3 rounded-full">
                <User className="w-8 h-8 text-uw-gold" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{personDetail.displayName}</h2>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-uw-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {personDetail.firstYear}–{personDetail.lastYear}{' '}
                    ({personDetail.yearsPresent} year{personDetail.yearsPresent !== 1 ? 's' : ''} present)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {personDetail.departments.join(', ')}
                  </span>
                  {personDetail.highestDegree && (
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {personDetail.highestDegree}
                      {personDetail.locations.length > 0 && ` (${personDetail.locations.join(', ')})`}
                    </span>
                  )}
                  {personDetail.affiliates.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      {personDetail.affiliates.map(a => AFFILIATE_LABELS[a] || a).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rank progression visual */}
          {personDetail.rankProgression.length > 0 && (
            <ChartCard title="Career Progression" subtitle="Rank changes over time">
              <div className="flex flex-wrap gap-2 items-center">
                {personDetail.rankProgression.map((rp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-uw-gold/15 border border-uw-gold/30 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-uw-gray-500">{rp.year}</p>
                      <p className="text-sm font-medium text-uw-gray-900">{rp.rank}</p>
                    </div>
                    {i < personDetail.rankProgression.length - 1 && (
                      <span className="text-uw-gray-400 text-lg">→</span>
                    )}
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {/* Administrative roles */}
          {personDetail.adminRoles.length > 0 && (
            <ChartCard title="Administrative Roles">
              <div className="space-y-2">
                {personDetail.adminRoles.map((ar, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-uw-gray-500 w-10 text-right">{ar.year}</span>
                    <span className="flex-1">
                      {ar.roles.map(r => (
                        <span key={r} className="inline-block px-2 py-0.5 rounded text-xs bg-uw-gold/15 text-uw-gray-800 mr-1">
                          {r}
                        </span>
                      ))}
                      <span className="text-uw-gray-500 ml-1">in {ar.department}</span>
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {/* Full timeline */}
          <ChartCard title="Year-by-Year Record" subtitle="Complete listing from university calendars">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-uw-gray-200">
                    <th className="text-left py-2 pr-3 font-medium text-uw-gray-500 w-16">Year</th>
                    <th className="text-left py-2 pr-3 font-medium text-uw-gray-500">Department</th>
                    <th className="text-left py-2 pr-3 font-medium text-uw-gray-500">Rank</th>
                    <th className="text-left py-2 pr-3 font-medium text-uw-gray-500">Degree</th>
                    <th className="text-left py-2 font-medium text-uw-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {personDetail.timeline.map((entry, i) => (
                    <tr key={i} className="border-b border-uw-gray-100 hover:bg-uw-gray-100/50">
                      <td className="py-2 pr-3 font-medium text-uw-gray-900">{entry.year}</td>
                      <td className="py-2 pr-3 text-uw-gray-700">{entry.department}</td>
                      <td className="py-2 pr-3 text-uw-gray-700">{entry.rank}</td>
                      <td className="py-2 pr-3 text-uw-gray-500">
                        {entry.degree}
                        {entry.location && <span className="text-uw-gray-400"> ({entry.location})</span>}
                      </td>
                      <td className="py-2 text-uw-gray-500">
                        {entry.other && (
                          <span className="text-xs px-2 py-0.5 rounded bg-uw-gray-100 text-uw-gray-600">
                            {entry.other}
                          </span>
                        )}
                        {entry.affiliate && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-1">
                            {AFFILIATE_LABELS[entry.affiliate] || entry.affiliate}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Browse by department if no search */}
      {!selectedPerson && searchQuery.length < 2 && (
        <ChartCard
          title="Browse Faculty"
          subtitle={`${data.people.length} unique faculty members across ${data.stats.totalDepartments} departments`}
        >
          <p className="text-sm text-uw-gray-500">
            Type a name above to search. You can search by first name, last name, or initials.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.allDepartments.slice(0, 15).map(dept => {
              const deptPeople = data.people.filter(p => p.departments.includes(dept));
              return (
                <div key={dept} className="border border-uw-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-uw-gray-900">{dept}</p>
                  <p className="text-xs text-uw-gray-500 mt-0.5">{deptPeople.length} faculty</p>
                  <div className="mt-2 text-xs text-uw-gray-600">
                    {deptPeople.slice(0, 3).map(p => p.displayName).join(', ')}
                    {deptPeople.length > 3 && ` +${deptPeople.length - 3} more`}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
