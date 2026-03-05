import Papa from 'papaparse';

// ── Location normalization map ──
const LOCATION_ALIASES = {
  'UBC': 'British Columbia',
  'Oxon': 'Oxford',
  'Cantab': 'Cambridge',
  'John Hopkins': 'Johns Hopkins',
  'Ljubliana': 'Ljubljana',
  'Ljubltana': 'Ljubljana',
  'Beograd': 'Belgrade',
  'Beogard': 'Belgrade',
  'Padova': 'Padua',
  'Prodova': 'Padua',
  'Provoda': 'Padua',
  'Munchen': 'Munich',
  'München': 'Munich',
  'College of Optometry of Ontario': 'College of Optometry',
  'Case Western Reserve': 'Case',
  'Case Institute of Technology': 'Case',
  'ANU': 'Australian National University',
  'IIT Kanpur': 'IIT',
  'Indian Institute of Technology': 'IIT',
  'Czechoslovakian Academy of Science': 'Czechoslovak Academy of Sciences, Prague',
  'State University of Iowa': 'Iowa',
};

// ── Department family mapping (for dedup across renames) ──
const DEPT_FAMILIES = {
  'German & Russian': 'Germanic/Slavic',
  'Germanic & Slavic Languages': 'Germanic/Slavic',
  'Physical & Health Education': 'Kinesiology',
  'Kinesiology': 'Kinesiology',
  'Religious Knowledge': 'Religious Studies',
  'Religious Studies': 'Religious Studies',
  'Management & Systems': 'Management Sciences',
  'Management Sciences': 'Management Sciences',
  'Design': 'Systems Design',
  'Systems Design': 'Systems Design',
  'Geography & Planning': 'Geography',
  'Geography': 'Geography',
  'Social Science (Applied)': 'Social Development',
  'Social Development Studies': 'Social Development',
  'Sociology & Anthropology': 'Sociology/Anthropology',
};

// ── Rank normalization ──
const RANK_ALIASES = {
  'Post-Doctorate Fellow': 'Postdoctoral Fellow',
  'Teaching Post-doctorate Fellow': 'Postdoctoral Fellow',
};

const RANK_ORDER = {
  'Lecturer': 1,
  'Instructor': 1,
  'Senior Lecturer': 2,
  'Senior Demonstrator': 2,
  'Assistant Professor': 3,
  'Research Assistant Professor': 3,
  'Associate Professor': 4,
  'Research Associate Professor': 4,
  'Professor': 5,
  'Distinguished Professor': 6,
  'Professor Emeritus': 7,
};

const ADMIN_PATTERNS = [
  { pattern: /\bPresident\b/i, role: 'President' },
  { pattern: /\bVice.?President/i, role: 'Vice-President' },
  { pattern: /\bDean\b/i, role: 'Dean' },
  { pattern: /\bAssociate Dean\b/i, role: 'Associate Dean' },
  { pattern: /\bActing Chair\b/i, role: 'Acting Chair' },
  { pattern: /\bDeputy Chair\b/i, role: 'Deputy Chair' },
  { pattern: /\bAssociate Chair\b/i, role: 'Associate Chair' },
  { pattern: /\bChair\b/i, role: 'Chair' },
  { pattern: /\bDirector\b/i, role: 'Director' },
  { pattern: /\bGraduate Officer\b/i, role: 'Graduate Officer' },
  { pattern: /\bUndergraduate Officer\b/i, role: 'Undergraduate Officer' },
];

function extractAdminRoles(otherField) {
  if (!otherField || otherField.trim() === '') return [];
  const roles = [];
  for (const { pattern, role } of ADMIN_PATTERNS) {
    if (pattern.test(otherField)) {
      roles.push(role);
    }
  }
  // Deduplicate: "Associate Dean" also matches "Dean", keep only more specific
  if (roles.includes('Associate Dean') && roles.includes('Dean')) {
    roles.splice(roles.indexOf('Dean'), 1);
  }
  if (roles.includes('Acting Chair') && roles.includes('Chair')) {
    roles.splice(roles.indexOf('Chair'), 1);
  }
  if (roles.includes('Deputy Chair') && roles.includes('Chair')) {
    roles.splice(roles.indexOf('Chair'), 1);
  }
  if (roles.includes('Associate Chair') && roles.includes('Chair')) {
    roles.splice(roles.indexOf('Chair'), 1);
  }
  if (roles.includes('Vice-President') && roles.includes('President')) {
    roles.splice(roles.indexOf('President'), 1);
  }
  return roles;
}

function normalizeLocation(loc) {
  if (!loc) return '';
  let trimmed = loc.trim();
  if (LOCATION_ALIASES[trimmed]) return LOCATION_ALIASES[trimmed];
  return trimmed;
}

function normalizeRank(rank) {
  if (!rank) return '';
  let trimmed = rank.trim();
  if (RANK_ALIASES[trimmed]) return RANK_ALIASES[trimmed];
  if (trimmed === '?' || trimmed === 'N/A' || trimmed === '') return '';
  return trimmed;
}

