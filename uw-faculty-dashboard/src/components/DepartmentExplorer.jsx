import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { Search } from 'lucide-react';
import ChartCard from './ChartCard';
import { getCalendarPdfUrl } from '../utils/calendarUrls';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const year = Number(label);
  return (
    <div className="bg-white border border-uw-gray-300 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-uw-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
      {year >= 1963 && year <= 1978 && (
        <a
          href={getCalendarPdfUrl(year)}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-1.5 text-xs text-uw-gold-dark hover:underline"
          onClick={e => e.stopPropagation()}
        >
          View source calendar →
        </a>
      )}
    </div>
  );
};

export default function DepartmentExplorer({ data }) {
  const [selectedDept, setSelectedDept] = useState('');
  const [deptSearch, setDeptSearch] = useState('');

  const filteredDepts = useMemo(() => {
    if (!deptSearch) return data.allDepartments;
    const q = deptSearch.toLowerCase();
    return data.allDepartments.filter(d => d.toLowerCase().includes(q));
  }, [data.allDepartments, deptSearch]);

  const dept = selectedDept || filteredDepts[0] || '';

  const deptData = useMemo(() => {
    if (!dept) return null;

    const deptRows = data.rows.filter(r => r.department === dept);
    const years = [...new Set(deptRows.map(r => r.year))].sort((a, b) => a - b);

    // Faculty count over time
    const countByYear = years.map(year => {
      const yearRows = deptRows.filter(r => r.year === year);
      const unique = new Set(yearRows.map(r => r.personId));
      return { year, count: unique.size };
    });

    // People in this department
    const peopleIds = new Set(deptRows.map(r => r.personId));
    const deptPeople = data.people
      .filter(p => peopleIds.has(p.id))
      .sort((a, b) => a.firstYear - b.firstYear || a.lastname.localeCompare(b.lastname));

    // Rank distribution over time
    const mainRanks = ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];
    const rankDist = years.map(year => {
      const yearRows = deptRows.filter(r => r.year === year);
      const dist = { year };
      for (const rank of mainRanks) {
        dist[rank] = yearRows.filter(r => r.rank === rank).length;
      }
      return dist;
    });

    return { countByYear, deptPeople, rankDist, years };
  }, [dept, data]);

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Department selector */}
        <div className="lg:col-span-1">
          <ChartCard title="Departments">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uw-gray-400" />
              <input
                type="text"
                placeholder="Filter departments..."
                value={deptSearch}
                onChange={e => setDeptSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-uw-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uw-gold/50 focus:border-uw-gold"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-0.5">
              {filteredDepts.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(d)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    d === dept
                      ? 'bg-uw-gold/20 text-uw-black font-medium'
                      : 'text-uw-gray-700 hover:bg-uw-gray-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Department detail */}
        <div className="lg:col-span-3 space-y-6">
          {deptData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard
                  title={`${dept}: Faculty Count`}
                  subtitle="Unique faculty per year"
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={deptData.countByYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Faculty"
                        stroke="#FFC107"
                        fill="#FFD54F"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title={`${dept}: Rank Distribution`}
                  subtitle="Faculty by rank over time"
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={deptData.rankDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Professor" stackId="a" fill="#1a1a1a" />
                      <Bar dataKey="Associate Professor" stackId="a" fill="#FFD54F" />
                      <Bar dataKey="Assistant Professor" stackId="a" fill="#FFC107" />
                      <Bar dataKey="Lecturer" stackId="a" fill="#9e9e9e" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard
                title={`Faculty in ${dept}`}
                subtitle={`${deptData.deptPeople.length} people total`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-uw-gray-200">
                        <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Name</th>
                        <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Years</th>
                        <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Ranks</th>
                        <th className="text-left py-2 font-medium text-uw-gray-500">Degree</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptData.deptPeople.map(person => (
                        <tr key={person.id} className="border-b border-uw-gray-100 hover:bg-uw-gray-100/50">
                          <td className="py-2 pr-4 font-medium text-uw-gray-900">
                            {person.displayName}
                          </td>
                          <td className="py-2 pr-4 text-uw-gray-600">
                            {person.firstYear}–{person.lastYear}
                          </td>
                          <td className="py-2 pr-4 text-uw-gray-600">
                            {person.ranks.join(', ')}
                          </td>
                          <td className="py-2 text-uw-gray-600">
                            {person.highestDegree}
                            {person.locations.length > 0 && (
                              <span className="text-uw-gray-400 ml-1">
                                ({person.locations[0]})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
