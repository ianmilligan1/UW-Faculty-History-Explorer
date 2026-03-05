import { useState, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { Users, Building2, Calendar, TrendingUp } from 'lucide-react';
import ChartCard from './ChartCard';
import SourceCalendarBanner from './SourceCalendarBanner';
import { makeChartClickHandler } from '../utils/chartHelpers';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5">
      <div className="flex items-start gap-3">
        <div className="bg-uw-gold/15 p-2.5 rounded-lg">
          <Icon className="w-5 h-5 text-uw-gold-dark" />
        </div>
        <div>
          <p className="text-sm text-uw-gray-500">{label}</p>
          <p className="text-2xl font-bold text-uw-gray-900 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-uw-gray-500 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

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
        <p className="mt-1.5 text-xs text-uw-gray-400 italic">Click for source calendar</p>
      )}
    </div>
  );
};

export default function Overview({ data }) {
  const { stats, facultyByYear, deptsByYear, rankDistByYear } = data;
  const [pinnedData, setPinnedData] = useState(null);

  const handleGrowthClick = useCallback(
    (d) => makeChartClickHandler(facultyByYear, [{ key: 'count', name: 'Faculty', color: '#FFC107' }], setPinnedData)(d),
    [facultyByYear]
  );
  const handleDeptsClick = useCallback(
    (d) => makeChartClickHandler(deptsByYear, [{ key: 'count', name: 'Departments', color: '#212121' }], setPinnedData)(d),
    [deptsByYear]
  );
  const handleRankClick = useCallback(
    (d) => makeChartClickHandler(rankDistByYear, [
      { key: 'Professor', name: 'Professor', color: '#1a1a1a' },
      { key: 'Associate Professor', name: 'Associate Professor', color: '#FFD54F' },
      { key: 'Assistant Professor', name: 'Assistant Professor', color: '#FFC107' },
      { key: 'Lecturer', name: 'Lecturer', color: '#9e9e9e' },
    ], setPinnedData)(d),
    [rankDistByYear]
  );

  const growthRate = useMemo(() => {
    const first = facultyByYear[0]?.count || 1;
    const last = facultyByYear[facultyByYear.length - 1]?.count || 1;
    return ((last / first - 1) * 100).toFixed(0);
  }, [facultyByYear]);

  const peopleLongTenure = useMemo(() => {
    return data.people.filter(p => p.yearsPresent >= 10).length;
  }, [data]);

  return (
    <div className="space-y-6 mt-6">
      <SourceCalendarBanner data={pinnedData} onClose={() => setPinnedData(null)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Unique Faculty"
          value={stats.totalPeople.toLocaleString()}
          sub={`${peopleLongTenure} with 10+ years`}
        />
        <StatCard
          icon={Building2}
          label="Departments"
          value={stats.totalDepartments}
          sub="Across all years"
        />
        <StatCard
          icon={Calendar}
          label="Years Covered"
          value={stats.yearRange}
          sub="16 academic years"
        />
        <StatCard
          icon={TrendingUp}
          label="Growth"
          value={`${growthRate}%`}
          sub="Faculty size increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Faculty Growth Over Time"
          subtitle="Unique faculty members by academic year"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={facultyByYear} onClick={handleGrowthClick}>
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
          title="Number of Departments"
          subtitle="Departments listed in calendars by year"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={deptsByYear} onClick={handleDeptsClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Departments"
                stroke="#212121"
                fill="#424242"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Rank Distribution Over Time"
        subtitle="Number of faculty at each academic rank per year"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={rankDistByYear} onClick={handleRankClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Professor" stackId="a" fill="#1a1a1a" />
            <Bar dataKey="Associate Professor" stackId="a" fill="#FFD54F" />
            <Bar dataKey="Assistant Professor" stackId="a" fill="#FFC107" />
            <Bar dataKey="Lecturer" stackId="a" fill="#9e9e9e" />
            <Bar dataKey="Other" stackId="a" fill="#e0e0e0" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
