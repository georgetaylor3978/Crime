/* ============================================================
   CANADIAN CRIME DASHBOARD — app.js
   Data: Statistics Canada Table 35-10-0177-01 (1998–2024)
   3-Tier Hierarchy: Group → Sub-Category (L2) → Specific Violation (L3)
   ============================================================ */

// ─── GROUP ASSIGNMENT (by violation code) ───────────────────
// These are the TOP-LEVEL group buckets (L1)
const VIOLENT_CODES  = ['110','1110','1120','1130','1140','120','1150','1160','1210','1300','1310','1320','1330','130','1345','1350','1355','1367','1368','1369','1370','1371','1381','1410','1420','1430','135','140','1440','1470','1480','150','1450','1455','1457','160','1610','1611','510','1510','1515','1516','170','1530','1540','1545','1550','1560','1620','1625','1626','1627','190','1711','1712','1721','1722','1731','1732','1740','180','1220','1340','1356','1360','1365','1375','1380','1385','1390','1475','1520','1525','1621','1622','1628','1629','1630','1631','1632'];
const PROPERTY_CODES = ['210','2120','2121','2125','211','212','220','230','2130','2132','2133','240','2140','2142','2143','2160','2165','2166','250','2170','2175','2176','2177','2110','2178'];
const DRUG_CODES     = ['4140','4120','410','4110','4130','4150','4160','4170','420','4240','4340','4440','430','4220','4320','4420','440','4210','4230','4250','4260','4270','4310','4330','4350','4360','4370','4410','4430','4450','4460','4470','4590','450','451','4911','4912','4913','4914','452','4921','4922','4923','4924','4925','4926','453','4931','4932','4933','4934','454','4941','4942','455','4951','4952','4953','4961','4971','4981'];
const TRAFFIC_CODES  = ['900','910','9205','9210','9213','9215','9217','9220','9223','9225','9227','9230','9233','9235','9237','9240','9245','9250','9255','9260','9263','9265','9267','9270','9273','9275','9277','9280','9283','9285','9287','920','9110','9120','9130','9131','9132','9133','930','9320','9330','9410','9420','9430','9440','9450'];
const OTHER_CC_CODES = ['3420','310','3310','3320','3330','3340','3350','3365','3370','3375','3380','3390','3395','3455','3456','320','3110','3115','3120','3125','3130','3140','3141','3430','330','3410','3440','3480','3510','3520','3730','335','340','3210','3220','3230','3240','3450','3460','3470','3490','3540','3550','3560','3710','3711','3712','3713','3714','3715','3716','3717','3718','3720','3721','3722','3723','3724','3725','3726','3727','3740','3750','3760','3770','3772','3780','3790','3810','3811','3820','3825','3830','3840','3841','3842','3843','3890'];
const FEDERAL_CODES  = ['6450','610','6100','6150','6200','6250','6300','6350','6400','620','6550','6560','6600','6900'];

function extractCode(cat) {
  const m = cat.match(/\[(\d+)\]$/);
  return m ? m[1] : null;
}

function getGroup(cat) {
  const c = extractCode(cat);
  if (!c) return 'OTHER_CC';
  if (VIOLENT_CODES.includes(c))  return 'VIOLENT';
  if (PROPERTY_CODES.includes(c)) return 'PROPERTY';
  if (DRUG_CODES.includes(c))     return 'DRUG';
  if (TRAFFIC_CODES.includes(c))  return 'TRAFFIC';
  if (FEDERAL_CODES.includes(c))  return 'FEDERAL';
  if (OTHER_CC_CODES.includes(c)) return 'OTHER_CC';
  return 'OTHER_CC';
}

// ─── HIERARCHY: L2 sub-categories per Group ──────────────────
// These are the "parent" violation codes that appear in rawData as rollup totals
const GROUP_L2 = {
  VIOLENT:  ['110','120','1210','1300','1310','1320','1330','130','135','1410','1420','1430','140','150','160','510','170','1620','1625','1626','1627','190','180'],
  PROPERTY: ['210','211','212','220','230','240','2160','2165','2166','250','2110','2178'],
  DRUG:     ['4140','4120','410','420','430','440','4590','450'],
  TRAFFIC:  ['910','920'],
  OTHER_CC: ['3420','310','3455','3456','320','3430','330','335','340'],
  FEDERAL:  ['6450','610'],
};