function getDeptFamily(dept) {
  return DEPT_FAMILIES[dept] || dept;
}

// ── Name deduplication ──
// Strategy: group by (lastname, department_family), then merge entries where
// one firstname is a prefix of another (e.g., "G" matches "GA", "GA" matches "GAP")
function generatePersonKey(firstname, lastname, department) {
  const fn = firstname.trim().toUpperCase().replace(/\s+/g, ' ');
  const ln = lastname.trim().toUpperCase().replace(/\s+/g, ' ');
  const family = getDeptFamily(department).toUpperCase();
  return `${ln}||${family}||${fn}`;
}

function firstnameCompatible(a, b) {
  // After normalization, check if one is a prefix of the other
  const fa = a.replace(/\s+/g, '').toUpperCase();
  const fb = b.replace(/\s+/g, '').toUpperCase();
  if (fa === fb) return true;
  if (fa.startsWith(fb) || fb.startsWith(fa)) return true;
  return false;
}

function buildPersonId(firstname, lastname) {
  return `${lastname.trim()}__${firstname.trim()}`.toUpperCase().replace(/\s+/g, '_');
}

export async function loadAndProcessData(basePath = '') {
  const csvPath = `${basePath}/fulldata.csv`;
  const response = await fetch(csvPath);
  const csvText = await response.text();

  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  // ── Step 1: Clean & normalize each row ──
  const rows = data.map(row => ({
    year: parseInt(row.Year, 10),
    department: (row.Department || '').trim(),
    firstname: (row.Firstname || '').trim().replace(/\s+$/, ''),
    lastname: (row.Lastname || '').trim().replace(/\s+$/, ''),
    degree: (row['Highest Degree'] || '').trim(),
    location: normalizeLocation(row.Location),
    rank: normalizeRank(row.Rank),
    affiliate: (row.Affiliate || '').trim(),
    other: (row.Other || '').trim(),
    // Handle misplaced affiliate data (1977 EE entries)
    adminRolesRaw: (row.Other || '').trim(),
  })).filter(r => r.year >= 1963 && r.year <= 1978 && r.lastname);

  // Fix misplaced data: some admin roles ended up in Affiliate column
  rows.forEach(r => {
    if (r.affiliate && /Chair|Dean|Sabbatical|Part-time/i.test(r.affiliate)) {
      if (!r.other) {
        r.other = r.affiliate;
        r.adminRolesRaw = r.affiliate;
      }
      r.affiliate = '';
    }
  });

  // ── Step 2: Deduplicate people ──
  // Group by (lastname_upper, dept_family)
  const groupMap = new Map();
  rows.forEach((row, idx) => {
    const ln = row.lastname.toUpperCase();
    const family = getDeptFamily(row.department).toUpperCase();
    const key = `${ln}||${family}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push({ ...row, _idx: idx });
  });

  // Within each group, cluster compatible firstnames
  const personIdMap = new Map(); // row index -> canonical person id
  const personCanonical = new Map(); // person id -> { firstname, lastname }

  groupMap.forEach((entries) => {
    // Collect unique firstnames
    const firstnames = [...new Set(entries.map(e => e.firstname.toUpperCase()))];

    // Cluster: merge if one is prefix of another
    const clusters = [];
    const assigned = new Set();

    // Sort by length descending so longer names come first
    firstnames.sort((a, b) => b.length - a.length);

    for (const fn of firstnames) {
      if (assigned.has(fn)) continue;
      const cluster = [fn];
      assigned.add(fn);
      for (const other of firstnames) {
        if (assigned.has(other)) continue;
        if (firstnameCompatible(fn, other)) {
          cluster.push(other);
          assigned.add(other);
        }
      }
      clusters.push(cluster);
    }

    // Assign person IDs
    for (const cluster of clusters) {
      // Use the longest firstname as canonical
      const canonical = cluster.sort((a, b) => b.length - a.length)[0];
      const sampleEntry = entries.find(e => e.firstname.toUpperCase() === canonical) || entries[0];
      const pid = buildPersonId(canonical, sampleEntry.lastname);

      personCanonical.set(pid, {
        firstname: sampleEntry.firstname,
        lastname: sampleEntry.lastname,
      });

      for (const entry of entries) {
        const entryFnUpper = entry.firstname.toUpperCase();
        if (cluster.includes(entryFnUpper)) {
          personIdMap.set(entry._idx, pid);
        }
      }
    }
  });

  // ── Step 3: Build enriched records ──
  const enrichedRows = rows.map((row, idx) => {
    const pid = personIdMap.get(idx) || buildPersonId(row.firstname, row.lastname);
    const adminRoles = extractAdminRoles(row.other);
    const isPartTime = /part.?time/i.test(row.other);
    const isOnLeave = /on\s+(leave|sabbatical)/i.test(row.other);
    const rankLevel = RANK_ORDER[row.rank] || 0;

    return {
      ...row,
      personId: pid,
      adminRoles,
      isPartTime,
      isOnLeave,
      rankLevel,
    };
  });

  // ── Step 4: Build person profiles ──
  const personMap = new Map();
  enrichedRows.forEach(row => {
    if (!personMap.has(row.personId)) {
      const canon = personCanonical.get(row.personId);
      personMap.set(row.personId, {
        id: row.personId,
        firstname: canon ? canon.firstname : row.firstname,
        lastname: canon ? canon.lastname : row.lastname,
        displayName: canon
          ? `${canon.firstname} ${canon.lastname}`
          : `${row.firstname} ${row.lastname}`,
        years: [],
        departments: new Set(),
        ranks: new Set(),
        degrees: new Set(),
        locations: new Set(),
        affiliates: new Set(),
        adminRoles: [],
        entries: [],
      });
    }
    const person = personMap.get(row.personId);
    person.years.push(row.year);
    if (row.department) person.departments.add(row.department);
    if (row.rank) person.ranks.add(row.rank);
    if (row.degree && row.degree !== 'N/A') person.degrees.add(row.degree);
    if (row.location && row.location !== 'N/A' && row.location !== '?') {
      person.locations.add(row.location);
    }
    if (row.affiliate) person.affiliates.add(row.affiliate);
    if (row.adminRoles.length > 0) {
      person.adminRoles.push({
        year: row.year,
        department: row.department,
        roles: row.adminRoles,
        raw: row.other,
      });
    }
    person.entries.push(row);
  });

  // Finalize person profiles
  const people = [];
  personMap.forEach(person => {
    person.years = [...new Set(person.years)].sort((a, b) => a - b);
    person.firstYear = person.years[0];
    person.lastYear = person.years[person.years.length - 1];
    person.tenure = person.lastYear - person.firstYear + 1;
    person.yearsPresent = person.years.length;
    person.departments = [...person.departments];
    person.ranks = [...person.ranks];
    person.degrees = [...person.degrees];
    person.locations = [...person.locations];
    person.affiliates = [...person.affiliates];

    // Highest degree (prefer PhD/DPhil)
    person.highestDegree = person.degrees.find(d => /^(PhD|DPhil|DrIng|DSc|EdD|ThD|JSD|SJD|MD)$/i.test(d))
      || person.degrees[person.degrees.length - 1]
      || '';

    // Career trajectory: rank transitions
    const ranksByYear = person.entries
      .filter(e => e.rankLevel > 0)
      .sort((a, b) => a.year - b.year);
    person.rankProgression = [];
    let lastRank = null;
    for (const entry of ranksByYear) {
      if (entry.rank !== lastRank) {
        person.rankProgression.push({ year: entry.year, rank: entry.rank, level: entry.rankLevel });
        lastRank = entry.rank;
      }
    }

    people.push(person);
  });

  // ── Step 5: Compute aggregate statistics ──
  const allYears = [...new Set(enrichedRows.map(r => r.year))].sort((a, b) => a - b);
  const allDepartments = [...new Set(enrichedRows.map(r => r.department))].sort();

  // Faculty count by year
  const facultyByYear = allYears.map(year => {
    const yearRows = enrichedRows.filter(r => r.year === year);
    const uniquePeople = new Set(yearRows.map(r => r.personId));
    return { year, count: uniquePeople.size, rows: yearRows.length };
  });

  // Departments by year
  const deptsByYear = allYears.map(year => {
    const depts = new Set(enrichedRows.filter(r => r.year === year).map(r => r.department));
    return { year, count: depts.size };
  });

  // Rank distribution by year
  const mainRanks = ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];
  const rankDistByYear = allYears.map(year => {
    const yearRows = enrichedRows.filter(r => r.year === year);
    const dist = { year };
    for (const rank of mainRanks) {
      dist[rank] = yearRows.filter(r => r.rank === rank).length;
    }
    dist['Other'] = yearRows.filter(r => !mainRanks.includes(r.rank)).length;
    return dist;
  });

  // Admin roles over time
  const adminByYear = allYears.map(year => {
    const yearRows = enrichedRows.filter(r => r.year === year && r.adminRoles.length > 0);
    const uniquePeople = new Set(yearRows.map(r => r.personId));
    return { year, count: uniquePeople.size };
  });

  // Degree locations aggregate
  const locationCounts = {};
  people.forEach(p => {
    p.locations.forEach(loc => {
      if (loc && loc !== 'N/A' && loc !== '?') {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
    });
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([name, count]) => ({ name, count }));

  return {
    rows: enrichedRows,
    people,
    allYears,
    allDepartments,
    facultyByYear,
    deptsByYear,
    rankDistByYear,
    adminByYear,
    topLocations,
    mainRanks,
    stats: {
      totalPeople: people.length,
      totalDepartments: allDepartments.length,
      yearRange: `${allYears[0]}–${allYears[allYears.length - 1]}`,
      totalRows: enrichedRows.length,
      firstYear: allYears[0],
      lastYear: allYears[allYears.length - 1],
    },
  };
}
