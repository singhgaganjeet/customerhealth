// Date parsing — handles "DD MMM YYYY" (e.g. "11 May 2026") and "YYYY-MM-DD"
function parseDate(str) {
  if (!str || !String(str).trim()) return null;
  const d = new Date(String(str).trim());
  return isNaN(d.getTime()) ? null : d;
}

// Equivalent of Excel's =DAYS(asOf, cell). Falls back to today if asOfDate not provided.
export function daysSince(dateStr, asOfDate = null) {
  const date = parseDate(dateStr);
  if (!date) return Infinity;
  const ref = (asOfDate ? parseDate(String(asOfDate)) : null) || new Date();
  ref.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((ref - date) / 86400000));
}

// Customer tenure in years from signup_date, relative to as_of_date
function getAgeYears(row) {
  if (row.signup_date) {
    const days = daysSince(row.signup_date, row.as_of_date || null);
    return isFinite(days) ? Math.max(0.1, days / 365) : 1;
  }
  return parseFloat(row.age) || 1;
}

// ── PA score computation from raw values ──────────────────────────────────────

export function computePAScore(row) {
  // ── Database (max 10) ──────────────────────────────────────────────────────
  const regDB    = parseInt(row.registered_db)   || 0;
  const unregDB  = parseInt(row.unregistered_db) || 0;
  const totalDB  = regDB + unregDB;
  const unregPct = totalDB > 0 ? (unregDB / totalDB) * 100 : 100;
  const dbUnreg  = unregPct > 90 ? 0 : unregPct > 75 ? 1 : unregPct > 50 ? 2 : unregPct > 25 ? 3 : unregPct > 10 ? 4 : 5;
  const dbPend   = (parseInt(row.pend_app) || 0) > 10 ? 0 : 5;

  // ── Engagement (max 20) ────────────────────────────────────────────────────
  const age         = getAgeYears(row);
  const idealEvents = age * 3;
  const idealNews   = age * 18;
  const evPct       = idealEvents > 0 ? (parseInt(row.events || 0) / idealEvents) * 100 : 0;
  const nwPct       = idealNews   > 0 ? (parseInt(row.news   || 0) / idealNews)   * 100 : 0;

  const efEvents = evPct >= 85 ? 5 : evPct > 70 ? 4 : evPct > 50 ? 3 : evPct > 25 ? 2 : evPct > 10 ? 1 : 0;
  const efNews   = nwPct >= 85 ? 5 : nwPct > 70 ? 4 : nwPct > 50 ? 3 : nwPct > 25 ? 2 : nwPct > 10 ? 1 : 0;
  const efChap   = parseInt(row.chapters || 0) > 0 ? 5 : 0;
  const efSigs   = parseInt(row.sigs     || 0) > 0 ? 5 : 0;

  // ── Recency (max 20) ───────────────────────────────────────────────────────
  const asOf    = row.as_of_date || null;
  const mailerD = daysSince(row.last_mailer_date, asOf);
  const eventD  = daysSince(row.last_event_date,  asOf);
  const newsD   = daysSince(row.last_news_date,   asOf);
  const loginD  = daysSince(row.last_login_date,  asOf);

  const recMailer = mailerD <= 31 ? 5 : mailerD < 45 ? 4 : mailerD < 60  ? 3 : mailerD < 90  ? 2 : mailerD < 120 ? 1 : 0;
  const recEvent  = eventD  <= 90 ? 5 : eventD  < 120 ? 4 : eventD  < 150 ? 3 : eventD  < 180 ? 2 : eventD  < 210 ? 1 : 0;
  const recNews   = newsD   <= 15 ? 5 : newsD   < 30  ? 4 : newsD   < 45  ? 3 : newsD   < 60  ? 2 : newsD   < 75  ? 1 : 0;
  const recLogin  = loginD  <= 30 ? 5 : loginD  < 45  ? 4 : loginD  < 60  ? 3 : loginD  < 75  ? 2 : loginD  < 90  ? 1 : 0;

  return dbUnreg + dbPend + efEvents + efNews + efChap + efSigs + recMailer + recEvent + recNews + recLogin;
}