// ─── HIERARCHY: L3 children per L2 sub-category code ─────────
const L2_CHILDREN = {
  // Violent sub-categories
  '110': ['1110','1120','1130','1140'],
  '120': ['1150','1160'],
  '130': ['1345','1350','1355','1367','1368','1369','1370','1371','1381'],
  '140': ['1440','1470','1480'],
  '150': ['1450','1455','1457'],
  '160': ['1610','1611'],
  '510': ['1510','1515','1516'],
  '170': ['1530','1540','1545','1550','1560'],
  '190': ['1711','1712','1721','1722','1731','1732','1740'],
  '180': ['1220','1340','1356','1360','1365','1375','1380','1385','1390','1475','1520','1525','1621','1622','1628','1629','1630','1631','1632'],
  // Property sub-categories
  '210': ['2120','2121','2125'],
  '230': ['2130','2132','2133'],
  '240': ['2140','2142','2143'],
  '250': ['2170','2175','2176','2177'],
  // Drug sub-categories
  '410': ['4110','4130','4150','4160','4170'],
  '420': ['4240','4340','4440'],
  '430': ['4220','4320','4420'],
  '440': ['4210','4230','4250','4260','4270','4310','4330','4350','4360','4370','4410','4430','4450','4460','4470'],
  '450': ['451','452','453','454','455','4961','4971','4981'],
  '451': ['4911','4912','4913','4914'],
  '452': ['4921','4922','4923','4924','4925','4926'],
  '453': ['4931','4932','4933','4934'],
  '454': ['4941','4942'],
  '455': ['4951','4952','4953'],
  // Traffic sub-categories
  '910': ['9205','9210','9213','9215','9217','9220','9223','9225','9227','9230','9233','9235','9237','9240','9245','9250','9255','9260','9263','9265','9267','9270','9273','9275','9277','9280','9283','9285','9287'],
  '920': ['9110','9120','9130','9131','9132','9133','9320','9330','9410','9420','9430','9440','9450'],
  // Other CC sub-categories
  '310': ['3310','3320','3330','3340','3350','3365','3370','3375','3380','3390','3395'],
  '320': ['3110','3115','3120','3125','3130','3140','3141'],
  '330': ['3410','3440','3480','3510','3520','3730'],
  '340': ['3210','3220','3230','3240','3450','3460','3470','3490','3540','3550','3560','3710','3711','3712','3713','3714','3715','3716','3717','3718','3720','3721','3722','3723','3724','3725','3726','3727','3740','3750','3760','3770','3772','3780','3790','3810','3811','3820','3825','3830','3840','3841','3842','3843','3890'],
  // Federal sub-categories
  '610': ['6100','6150','6200','6250','6300','6350','6400','6550','6560','6600','6900'],
};

// ─── DISPLAY CONSTANTS ───────────────────────────────────────
const GROUP_COLORS = {
  VIOLENT: '#ef4444', PROPERTY: '#f59e0b', DRUG: '#8b5cf6',
  TRAFFIC: '#06b6d4', OTHER_CC: '#64748b', FEDERAL: '#10b981',
};
const GROUP_LABELS = {
  VIOLENT: 'Violent', PROPERTY: 'Property', DRUG: 'Drug',
  TRAFFIC: 'Traffic', OTHER_CC: 'Other CC', FEDERAL: 'Federal', ALL: 'All',
};
const PALETTE = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16','#6366f1','#14b8a6','#e11d48','#7c3aed'];

// ─── CODE ↔ CATEGORY NAME LOOKUP ────────────────────────────
let CODE_TO_CAT = {};
let charts = {};
let combineMode = false;

function buildCodeLookup() {
  rawData.forEach(d => {
    const code = extractCode(d.category);
    if (code && !CODE_TO_CAT[code]) CODE_TO_CAT[code] = d.category;
  });
}

function catByCode(code) { return CODE_TO_CAT[code] || null; }

function shortName(cat, maxLen = 40) {
  const clean = cat.replace(/\s*\[\d+\]\s*$/, '').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen) + '…' : clean;
}

// ─── INIT ────────────────────────────────────────────────────
function init() {
  if (typeof rawData === 'undefined' || !rawData.length) return;
  document.getElementById('loader').classList.add('hidden');

  rawData.forEach(d => { d.group = getGroup(d.category); });
  buildCodeLookup();

  populateYears();
  populateSubcategories('ALL');
  populateViolations('ALL');
  updateDashboard();
  setupListeners();
}

