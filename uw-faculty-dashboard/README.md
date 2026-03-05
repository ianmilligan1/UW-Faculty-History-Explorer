# The University of Waterloo, 1963–1978: An Interactive History

An interactive dashboard exploring the growth and evolution of faculty at the University of Waterloo through data drawn from official university calendars.

## Features

- **Overview** — Key statistics, faculty growth trends, and rank distribution over 16 years
- **Department Explorer** — Select any department to view faculty count, rank composition, and personnel over time
- **Rank & Career Progression** — Promotion patterns, time-at-rank analysis, and career pipeline visualization
- **Administrative Roles** — Chairs, Deans, Directors, and other administrative appointments tracked across years
- **Degree Origins** — Where UW faculty earned their degrees, filterable by department and time period
- **Individual Lookup** — Search by name to see any person's complete year-by-year history at UW

## Data

The dataset (`public/fulldata.csv`) contains ~11,100 person-year entries extracted from University of Waterloo calendars spanning 1963–1978. Each row records a faculty member's name, department, rank, highest degree, degree-granting institution, and any administrative roles or notes for a given year.

The dashboard performs intelligent deduplication to handle name inconsistencies (e.g., initials varying across years), normalizes department renames, and parses administrative roles from free-text fields.

## Tech Stack

- [React](https://react.dev) with [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Recharts](https://recharts.org) for data visualization
- [PapaParse](https://www.papaparse.com) for CSV parsing
- [Lucide React](https://lucide.dev) for icons

## Running Locally

```bash
cd uw-faculty-dashboard
npm install
npm run dev
```

The dev server will start at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on push to `main`. To enable:

1. Go to your repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to `main`

## License

Data sourced from publicly available University of Waterloo calendars.
