import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
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

export default function AdminRoles({ data }) {
  const [roleFilter, setRoleFilter] = useState('All');

  // All admin appointments
  const allAppointments = useMemo(() => {
    const appointments = [];
    data.people.forEach(person => {
      person.adminRoles.forEach(ar => {
        ar.roles.forEach(role => {
          appointments.push({
            name: person.displayName,
            personId: person.id,
            role,
            year: ar.year,
            department: ar.department,
            raw: ar.raw,
          });
        });
      });
    });
    return appointments.sort((a, b) => a.year - b.year || a.role.localeCompare(b.role));
  }, [data]);

  // Unique roles
  const allRoleTypes = useMemo(() => {
    const roles = new Set(allAppointments.map(a => a.role));
    return ['All', ...Array.from(roles).sort()];
  }, [allAppointments]);

  // Filtered appointments
  const filtered = useMemo(() => {
    if (roleFilter === 'All') return allAppointments;
    return allAppointments.filter(a => a.role === roleFilter);
  }, [allAppointments, roleFilter]);

  // Admin counts by year
  const adminByYear = useMemo(() => {
    return data.allYears.map(year => {
      const yearAppts = filtered.filter(a => a.year === year);
      const uniquePeople = new Set(yearAppts.map(a => a.personId));
      return { year, appointments: yearAppts.length, people: uniquePeople.size };
    });
  }, [data, filtered]);

  // Role type distribution
  const roleDistribution = useMemo(() => {
    const counts = {};
    allAppointments.forEach(a => {
      counts[a.role] = (counts[a.role] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  }, [allAppointments]);

  // People with most admin years
  const topAdmins = useMemo(() => {
    const adminYears = {};
    allAppointments.forEach(a => {
      const key = a.personId;
      if (!adminYears[key]) {
        adminYears[key] = { name: a.name, personId: a.personId, years: new Set(), roles: new Set(), depts: new Set() };
      }
      adminYears[key].years.add(a.year);
      adminYears[key].roles.add(a.role);
      adminYears[key].depts.add(a.department);
    });
    return Object.values(adminYears)
      .map(a => ({
        ...a,
        yearCount: a.years.size,
        roles: [...a.roles],
        depts: [...a.depts],
        yearRange: `${Math.min(...a.years)}–${Math.max(...a.years)}`,
      }))
      .sort((a, b) => b.yearCount - a.yearCount)
      .slice(0, 20);
  }, [allAppointments]);

  // Deduplicated appointments for the table
  const tableAppointments = useMemo(() => {
    const seen = new Map();
    filtered.forEach(a => {
      const key = `${a.personId}__${a.role}__${a.department}`;
      if (!seen.has(key)) {
        seen.set(key, { ...a, years: [a.year] });
      } else {
        seen.get(key).years.push(a.year);
      }
    });
    return [...seen.values()]
      .map(a => ({
        ...a,
        yearRange: a.years.length === 1
          ? `${a.years[0]}`
          : `${Math.min(...a.years)}–${Math.max(...a.years)}`,
        duration: a.years.length,
      }))
      .sort((a, b) => b.duration - a.duration || a.name.localeCompare(b.name));
  }, [filtered]);

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gray-900">
            {new Set(allAppointments.map(a => a.personId)).size}
          </p>
          <p className="text-sm text-uw-gray-500 mt-1">Faculty with administrative roles</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gold-dark">{allAppointments.length}</p>
          <p className="text-sm text-uw-gray-500 mt-1">Total admin person-years</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gray-900">{roleDistribution.length}</p>
          <p className="text-sm text-uw-gray-500 mt-1">Distinct role types</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Administrative Appointments Over Time"
          subtitle={roleFilter === 'All' ? 'All roles' : `Filtered to: ${roleFilter}`}
        >
          <div className="mb-3">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-uw-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-uw-gold/50"
            >
              {allRoleTypes.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={adminByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="people"
                name="People with admin roles"
                stroke="#FFD54F"
                strokeWidth={2}
                dot={{ fill: '#FFC107', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Role Type Distribution"
          subtitle="Total person-years by role type"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={roleDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="role" tick={{ fontSize: 11 }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Person-years" fill="#FFD54F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Longest-Serving Administrators"
        subtitle="Faculty with the most years in administrative roles"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-uw-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Name</th>
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Roles</th>
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Department(s)</th>
                <th className="text-right py-2 pr-4 font-medium text-uw-gray-500">Admin Years</th>
                <th className="text-right py-2 font-medium text-uw-gray-500">Period</th>
              </tr>
            </thead>
            <tbody>
              {topAdmins.map(admin => (
                <tr key={admin.personId} className="border-b border-uw-gray-100 hover:bg-uw-gray-100/50">
                  <td className="py-2 pr-4 font-medium text-uw-gray-900">{admin.name}</td>
                  <td className="py-2 pr-4 text-uw-gray-600">
                    {admin.roles.map(r => (
                      <span key={r} className="inline-block px-2 py-0.5 rounded text-xs bg-uw-gold/15 text-uw-gray-800 mr-1 mb-0.5">
                        {r}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 pr-4 text-uw-gray-600 text-xs">{admin.depts.join(', ')}</td>
                  <td className="py-2 pr-4 text-right font-medium">{admin.yearCount}</td>
                  <td className="py-2 text-right text-uw-gray-500">{admin.yearRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard
        title={`All Administrative Appointments${roleFilter !== 'All' ? ` (${roleFilter})` : ''}`}
        subtitle={`${tableAppointments.length} unique role assignments`}
      >
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-uw-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Name</th>
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Role</th>
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Department</th>
                <th className="text-right py-2 font-medium text-uw-gray-500">Years</th>
              </tr>
            </thead>
            <tbody>
              {tableAppointments.map((a, i) => (
                <tr key={i} className="border-b border-uw-gray-100 hover:bg-uw-gray-100/50">
                  <td className="py-1.5 pr-4 text-uw-gray-900">{a.name}</td>
                  <td className="py-1.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-uw-gold/15 text-uw-gray-800">
                      {a.role}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-uw-gray-600 text-xs">{a.department}</td>
                  <td className="py-1.5 text-right text-uw-gray-500">{a.yearRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