// ─── YEAR FILTER ─────────────────────────────────────────────
function populateYears() {
  const years = [...new Set(rawData.map(d => String(d.year)))].sort().reverse();
  const sel = document.getElementById('yearFilter');
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.text = y;
    sel.appendChild(opt);
  });
  if (years.includes('2024')) sel.value = '2024';
  else sel.value = years[0];
}

// ─── SUB-CATEGORY FILTER (L2) ────────────────────────────────
function populateSubcategories(group) {
  const sel = document.getElementById('subcatFilter');
  sel.innerHTML = '<option value="ALL">All Sub-Categories</option>';
  if (group === 'ALL') return;

  const l2codes = GROUP_L2[group] || [];
  l2codes.forEach(code => {
    const cat = catByCode(code);
    if (!cat) return;
    const hasChildren = !!(L2_CHILDREN[code] && L2_CHILDREN[code].length > 0);
    const opt = document.createElement('option');
    opt.value = code;
    opt.text = shortName(cat, 50) + (hasChildren ? '  ▸' : '');
    sel.appendChild(opt);
  });
}

// ─── SPECIFIC VIOLATION FILTER (L3) ─────────────────────────
function populateViolations(subcatCode) {
  const sel = document.getElementById('violationFilter');
  sel.innerHTML = '<option value="ALL">All in Sub-Category</option>';
  if (subcatCode === 'ALL') return;

  // Show children of this sub-category
  const childCodes = L2_CHILDREN[subcatCode] || [];
  
  // Sub-category itself first (as a "total" reference)
  const parentCat = catByCode(subcatCode);
  if (parentCat) {
    const opt = document.createElement('option');
    opt.value = subcatCode;
    opt.text = '📊 ' + shortName(parentCat, 50) + ' (Total)';
    sel.appendChild(opt);
  }

  if (childCodes.length > 0) {
    // Separator-like optgroup
    const sep = document.createElement('option');
    sep.disabled = true;
    sep.text = '─────────── Breakdown ───────────';
    sel.appendChild(sep);

    childCodes.forEach(code => {
      const cat = catByCode(code);
      if (!cat) return;
      const opt = document.createElement('option');
      opt.value = code;
      opt.text = shortName(cat, 55);
      sel.appendChild(opt);
    });
  }
}

// ─── GET FILTERED DATASET (respects all 3 levels) ────────────
function getFilteredData() {
  const group    = document.getElementById('groupFilter').value;
  const subcat   = document.getElementById('subcatFilter').value;
  const violation = document.getElementById('violationFilter').value;

  // L3: specific violation selected
  if (violation !== 'ALL') {
    const catName = catByCode(violation);
    return catName ? rawData.filter(d => d.category === catName) : [];
  }
  // L2: sub-category selected (include parent + its children to show breakdown)
  if (subcat !== 'ALL') {
    const parentCat = catByCode(subcat);
    const childCats = (L2_CHILDREN[subcat] || []).map(c => catByCode(c)).filter(Boolean);
    return rawData.filter(d => d.category === parentCat || childCats.includes(d.category));
  }
  // L1: group selected
  if (group !== 'ALL') return rawData.filter(d => d.group === group);
  // All
  return rawData;
}

// ─── DETERMINE WHICH CATEGORIES TO SHOW IN BAR CHART ─────────
// At group level: show ONLY L2 sub-categories (prevent double-count)
// At sub-cat level: show the parent + L3 children
// At violation level: show just that one
function getBarCategories(group, subcat, violation) {
  if (violation !== 'ALL') {
    const cat = catByCode(violation);
    return cat ? [cat] : [];
  }
  if (subcat !== 'ALL') {
    // Show the sub-category total + its children
    const parentCat = catByCode(subcat);
    const childCats = (L2_CHILDREN[subcat] || []).map(c => catByCode(c)).filter(Boolean);
    const all = [];
    if (parentCat) all.push(parentCat);
    all.push(...childCats);
    return all;
  }
  if (group !== 'ALL') {
    // Only show L2 sub-categories (not their children) to avoid double-counting
    const l2codes = GROUP_L2[group] || [];
    return l2codes.map(c => catByCode(c)).filter(Boolean);
  }
  // All: show cross-group L2 sub-categories (top ones)
  return Object.values(GROUP_L2).flat().map(c => catByCode(c)).filter(Boolean);
}