// =if(A2<15,"Very Dormant",if(A2<20,"Dormant",if(A2<30,"Average",if(A2<40,"Active","Very Active"))))
export function getPAStatus(score) {
  if (score < 15) return 'Very Dormant';
  if (score < 20) return 'Dormant';
  if (score < 30) return 'Average';
  if (score < 40) return 'Active';
  return 'Very Active';
}

// Returns full breakdown for ProductAdoptionDeepDive display
export function getPABreakdown(row) {
  const regDB    = parseInt(row.registered_db)   || 0;
  const unregDB  = parseInt(row.unregistered_db) || 0;
  const totalDB  = regDB + unregDB;
  const unregPct = totalDB > 0 ? (unregDB / totalDB) * 100 : 100;
  const age         = getAgeYears(row);
  const idealEvents = age * 3;
  const idealNews   = age * 18;
  const evPct = idealEvents > 0 ? (parseInt(row.events || 0) / idealEvents) * 100 : 0;
  const nwPct = idealNews   > 0 ? (parseInt(row.news   || 0) / idealNews)   * 100 : 0;
  const asOf2   = row.as_of_date || null;
  const mailerD = daysSince(row.last_mailer_date, asOf2);
  const eventD  = daysSince(row.last_event_date,  asOf2);
  const newsD   = daysSince(row.last_news_date,   asOf2);
  const loginD  = daysSince(row.last_login_date,  asOf2);

  // Tenure display
  const totalDays  = row.signup_date ? daysSince(row.signup_date, asOf2) : null;
  const ageDisplay = totalDays != null
    ? `${Math.floor(totalDays / 365)} yr${Math.floor(totalDays / 365) !== 1 ? 's' : ''} ${Math.round((totalDays % 365) / 30)} mo`
    : null;

  return {
    unregPct:     Math.round(unregPct * 10) / 10,
    pendApp:      parseInt(row.pend_app) || 0,
    evPct:        Math.round(evPct),
    nwPct:        Math.round(nwPct),
    idealEvents:  Math.round(idealEvents),
    idealNews:    Math.round(idealNews),
    chapters:     parseInt(row.chapters || 0),
    sigs:         parseInt(row.sigs || 0),
    mailerDays:   isFinite(mailerD) ? mailerD : null,
    eventDays:    isFinite(eventD)  ? eventD  : null,
    newsDays:     isFinite(newsD)   ? newsD   : null,
    loginDays:    isFinite(loginD)  ? loginD  : null,
    ageDisplay,
  };
}

// ── Pillar activations ────────────────────────────────────────────────────────

const ALP_CITY_MAP = {
  HYD: 'Hyderabad', PUN: 'Pune', BLR: 'Bengaluru', DEL: 'Delhi', MUM: 'Mumbai',
};

