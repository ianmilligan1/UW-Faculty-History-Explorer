import { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import ChartCard from './ChartCard';
import SourceCalendarBanner from './SourceCalendarBanner';
import { makeChartClickHandler } from '../utils/chartHelpers';

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

const RANK_COLORS = {
  'Lecturer': '#9e9e9e',
  'Assistant Professor': '#FFC107',
  'Associate Professor': '#FFD54F',
  'Professor': '#1a1a1a',
};

export default function RankProgression({ data }) {
  const [pinnedData, setPinnedData] = useState(null);

  // Rank distribution over time (as percentage)
  const rankPctByYear = useMemo(() => {
    return data.rankDistByYear.map(d => {
      const total = d['Professor'] + d['Associate Professor'] + d['Assistant Professor'] + d['Lecturer'] + d['Other'];
      return {
        year: d.year,
        Professor: total ? Math.round((d['Professor'] / total) * 100) : 0,
        'Associate Professor': total ? Math.round((d['Associate Professor'] / total) * 100) : 0,
        'Assistant Professor': total ? Math.round((d['Assistant Professor'] / total) * 100) : 0,
        Lecturer: total ? Math.round((d['Lecturer'] / total) * 100) : 0,
      };
    });
  }, [data]);

  // Promotion analysis: for people with multiple ranks, how long at each before promotion?
  const promotionStats = useMemo(() => {
    const transitions = [];
    const timeAtRank = {};

    data.people.forEach(person => {
      if (person.rankProgression.length < 2) return;

      for (let i = 0; i < person.rankProgression.length - 1; i++) {
        const from = person.rankProgression[i];
        const to = person.rankProgression[i + 1];
        if (to.level > from.level) {
          const yearsAtRank = to.year - from.year;
          const key = `${from.rank} → ${to.rank}`;
          transitions.push({ from: from.rank, to: to.rank, years: yearsAtRank, key });
        }
      }
    });

    // Aggregate by transition type
    const transMap = {};
    transitions.forEach(t => {
      if (!transMap[t.key]) transMap[t.key] = { key: t.key, from: t.from, to: t.to, durations: [] };
      transMap[t.key].durations.push(t.years);
    });

    return Object.values(transMap)
      .map(t => ({
        ...t,
        count: t.durations.length,
        avg: (t.durations.reduce((a, b) => a + b, 0) / t.durations.length).toFixed(1),
        median: t.durations.sort((a, b) => a - b)[Math.floor(t.durations.length / 2)],
        min: Math.min(...t.durations),
        max: Math.max(...t.durations),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Entry rank distribution: what rank did people start at?
  const entryRanks = useMemo(() => {
    const counts = {};
    data.people.forEach(p => {
      if (p.rankProgression.length > 0) {
        const entry = p.rankProgression[0].rank;
        counts[entry] = (counts[entry] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([rank, count]) => ({ rank, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // People who made it from Assistant to Full Professor
  const fullPipeline = useMemo(() => {
    return data.people.filter(p => {
      const ranks = p.rankProgression.map(r => r.rank);
      return ranks.includes('Assistant Professor') && ranks.includes('Professor');
    }).length;
  }, [data]);

  // Promotion timeline: number of promotions by year
  const promotionsByYear = useMemo(() => {
    const byYear = {};
    data.people.forEach(person => {
      for (let i = 1; i < person.rankProgression.length; i++) {
        const prev = person.rankProgression[i - 1];
        const curr = person.rankProgression[i];
        if (curr.level > prev.level) {
          const year = curr.year;
          byYear[year] = (byYear[year] || 0) + 1;
        }
      }
    });
    return data.allYears.map(year => ({
      year,
      promotions: byYear[year] || 0,
    }));
  }, [data]);

  const handleRankPctClick = useCallback(
    (d) => makeChartClickHandler(rankPctByYear, [
      { key: 'Professor', name: 'Professor', color: '#1a1a1a' },
      { key: 'Associate Professor', name: 'Associate Professor', color: '#FFD54F' },
      { key: 'Assistant Professor', name: 'Assistant Professor', color: '#FFC107' },
      { key: 'Lecturer', name: 'Lecturer', color: '#9e9e9e' },
    ], setPinnedData)(d),
    [rankPctByYear]
  );
  const handlePromotionsClick = useCallback(
    (d) => makeChartClickHandler(promotionsByYear, [{ key: 'promotions', name: 'Promotions', color: '#FFD54F' }], setPinnedData)(d),
    [promotionsByYear]
  );

  return (
    <div className="space-y-6 mt-6">
      <SourceCalendarBanner data={pinnedData} onClose={() => setPinnedData(null)} />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gray-900">
            {data.people.filter(p => p.rankProgression.length >= 2).length}
          </p>
          <p className="text-sm text-uw-gray-500 mt-1">Faculty with promotions observed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gold-dark">{fullPipeline}</p>
          <p className="text-sm text-uw-gray-500 mt-1">Reached Full Professor from Assistant</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-uw-gray-900">
            {promotionStats.length > 0 ? promotionStats[0].avg : '–'}
          </p>
          <p className="text-sm text-uw-gray-500 mt-1">
            Avg. years for most common promotion
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Rank Distribution Over Time (%)"
          subtitle="Percentage of faculty at each rank"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={rankPctByYear} onClick={handleRankPctClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="Professor" stackId="1" fill="#1a1a1a" stroke="#1a1a1a" />
              <Area type="monotone" dataKey="Associate Professor" stackId="1" fill="#FFD54F" stroke="#FFD54F" />
              <Area type="monotone" dataKey="Assistant Professor" stackId="1" fill="#FFC107" stroke="#FFC107" />
              <Area type="monotone" dataKey="Lecturer" stackId="1" fill="#bdbdbd" stroke="#9e9e9e" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Promotions Per Year"
          subtitle="Number of rank increases observed"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={promotionsByYear} onClick={handlePromotionsClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="promotions" name="Promotions" fill="#FFD54F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Entry Rank Distribution"
        subtitle="Rank at which faculty first appeared at UW"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={entryRanks.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="rank" tick={{ fontSize: 11 }} width={160} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Faculty" fill="#FFD54F" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Promotion Pathways"
        subtitle="Average time spent at each rank before promotion"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-uw-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-uw-gray-500">Transition</th>
                <th className="text-right py-2 pr-4 font-medium text-uw-gray-500">Count</th>
                <th className="text-right py-2 pr-4 font-medium text-uw-gray-500">Avg. Years</th>
                <th className="text-right py-2 pr-4 font-medium text-uw-gray-500">Median</th>
                <th className="text-right py-2 font-medium text-uw-gray-500">Range</th>
              </tr>
            </thead>
            <tbody>
              {promotionStats.map(t => (
                <tr key={t.key} className="border-b border-uw-gray-100 hover:bg-uw-gray-100/50">
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-uw-gray-100 text-uw-gray-700">
                        {t.from}
                      </span>
                      <span className="text-uw-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-uw-gold/20 text-uw-gray-900">
                        {t.to}
                      </span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-medium">{t.count}</td>
                  <td className="py-2.5 pr-4 text-right">{t.avg} yrs</td>
                  <td className="py-2.5 pr-4 text-right">{t.median} yrs</td>
                  <td className="py-2.5 text-right text-uw-gray-500">{t.min}–{t.max} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