// ─── TREND SERIES: which lines to draw ───────────────────────
function getTrendSeries(group, subcat, violation) {
  if (violation !== 'ALL') {
    // Single line for specific violation
    const cat = catByCode(violation);
    if (!cat) return {};
    const data = rawData.filter(d => d.category === cat)
      .map(d => ({ year: d.year, value: Number(d.value || 0) }))
      .sort((a, b) => String(a.year).localeCompare(String(b.year)));
    return { [cat]: data };
  }

  if (subcat !== 'ALL') {
    // Show each child as a separate line (plus parent total)
    const childCodes = L2_CHILDREN[subcat] || [];
    // If no children, show the parent as a single line
    const codesToShow = childCodes.length > 0 ? childCodes : [subcat];
    const series = {};
    codesToShow.slice(0, 8).forEach(code => {
      const cat = catByCode(code);
      if (!cat) return;
      series[cat] = rawData.filter(d => d.category === cat)
        .map(d => ({ year: d.year, value: Number(d.value || 0) }))
        .sort((a, b) => String(a.year).localeCompare(String(b.year)));
    });
    return series;
  }

  if (group !== 'ALL') {
    // One line per L2 sub-category (top 8 by total)
    const l2codes = GROUP_L2[group] || [];
    const withTotals = l2codes
      .map(code => {
        const cat = catByCode(code);
        if (!cat) return null;
        const total = rawData.filter(d => d.category === cat).reduce((s, d) => s + Number(d.value || 0), 0);
        return { code, cat, total };
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    const series = {};
    withTotals.forEach(({ cat }) => {
      series[cat] = rawData.filter(d => d.category === cat)
        .map(d => ({ year: d.year, value: Number(d.value || 0) }))
        .sort((a, b) => String(a.year).localeCompare(String(b.year)));
    });
    return series;
  }

  // All groups: one aggregate line per group
  const series = {};
  Object.keys(GROUP_LABELS).filter(g => g !== 'ALL').forEach(g => {
    const byYear = {};
    rawData.filter(d => d.group === g).forEach(d => {
      byYear[d.year] = (byYear[d.year] || 0) + Number(d.value || 0);
    });
    series[GROUP_LABELS[g]] = Object.entries(byYear)
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => String(a.year).localeCompare(String(b.year)));
  });
  return series;
}

// ─── LISTENERS ───────────────────────────────────────────────
// ─── COMBINE TOGGLE ─────────────────────────────────────────
window.toggleCombine = function() {
  combineMode = !combineMode;
  const btn = document.getElementById('combineToggle');
  if (combineMode) {
    btn.classList.add('active');
    btn.innerHTML = '<span class="toggle-icon">⬡</span> Combined';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<span class="toggle-icon">⬡</span> Combine';
  }
  const group     = document.getElementById('groupFilter').value;
  const subcat    = document.getElementById('subcatFilter').value;
  const violation = document.getElementById('violationFilter').value;
  const metric    = document.getElementById('metricFilter').value;
  const yr        = document.getElementById('yearFilter').value;
  renderTrendChart(group, subcat, violation, metric, yr);
};

function setupListeners() {
  document.getElementById('groupFilter').addEventListener('change', () => {
    const g = document.getElementById('groupFilter').value;
    populateSubcategories(g);
    populateViolations('ALL');
    updateBreadcrumb();
    updateDashboard();
  });
  document.getElementById('subcatFilter').addEventListener('change', () => {
    const sc = document.getElementById('subcatFilter').value;
    populateViolations(sc);
    updateBreadcrumb();
    updateDashboard();
  });
  ['violationFilter','yearFilter','metricFilter','topNFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      updateBreadcrumb();
      updateDashboard();
    });
  });
  ['tableSearch','tableSortField','tableSortDir'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderTable);
    document.getElementById(id).addEventListener('change', renderTable);
  });
}

