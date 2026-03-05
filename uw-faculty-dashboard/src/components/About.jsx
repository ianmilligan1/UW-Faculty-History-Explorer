import { BookOpen, Clock, MessageSquareQuote, User, Database } from 'lucide-react';
import ChartCard from './ChartCard';

export default function About() {
  return (
    <div className="space-y-6 mt-6 max-w-4xl mx-auto">
      <ChartCard>
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-uw-gray-900 mb-4">About This Project</h2>

          <p className="text-uw-gray-700 leading-relaxed">
            This interactive dashboard was created by{' '}
            <span className="font-semibold text-uw-gray-900">Ian Milligan</span>, Professor in the
            Department of History at the University of Waterloo, to explore the early history of the
            university's faculty through data visualization.
          </p>

          <div className="flex items-start gap-3 mt-6 mb-6 bg-uw-gold/10 border border-uw-gold/20 rounded-lg p-4">
            <Database className="w-5 h-5 text-uw-gold-dark mt-0.5 shrink-0" />
            <p className="text-uw-gray-700 leading-relaxed m-0">
              The underlying data was extracted from official University of Waterloo calendars
              (1963–1978) by{' '}
              <span className="font-semibold text-uw-gray-900">Ryan Van Koughnett</span>, PhD
              Candidate in the Department of History. Each row represents a person-year entry
              recording faculty names, departments, ranks, degrees, and administrative roles as
              published in the calendars.
            </p>
          </div>

          <div className="flex items-start gap-3 mb-6 bg-uw-gray-100 border border-uw-gray-200 rounded-lg p-4">
            <Clock className="w-5 h-5 text-uw-gray-500 mt-0.5 shrink-0" />
            <p className="text-uw-gray-700 leading-relaxed m-0">
              This entire dashboard — data processing, deduplication logic, six interactive
              sections, and deployment configuration — was built in approximately 90 minutes by{' '}
              <a
                href="https://claude.ai/code"
                className="text-uw-gold-dark hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Claude Code
              </a>{' '}
              (Anthropic's AI coding agent) from a single prompt, while Ian was in an Executive
              Committee meeting.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-uw-gray-900 mt-8 mb-3 flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-uw-gold-dark" />
            The Prompt
          </h3>
          <p className="text-sm text-uw-gray-500 mb-3">
            The following single prompt was used to generate this dashboard:
          </p>
        </div>

        <blockquote className="border-l-4 border-uw-gold bg-uw-gray-100/70 rounded-r-lg px-5 py-4 text-sm text-uw-gray-700 leading-relaxed space-y-3 font-mono">
          <p className="font-semibold text-uw-gray-900 not-italic font-sans text-base">
            Build a single-page interactive dashboard website for exploring the history of
            University of Waterloo faculty from 1963–1978.
          </p>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">Data</p>
          <p>
            The CSV file is at fulldata.csv. Start by reading and exploring this file thoroughly —
            understand the columns, the values, the quirks, and the edge cases before writing any
            code. Each row represents a person-year entry drawn from university calendars.
          </p>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">
            Data Processing — Use Your Judgment
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Deduplicate people intelligently. Names may be inconsistent across years (e.g. an
              initial "G" in one year, "George" in another, for the same person in the same
              department). Read the data, look for these patterns, and build a matching strategy
              that handles them well.
            </li>
            <li>
              Parse administrative roles from whatever columns contain them. Look at the actual data
              to determine what titles appear (Chair, Dean, Director, etc.) and where they show up.
            </li>
            <li>
              Compute career spans, rank transitions, and other derived metrics from the
              longitudinal structure of the data.
            </li>
            <li>
              If you discover interesting patterns or columns I haven't anticipated, feel free to
              surface those in the dashboard too.
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">Tech Stack</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>React with Vite</li>
            <li>Tailwind CSS</li>
            <li>Recharts or D3 for visualizations</li>
            <li>No backend — client-side only, load and parse the CSV at runtime with PapaParse</li>
            <li>Will be hosted on GitHub Pages</li>
          </ul>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">Design</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              University of Waterloo colors: black (#000000) and gold/yellow (#FFD54F) as primary,
              white for contrast, greys for secondary elements
            </li>
            <li>Clean, modern, polished dashboard</li>
            <li>Responsive</li>
            <li>
              Title: "The University of Waterloo, 1963–1978: An Interactive History"
            </li>
            <li>
              Brief subtitle explaining the data comes from faculty listings in university calendars
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">
            Dashboard Sections
          </p>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">1. Overview</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Key stats (total unique faculty, departments, year range)</li>
            <li>University growth over time (faculty count by year)</li>
          </ul>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">
            2. Department Explorer
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Select a department and see: faculty count over time, list of people with years and
              ranks, rank distribution over time
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">
            3. Rank & Career Progression
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Rank distribution across the university by year</li>
            <li>
              For people appearing in multiple years: how long did they typically spend at each rank?
              Visualize promotion patterns and the pipeline from junior to senior ranks.
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">
            4. Administrative Roles
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Who held administrative titles, when, and in which departments</li>
            <li>Count of administrative appointments over time</li>
          </ul>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">5. Degree Origins</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Where did faculty get their degrees? Show the most common institutions, filterable by
              department or time period.
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-700 not-italic font-sans">
            6. Individual Lookup
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Search by name, see a person's full timeline at UW: departments, ranks, years, roles
            </li>
          </ul>

          <p className="font-semibold text-uw-gray-800 not-italic font-sans mt-4">
            Build & Deploy
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vite + React project</li>
            <li>Include a GitHub Actions workflow for GitHub Pages deployment</li>
            <li>CSV loaded from public/ at runtime</li>
            <li>Include a README.md explaining the project and how to run it locally</li>
          </ul>

          <p className="mt-3">
            Explore the data first, then build. Make the dashboard genuinely useful and beautiful.
          </p>
        </blockquote>
      </ChartCard>
    </div>
  );
}