export function getPillarActivations(row) {
  const pa_score = parseFloat(row.pa_score) || 0;

  const alpVal      = String(row.alp || '').trim();
  const alpActivated = alpVal !== '' && alpVal.toLowerCase() !== 'no';
  const alpCity     = ALP_CITY_MAP[alpVal.toUpperCase()] || alpVal;

  return {
    product_adoption: {
      activated: pa_score > 0,
      score:  (pa_score / 50) * 10,
      detail: `Score ${pa_score}/50 — ${row.pa_status || 'N/A'}`,
    },
    alp: {
      activated: alpActivated,
      detail:    alpActivated ? alpCity : 'Not Attended',
    },
    ascend_elite: {
      activated: row.ascend_elite === 'Yes',
      detail:    row.ascend_elite === 'Yes' ? 'Module Active' : 'Not Active',
    },
    hoopstr_live: {
      activated: row.hoopstr_live === 'Yes',
      detail:    row.hoopstr_live === 'Yes' ? 'Activated' : 'Not Activated',
    },
    hoopstr_affinity: {
      activated: row.hoopstr_affinity === 'Yes',
      detail:    row.hoopstr_affinity === 'Yes' ? 'Activated' : 'Not Activated',
    },
    group_insurance: {
      activated: row.group_insurance === 'Yes',
      detail:    row.group_insurance === 'Yes' ? 'Active' : 'Not Active',
    },
    vanguard: {
      activated: row.vanguard === 'Yes',
      detail:    row.vanguard === 'Yes' ? 'Enrolled' : 'Not Enrolled',
    },
    magic_ai: {
      activated: row.magic_ai === 'Yes',
      detail:    row.magic_ai === 'Yes' ? 'Active' : 'Not Active',
    },
    campus_visit: {
      activated: row.campus_visited === 'Yes',
      detail:    row.campus_visited === 'Yes'
        ? `Last: ${row.campus_visit_date || 'N/A'}` : 'Never Visited',
    },
    upsell_demo: {
      activated: !!(row.last_demo_date && String(row.last_demo_date).trim()),
      detail:    row.last_demo_date ? `Last: ${row.last_demo_date}` : 'No Demo Yet',
    },
  };
}

export function getActivationStatus(score) {
  if (score >= 80) return { label: 'Fully Activated',      tier: 'fully',    textColor: 'text-[#3a7a1a]',  bgColor: 'bg-[#f2fde8]',  borderColor: 'border-[#7ed957]',  dotColor: 'bg-[#7ed957]'  };
  if (score >= 60) return { label: 'Highly Activated',     tier: 'highly',   textColor: 'text-green-700',  bgColor: 'bg-green-50',  borderColor: 'border-green-300',  dotColor: 'bg-green-500'  };
  if (score >= 40) return { label: 'Moderately Activated', tier: 'moderate', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300', dotColor: 'bg-yellow-500' };
  if (score >= 20) return { label: 'Low Activation',       tier: 'low',      textColor: 'text-red-700',    bgColor: 'bg-red-50',    borderColor: 'border-red-300',    dotColor: 'bg-red-500'    };
  return               { label: 'Not Activated',         tier: 'none',     textColor: 'text-gray-600',   bgColor: 'bg-gray-50',   borderColor: 'border-gray-300',   dotColor: 'bg-gray-400'   };
}

export function getPAStatusStyle(status) {
  switch (status) {
    case 'Very Active':  return 'text-green-700 bg-green-100';
    case 'Active':       return 'text-blue-700 bg-blue-100';
    case 'Average':      return 'text-yellow-700 bg-yellow-100';
    case 'Dormant':      return 'text-orange-700 bg-orange-100';
    case 'Very Dormant': return 'text-red-700 bg-red-100';
    default:             return 'text-gray-600 bg-gray-100';
  }
}

// ── Main enrichment ───────────────────────────────────────────────────────────

export function enrichCustomer(row) {
  const pa_score  = computePAScore(row);
  const pa_status = getPAStatus(pa_score);
  const enriched  = { ...row, pa_score, pa_status };

  const pillarActivations = getPillarActivations(enriched);

  // PA: continuous 0–10 pts; all other 9 pillars: binary 0 or 10 pts
  const paWeighted   = (pa_score / 50) * 10;
  const binaryScore  = Object.entries(pillarActivations)
    .filter(([k]) => k !== 'product_adoption')
    .reduce((sum, [, v]) => sum + (v.activated ? 10 : 0), 0);
  const activationScore  = Math.round(paWeighted + binaryScore);
  const activationStatus = getActivationStatus(activationScore);
  const pillarsActivated = Object.values(pillarActivations).filter(p => p.activated).length;

  return { ...enriched, pillarActivations, activationScore, activationStatus, pillarsActivated };
}