// ─── BREADCRUMB ───────────────────────────────────────────────
function updateBreadcrumb() {
  const group = document.getElementById('groupFilter').value;
  const subcat = document.getElementById('subcatFilter').value;
  const violation = document.getElementById('violationFilter').value;

  const parts = [];
  if (group !== 'ALL') parts.push(GROUP_LABELS[group] || group);
  if (subcat !== 'ALL') {
    const cat = catByCode(subcat);
    if (cat) parts.push(shortName(cat, 45));
  }
  if (violation !== 'ALL') {
    const cat = catByCode(violation);
    if (cat) parts.push(shortName(cat, 45));
  }

  const bc = document.getElementById('breadcrumb');
  if (parts.length > 0) {
    bc.classList.remove('hidden');
    document.getElementById('breadcrumbText').textContent = '📍 ' + parts.join(' › ');
  } else {
    bc.classList.add('hidden');
  }
}

window.resetDrillDown = function() {
  document.getElementById('groupFilter').value = 'ALL';
  document.getElementById('subcatFilter').value = 'ALL';
  document.getElementById('violationFilter').value = 'ALL';
  populateSubcategories('ALL');
  populateViolations('ALL');
  document.getElementById('breadcrumb').classList.add('hidden');
  updateDashboard();
};

// ─── MAIN UPDATE ─────────────────────────────────────────────
let tableData = [];

function updateDashboard() {
  const group     = document.getElementById('groupFilter').value;
  const subcat    = document.getElementById('subcatFilter').value;
  const violation = document.getElementById('violationFilter').value;
  const yr        = document.getElementById('yearFilter').value;
  const metric    = document.getElementById('metricFilter').value;
  const topN      = parseInt(document.getElementById('topNFilter').value);

  updateHeaderMeta(yr);
  renderKPIs(yr);
  renderTrendChart(group, subcat, violation, metric, yr);
  renderBarChart(group, subcat, violation, yr, topN);
  renderYoYChart(group, subcat, violation, yr);
  renderDonutChart(yr);
  buildTableData(getFilteredData(), yr);
  renderTable();
}

// ─── HEADER META ─────────────────────────────────────────────
function updateHeaderMeta(yr) {
  const total = rawData.filter(d => String(d.year) === String(yr))
    .filter(d => {
      // Only L2 sub-categories to avoid double-counting
      const code = extractCode(d.category);
      return Object.values(GROUP_L2).flat().includes(code);
    })
    .reduce((s, d) => s + Number(d.value || 0), 0);

  const prevYr = String(parseInt(yr) - 1);
  const prevTotal = rawData.filter(d => String(d.year) === prevYr)
    .filter(d => {
      const code = extractCode(d.category);
      return Object.values(GROUP_L2).flat().includes(code);
    })
    .reduce((s, d) => s + Number(d.value || 0), 0);

  const pct = prevTotal ? ((total - prevTotal) / prevTotal * 100).toFixed(1) : '—';
  const sign = pct > 0 ? '+' : '';
  document.getElementById('headerMeta').innerHTML = `
    <div class="header-stat">
      <span class="val">${total.toLocaleString()}</span>
      <span class="lbl">Total Incidents ${yr}</span>
    </div>
    <div class="header-stat">
      <span class="val" style="color:${pct > 0 ? 'var(--danger)' : 'var(--success'}">${sign}${pct}%</span>
      <span class="lbl">vs Prior Year</span>
    </div>`;
}

