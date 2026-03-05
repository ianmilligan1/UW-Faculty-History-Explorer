import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import ChartCard from './ChartCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-uw-gray-300 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-uw-gray-900 mb-1">{label || payload[0]?.name}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#333' }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#FFD54F', '#FFC107', '#1a1a1a', '#616161', '#9e9e9e', '#bdbdbd', '#e0e0e0', '#424242'];

export default function DegreeOrigins({ data }) {
  const [deptFilter, setDeptFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');

  const periods = [
    { label: 'All', min: 1963, max: 1978 },
    { label: '1963–1968', min: 1963, max: 1968 },
    { label: '1969–1973', min: 1969, max: 1973 },
    { label: '1974–1978', min: 1974, max: 1978 },
  ];

  // Filter people based on dept and period
  const filteredPeople = useMemo(() => {
    let people = data.people;

    if (deptFilter !== 'All') {
      people = people.filter(p => p.departments.includes(deptFilter));
    }

    if (periodFilter !== 'All') {
      const period = periods.find(p => p.label === periodFilter);
      if (period) {
        people = people.filter(p =>
          p.years.some(y => y >= period.min && y <= period.max)
        );
      }
    }

    return people;
  }, [data, deptFilter, periodFilter]);

  // Location counts
  const locationCounts = useMemo(() => {
    const counts = {};
    filteredPeople.forEach(p => {
      p.locations.forEach(loc => {
        if (loc && loc !== 'N/A' && loc !== '?') {
          counts[loc] = (counts[loc] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPeople]);

  // Degree type distribution
  const degreeCounts = useMemo(() => {
    const counts = {};
    filteredPeople.forEach(p => {
      p.degrees.forEach(deg => {
        if (deg && deg !== 'N/A') {
          counts[deg] = (counts[deg] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPeople]);

  // Country/region grouping
  const regionGroups = useMemo(() => {
    const canadian = ['Toronto', 'Waterloo', 'McMaster', 'McGill', 'Western', 'British Columbia',
      'Queen\'s', 'Manitoba', 'Alberta', 'Saskatchewan', 'Ottawa', 'Carleton', 'Laval',
      'Montreal', 'Dalhousie', 'College of Optometry', 'Guelph'];
    const american = ['Illinois', 'Wisconsin', 'Michigan', 'MIT', 'Harvard', 'Princeton',
      'Yale', 'Stanford', 'Cornell', 'Purdue', 'Johns Hopkins', 'Chicago', 'Columbia',
      'Minnesota', 'Iowa', 'Indiana', 'Penn State', 'Pennsylvania', 'California',
      'Maryland', 'NYU', 'Duke', 'Virginia', 'Ohio State', 'Northwestern', 'Rochester'];
    const british = ['Cambridge', 'Oxford', 'London', 'Edinburgh', 'Glasgow', 'Manchester',
      'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Durham', 'Aberdeen', 'St Andrews',
      'Wales', 'Nottingham', 'Southampton', 'Imperial College', 'Exeter'];

    let ca = 0, us = 0, uk = 0, other = 0;
    locationCounts.forEach(({ name, count }) => {
      const lower = name.toLowerCase();
      if (canadian.some(c => lower.includes(c.toLowerCase()))) ca += count;
      else if (american.some(a => lower.includes(a.toLowerCase()))) us += count;
      else if (british.some(b => lower.includes(b.toLowerCase()))) uk += count;
      else other += count;
    });

    return [
      { name: 'Canadian', count: ca },
      { name: 'American', count: us },
      { name: 'British', count: uk },
      { name: 'Other', count: other },
    ].filter(g => g.count > 0);
  }, [locationCounts]);

  const top20 = locationCounts.slice(0, 20);
  const top8Degrees = degreeCounts.slice(0, 8);

  return (
    <div className="space-y-6 mt-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-uw-gray-500 mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="text-sm border border-uw-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-uw-gold/50 max-w-xs"
            >
              <option value="All">All Departments</option>
              {data.allDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-uw-gray-500 mb-1">Period</label>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="text-sm border border-uw-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-uw-gold/50"
            >
              {periods.map(p => (
                <option key={p.label} value={p.label}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-uw-gray-500">
            Showing {filteredPeople.length} faculty
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Top 20 Degree-Granting Institutions"
            subtitle="Where UW faculty earned their highest degrees"
          >
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={top20} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Faculty" fill="#FFD54F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard
            title="By Region"
            subtitle="Geographic origin of degrees"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={regionGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {regionGroups.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {regionGroups.map((g, i) => (
                <span key={g.name} className="inline-flex items-center gap-1.5 text-xs text-uw-gray-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {g.name} ({g.count})
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Degree Types"
            subtitle="Most common highest degrees"
          >
            <div className="space-y-2">
              {top8Degrees.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-uw-gray-700 w-16 text-right">{d.name}</span>
                  <div className="flex-1 bg-uw-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.count / top8Degrees[0].count) * 100}%`,
                        backgroundColor: i === 0 ? '#FFD54F' : i === 1 ? '#FFC107' : '#bdbdbd',
                      }}
                    />
                  </div>
                  <span className="text-sm text-uw-gray-500 w-10 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