// ─── KPI CARDS ───────────────────────────────────────────────
function renderKPIs(yr) {
  const groups = ['VIOLENT','PROPERTY','DRUG','TRAFFIC','OTHER_CC','FEDERAL'];
  const prevYr = String(parseInt(yr) - 1);
  const container = document.getElementById('kpiGrid');
  container.innerHTML = '';

  groups.forEach(g => {
    // Sum only L2 sub-categories for this group (no double-counting)
    const l2cats = (GROUP_L2[g] || []).map(c => catByCode(c)).filter(Boolean);
    const curr = rawData.filter(d => String(d.year) === String(yr) && l2cats.includes(d.category))
      .reduce((s, d) => s + Number(d.value || 0), 0);
    const prev = rawData.filter(d => String(d.year) === prevYr && l2cats.includes(d.category))
      .reduce((s, d) => s + Number(d.value || 0), 0);
    const pct = prev ? ((curr - prev) / prev * 100).toFixed(1) : null;
    const up  = pct > 0;

    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.style.setProperty('--kpi-color', GROUP_COLORS[g]);
    card.style.cursor = 'pointer';
    card.title = `Click to filter by ${GROUP_LABELS[g]}`;
    card.innerHTML = `
      <div class="kpi-label">${GROUP_LABELS[g]} Crimes</div>
      <div class="kpi-value">${curr.toLocaleString()}</div>
      ${pct !== null ? `<div class="kpi-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(pct)}%</div>` : ''}
      <div class="kpi-year-note">vs ${prevYr}</div>`;
    card.addEventListener('click', () => {
      document.getElementById('groupFilter').value = g;
      populateSubcategories(g);
      populateViolations('ALL');
      updateBreadcrumb();
      updateDashboard();
    });
    container.appendChild(card);
  });
}

// ─── TREND CHART ─────────────────────────────────────────────
function renderTrendChart(group, subcat, violation, metric, yr) {
  if (charts.line) charts.line.destroy();
  const isGrowth = metric === 'growth';
  const isStacked = combineMode && !isGrowth;
  const series = getTrendSeries(group, subcat, violation);

  const allYears = [...new Set(Object.values(series).flat().map(d => d.year))].sort();
  const datasets = [];
  const trendBadges = document.getElementById('trendBadges');
  trendBadges.innerHTML = '';
  let cIdx = 0;
  const isGroupView = (group === 'ALL' && subcat === 'ALL');

  Object.entries(series).forEach(([name, pts]) => {
    const colorBase = isGroupView
      ? (GROUP_COLORS[Object.keys(GROUP_COLORS)[cIdx]] || PALETTE[cIdx])
      : PALETTE[cIdx % PALETTE.length];

    let plotPts;
    if (isGrowth) {
      plotPts = [];
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i-1].value;
        const curr = pts[i].value;
        const pct = prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
        plotPts.push({ x: pts[i].year, y: Math.round(pct * 10) / 10 });
      }
    } else {
      plotPts = pts.map(p => ({ x: p.year, y: p.value }));
    }

    const label = isGroupView ? name : shortName(name, 40);
    datasets.push({
      label,
      data: plotPts,
      borderColor: colorBase,
      backgroundColor: isStacked ? colorBase + '99' : colorBase + '18',
      borderWidth: isStacked ? 1.5 : (violation !== 'ALL' ? 3 : 2.2),
      fill: isStacked ? 'origin' : (violation !== 'ALL'),
      tension: 0.35,
      pointRadius: isStacked ? 0 : (violation !== 'ALL' ? 4 : 2),
      pointHoverRadius: isStacked ? 4 : 6,
    });

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `<span class="badge-dot" style="background:${colorBase}"></span>${label}`;
    trendBadges.appendChild(badge);
    cIdx++;
  });

  let title = 'Canadian Crimes by Type';
  if (violation !== 'ALL') title = shortName(catByCode(violation) || violation, 60);
  else if (subcat !== 'ALL') title = shortName(catByCode(subcat) || subcat, 55) + ' — Breakdown';
  else if (group !== 'ALL') title = GROUP_LABELS[group] + ' Crimes — Sub-Categories';
  if (isStacked) title += ' (Stacked)';
  document.getElementById('trendTitle').textContent = title;

  const finalYears = isGrowth ? allYears.filter((_,i) => i > 0) : allYears;

  charts.line = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: { labels: finalYears, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: c => `  ${c.dataset.label}: ${Number(c.raw.y).toLocaleString(undefined, {maximumFractionDigits:1})}${isGrowth ? '%' : ''}`,
            footer: isStacked
              ? items => `Total: ${items.reduce((s, i) => s + Number(i.raw.y || 0), 0).toLocaleString()}`
              : undefined,
          }
        }
      },
      scales: {
        y: {
          stacked: isStacked,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 },
            callback: v => isGrowth ? v + '%' : v >= 1e6 ? (v/1e6).toFixed(1) + 'M' : v >= 1e3 ? (v/1e3).toFixed(0) + 'K' : v }
        },
        x: {
          stacked: isStacked,
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10 }, maxRotation: 45 }
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}


// ─── BAR CHART ───────────────────────────────────────────────
function renderBarChart(group, subcat, violation, yr, topN) {
  if (charts.bar) charts.bar.destroy();
  document.getElementById('barYear').textContent = yr;

  const allowedCats = getBarCategories(group, subcat, violation);
  const catAgg = {};
  rawData.filter(d => String(d.year) === String(yr) && allowedCats.includes(d.category))
    .forEach(d => { catAgg[d.category] = (catAgg[d.category] || 0) + Number(d.value || 0); });

  const sorted = Object.entries(catAgg)
    .filter(([,v]) => v > 0)
    .sort((a,b) => b[1]-a[1])
    .slice(0, topN === 999 ? undefined : topN);

  // Sub-label
  let sub = 'All — Ranked by Incident Count';
  if (violation !== 'ALL') sub = 'Specific Violation';
  else if (subcat !== 'ALL') sub = shortName(catByCode(subcat)||subcat,45) + ' — Breakdown';
  else if (group !== 'ALL') sub = GROUP_LABELS[group] + ' — Sub-Categories Only (no double count)';
  document.getElementById('barSubtitle').textContent = sub;

  const bgColors = sorted.map(([cat]) => (GROUP_COLORS[getGroup(cat)] || PALETTE[0]) + 'bb');
  const borderColors = sorted.map(([cat]) => GROUP_COLORS[getGroup(cat)] || PALETTE[0]);

  charts.bar = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: sorted.map(([cat]) => shortName(cat, 38)),
      datasets: [{
        data: sorted.map(([,v]) => v),
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `  ${Number(c.raw).toLocaleString()} incidents` } }
      },
      scales: {
        x: {
          grid: { color:'rgba(255,255,255,0.04)' },
          ticks: { color:'#64748b', font:{size:10},
            callback: v => v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v }
        },
        y: { grid:{display:false}, ticks:{color:'#94a3b8',font:{size:10}} }
      }
    }
  });
}

// ─── YOY CHART ───────────────────────────────────────────────
function renderYoYChart(group, subcat, violation, yr) {
  if (charts.yoy) charts.yoy.destroy();

  // Use only L2 sub-categories to avoid double-counting for aggregates
  let subsetData;
  if (violation !== 'ALL') {
    const cat = catByCode(violation);
    subsetData = rawData.filter(d => d.category === cat);
  } else if (subcat !== 'ALL') {
    const cat = catByCode(subcat);
    subsetData = rawData.filter(d => d.category === cat);
  } else if (group !== 'ALL') {
    const l2cats = (GROUP_L2[group] || []).map(c => catByCode(c)).filter(Boolean);
    subsetData = rawData.filter(d => l2cats.includes(d.category));
  } else {
    const allL2cats = Object.values(GROUP_L2).flat().map(c => catByCode(c)).filter(Boolean);
    subsetData = rawData.filter(d => allL2cats.includes(d.category));
  }

  const byYear = {};
  subsetData.forEach(d => { byYear[d.year] = (byYear[d.year] || 0) + Number(d.value || 0); });
  const years = Object.keys(byYear).sort();
  const changes = [], labels = [];
  for (let i = 1; i < years.length; i++) {
    const prev = byYear[years[i-1]], curr = byYear[years[i]];
    if (prev > 0) { changes.push(parseFloat(((curr-prev)/prev*100).toFixed(1))); labels.push(years[i]); }
  }

  let sub = 'All — % Change Per Year';
  if (violation !== 'ALL') sub = shortName(catByCode(violation)||violation,35) + ' — YoY %';
  else if (subcat !== 'ALL') sub = shortName(catByCode(subcat)||subcat,35) + ' — YoY %';
  else if (group !== 'ALL') sub = GROUP_LABELS[group] + ' — YoY %';
  document.getElementById('yoySubtitle').textContent = sub;

  charts.yoy = new Chart(document.getElementById('yoyChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: changes,
        backgroundColor: changes.map(v => v >= 0 ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)'),
        borderColor: changes.map(v => v >= 0 ? '#ef4444' : '#10b981'),
        borderWidth: 1, borderRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false}, tooltip:{ callbacks:{ label:c=>`  ${c.raw>0?'+':''}${c.raw}%` } } },
      scales: {
        y: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#64748b',font:{size:10},callback:v=>v+'%'} },
        x: { grid:{display:false}, ticks:{color:'#64748b',font:{size:9},maxRotation:45} }
      }
    }
  });
}

// ─── DONUT CHART ─────────────────────────────────────────────
function renderDonutChart(yr) {
  if (charts.donut) charts.donut.destroy();
  const groups = ['VIOLENT','PROPERTY','DRUG','TRAFFIC','OTHER_CC','FEDERAL'];
  const totals = groups.map(g => {
    const l2cats = (GROUP_L2[g] || []).map(c => catByCode(c)).filter(Boolean);
    return rawData.filter(d => String(d.year) === String(yr) && l2cats.includes(d.category))
      .reduce((s, d) => s + Number(d.value || 0), 0);
  });

  document.getElementById('donutSubtitle').textContent = `By Category Group — ${yr}`;
  charts.donut = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      labels: groups.map(g => GROUP_LABELS[g]),
      datasets: [{
        data: totals,
        backgroundColor: groups.map(g => GROUP_COLORS[g] + 'cc'),
        borderColor: groups.map(g => GROUP_COLORS[g]),
        borderWidth: 2, hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: true, position: 'right',
          labels: {
            color: '#94a3b8', font:{size:11}, boxWidth:12, padding:10,
            generateLabels: chart => {
              const ds = chart.data.datasets[0];
              const total = ds.data.reduce((a,b)=>a+b,0);
              return chart.data.labels.map((lbl,i) => ({
                text: `${lbl}  ${(ds.data[i]/total*100).toFixed(1)}%`,
                fillStyle: ds.backgroundColor[i],
                strokeStyle: ds.borderColor[i],
                lineWidth: 1, hidden: false, index: i,
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: c => {
              const total = c.dataset.data.reduce((a,b)=>a+b,0);
              return `  ${Number(c.raw).toLocaleString()} (${(c.raw/total*100).toFixed(1)}%)`;
            }
          }
        }
      }
    }
  });
}

// ─── TABLE ───────────────────────────────────────────────────
function buildTableData(filtered, yr) {
  const byYearCat = {};
  filtered.forEach(d => {
    const key = `${d.year}||${d.category}`;
    byYearCat[key] = (byYearCat[key] || 0) + Number(d.value || 0);
  });
  tableData = Object.entries(byYearCat).map(([key, val]) => {
    const [year, category] = key.split('||');
    const prevKey = `${parseInt(year)-1}||${category}`;
    const prev = byYearCat[prevKey] || 0;
    const yoyNum = prev > 0 ? ((val - prev) / prev * 100) : null;
    const code = extractCode(category);
    const isParent = !!(code && L2_CHILDREN[code]);
    return { year, category, value: val, group: getGroup(category),
             yoy: yoyNum !== null ? Math.round(yoyNum * 10) / 10 : null, isParent };
  });
}

function renderTable() {
  const search  = (document.getElementById('tableSearch').value || '').toLowerCase();
  const sortF   = document.getElementById('tableSortField').value;
  const sortDir = document.getElementById('tableSortDir').value;

  let rows = tableData.filter(d =>
    !search || shortName(d.category,999).toLowerCase().includes(search) || String(d.year).includes(search)
  );
  rows.sort((a,b) => {
    let va = a[sortF], vb = b[sortF];
    if (sortF === 'value') { va = Number(va); vb = Number(vb); }
    const cmp = String(va).localeCompare(String(vb), undefined, {numeric:true});
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const LIMIT = 200;
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';
  rows.slice(0,LIMIT).forEach(d => {
    const yoyHtml = d.yoy === null ? '<span class="change-neutral">N/A</span>'
      : d.yoy > 0 ? `<span class="change-up">▲ +${d.yoy}%</span>`
      : d.yoy < 0 ? `<span class="change-down">▼ ${d.yoy}%</span>`
      : '<span class="change-neutral">—</span>';
    const gc = GROUP_COLORS[d.group] || '#64748b';
    const gl = GROUP_LABELS[d.group] || d.group;
    const parentBadge = d.isParent ? '<span class="parent-badge">SUB-TOTAL</span> ' : '';
    const tr = document.createElement('tr');
    if (d.isParent) tr.style.fontWeight = '600';
    tr.innerHTML = `
      <td>${d.year}</td>
      <td><span class="group-badge" style="background:${gc}22;color:${gc};border:1px solid ${gc}44">${gl}</span></td>
      <td>${parentBadge}${shortName(d.category,60)}</td>
      <td>${Number(d.value).toLocaleString()}</td>
      <td>${yoyHtml}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('tableFooter').textContent =
    `Showing ${Math.min(rows.length,LIMIT).toLocaleString()} of ${rows.length.toLocaleString()} rows`;
}

// ─── START ───────────────────────────────────────────────────
init();
