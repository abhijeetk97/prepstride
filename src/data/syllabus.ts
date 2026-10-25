import type { Paper, SyllabusItem } from '../types';

// Compact seed tuple: [category, microTopic, priority]
type Seed = [string, string, 'high' | 'medium' | 'low'];

const PRELIMS: Seed[] = [
  ['Current Events of National & International Importance', 'Last 12 months current affairs — Polity & Governance', 'high'],
  ['Current Events of National & International Importance', 'Last 12 months current affairs — Economy & Budget', 'high'],
  ['Current Events of National & International Importance', 'Last 12 months current affairs — Environment & Ecology', 'high'],
  ['Current Events of National & International Importance', 'Last 12 months current affairs — International Relations', 'medium'],
  ['Current Events of National & International Importance', 'Last 12 months current affairs — Science & Tech, Awards, Sports', 'medium'],
  ['History of India & Indian National Movement', 'Ancient India — Indus Valley, Vedic, Mauryan, Gupta periods', 'medium'],
  ['History of India & Indian National Movement', 'Medieval India — Delhi Sultanate, Mughals, Bhakti-Sufi traditions', 'medium'],
  ['History of India & Indian National Movement', 'Modern India — British expansion, 1857 Revolt', 'high'],
  ['History of India & Indian National Movement', 'Modern India — Gandhian era & Freedom Struggle (1915–47)', 'high'],
  ['History of India & Indian National Movement', 'Post-Independence consolidation & reorganisation', 'medium'],
  ['History of India & Indian National Movement', 'Art & Culture — architecture, dance, music, painting schools', 'high'],
  ['Indian & World Geography', 'Physical Geography of India — physiography, drainage, climate, soils', 'high'],
  ['Indian & World Geography', 'Economic Geography — agriculture, minerals, industries, transport', 'medium'],
  ['Indian & World Geography', 'World Geography — continents, oceans, key physical features', 'medium'],
  ['Indian & World Geography', 'Map-based practice — India & world locations in news', 'high'],
  ['Indian Polity & Governance', 'Constitution — Preamble, Fundamental Rights, DPSP, Duties', 'high'],
  ['Indian Polity & Governance', 'Union Government — President, PM, Parliament, Judiciary', 'high'],
  ['Indian Polity & Governance', 'State Government, Panchayati Raj & local governance', 'medium'],
  ['Indian Polity & Governance', 'Constitutional & statutory bodies; federalism; elections', 'high'],
  ['Indian Polity & Governance', 'Governance, transparency, e-governance & citizen initiatives', 'medium'],
  ['Economic & Social Development', 'Macroeconomics — national income, inflation, banking, monetary policy', 'high'],
  ['Economic & Social Development', 'Fiscal policy, budget, taxation & government schemes', 'high'],
  ['Economic & Social Development', 'Agriculture — MSP, irrigation, rural development programmes', 'high'],
  ['Economic & Social Development', 'Industry, infrastructure, external sector & trade', 'medium'],
  ['Economic & Social Development', 'Social sector — health, education, poverty & employment', 'high'],
  ['General Issues on Environmental Ecology', 'Ecology fundamentals, biodiversity, ecosystems', 'high'],
  ['General Issues on Environmental Ecology', 'Pollution, climate change, international conventions', 'high'],
  ['General Issues on Environmental Ecology', 'Indian environmental laws, protected areas, species in news', 'high'],
  ['General Science', 'Biology & biotechnology fundamentals', 'medium'],
  ['General Science', 'Physics & chemistry in everyday life', 'medium'],
  ['General Science', 'Space science, defence tech & emerging technologies', 'medium']
];

const GS1: Seed[] = [
  ['Indian Culture', 'Salient aspects of art forms, literature & architecture — ancient to modern', 'high'],
  ['Indian Culture', 'Classical & folk dances, music traditions, theatre forms', 'medium'],
  ['Indian Culture', 'Painting schools, handicrafts, UNESCO heritage sites', 'medium'],
  ['Indian Culture', 'Religious & philosophical traditions — Buddhism, Jainism, Bhakti, Sufi', 'medium'],
  ['Modern Indian History', 'Mid-18th century events — Battle of Plassey to 1857', 'high'],
  ['Modern Indian History', 'Freedom Struggle — moderates, extremists, Gandhi era, movements', 'high'],
  ['Modern Indian History', 'Role of women, peasants, tribals, workers in the struggle', 'medium'],
  ['Modern Indian History', 'Governors-General & Viceroys — policies & reforms', 'medium'],
  ['Modern Indian History', 'Post-independence consolidation & reorganisation of states', 'medium'],
  ['History of the World', 'Industrial revolution, world wars, redrawal of national boundaries', 'medium'],
  ['History of the World', 'Colonization, decolonization, political philosophies (communism, capitalism, socialism)', 'medium'],
  ['Society', 'Salient features of Indian Society, diversity of India', 'high'],
  ['Society', 'Role of women & women\u2019s organisations, population & associated issues', 'high'],
  ['Society', 'Poverty & developmental issues, urbanisation, their problems & remedies', 'high'],
  ['Society', 'Globalisation effects on Indian society', 'medium'],
  ['Society', 'Social empowerment, communalism, regionalism & secularism', 'high'],
  ['Geography', 'Salient features of world\u2019s physical geography', 'high'],
  ['Geography', 'Distribution of key natural resources across the world (incl. South Asia)', 'medium'],
  ['Geography', 'Important geophysical phenomena — earthquakes, tsunami, cyclones; geographical features & location changes (critical geographical features, water bodies, polar ice)', 'high'],
  ['Geography', 'Indian geography — physiographic divisions, monsoon mechanism, soils & vegetation', 'high']
];

const GS2: Seed[] = [
  ['Constitution', 'Historical underpinnings, evolution, features, amendments, significant provisions', 'high'],
  ['Constitution', 'Basic structure doctrine & landmark judgments', 'high'],
  ['Constitution', 'Functions & responsibilities of the Union and the States; issues & challenges of federalism', 'high'],
  ['Constitution', 'Devolution of powers & finances to local levels; separation of powers, dispute redressal', 'high'],
  ['Constitution', 'Comparison of the Indian constitutional scheme with other countries', 'medium'],
  ['Legislature & Executive', 'Parliament & State legislatures — structure, functioning, conduct of business, privileges', 'high'],
  ['Legislature & Executive', 'Executive & Judiciary — structure, organisation, functioning; Ministries & Departments', 'high'],
  ['Legislature & Executive', 'Pressure groups & formal/informal associations in polity', 'medium'],
  ['Legislature & Executive', 'Representation of People\u2019s Act; elections & electoral reforms', 'high'],
  ['Constitutional & Statutory Bodies', 'Constitutional posts, powers, functions & responsibilities of various bodies', 'high'],
  ['Constitutional & Statutory Bodies', 'Statutory, regulatory & quasi-judicial bodies', 'medium'],
  ['Governance', 'Government policies & interventions for development in various sectors', 'high'],
  ['Governance', 'Development processes & the development industry — NGOs, SHGs, donors, charities', 'medium'],
  ['Governance', 'Welfare schemes for vulnerable sections; performance of these schemes', 'high'],
  ['Governance', 'Issues relating to poverty & hunger', 'high'],
  ['Governance', 'Important aspects of governance, transparency & accountability; e-governance', 'high'],
  ['Governance', 'Citizen\u2019s Charters, transparency & accountability, institutional measures', 'medium'],
  ['Governance', 'Role of civil services in a democracy', 'high'],
  ['International Relations', 'India & its neighbourhood — relations, region-specific policies', 'high'],
  ['International Relations', 'Bilateral, regional & global groupings & agreements involving India', 'high'],
  ['International Relations', 'Effect of policies of developed & developing countries on India', 'medium'],
  ['International Relations', 'Important international institutions, agencies & fora — structure, mandate', 'medium']
];

const GS3: Seed[] = [
  ['Economy', 'Indian Economy & issues of planning, mobilisation of resources, growth & development', 'high'],
  ['Economy', 'Inclusive growth & issues arising from it', 'high'],
  ['Economy', 'Government Budgeting — budget process, deficits, FRBM', 'high'],
  ['Economy', 'Major crops, cropping patterns; MSP, PDS, buffer stocks; land reforms', 'high'],
  ['Economy', 'Economics of animal rearing, food processing & related industries', 'medium'],
  ['Economy', 'Liberalisation effects on the economy; changes in industrial policy', 'medium'],
  ['Economy', 'Infrastructure — energy, ports, roads, airports, railways', 'medium'],
  ['Economy', 'Investment models; money supply, inflation, monetary policy, RBI functioning', 'high'],
  ['Science & Technology', 'Developments in S&T; applications & effects in everyday life', 'medium'],
  ['Science & Technology', 'Achievements of Indians in S&T; indigenisation of technology', 'medium'],
  ['Science & Technology', 'Space technology & ISRO missions; defence technology', 'medium'],
  ['Science & Technology', 'Computers, robotics, nanotechnology, biotechnology & IPR issues', 'medium'],
  ['Environment & Ecology', 'Environmental conservation, environmental pollution & degradation', 'high'],
  ['Environment & Ecology', 'Environmental Impact Assessment; laws & institutions', 'medium'],
  ['Disaster Management', 'Disasters & disaster management — natural & man-made, NDMA framework', 'high'],
  ['Security', 'Linkages of development & spread of extremism', 'high'],
  ['Security', 'External state & non-state actors\u2019 role in internal security challenges', 'high'],
  ['Security', 'Communication networks\u2019 role in border areas; money laundering & prevention', 'medium'],
  ['Security', 'Security forces & agencies and their mandate', 'medium'],
  ['Security', 'Cyber security basics & challenges', 'high'],
  ['Security', 'Basics of money laundering & prevention', 'low']
];

const GS4: Seed[] = [
  ['Ethics & Human Interface', 'Essence, determinants & consequences of ethics in human actions', 'high'],
  ['Ethics & Human Interface', 'Dimensions of ethics; ethics in private & public relationships', 'high'],
  ['Ethics & Human Interface', 'Human values — lessons from lives & teachings of great leaders, reformers, administrators', 'medium'],
  ['Ethics & Human Interface', 'Role of family, society & educational institutions in inculcating values', 'medium'],
  ['Attitude', 'Attitude — content, structure, function; its influence & relation with thought & behaviour', 'high'],
  ['Attitude', 'Moral & political attitudes; social influence & persuasion', 'medium'],
  ['Aptitude & Foundational Values', 'Aptitude & foundational values for civil service — integrity, impartiality, non-partisanship', 'high'],
  ['Aptitude & Foundational Values', 'Objectivity, dedication to public service, empathy, tolerance & compassion', 'high'],
  ['Aptitude & Foundational Values', 'Emotional intelligence — concepts & utilities in administration & governance', 'high'],
  ['Moral Thinkers', 'Contributions of moral thinkers & philosophers from India & the world', 'medium'],
  ['Public Service Values', 'Ethical issues in international relations & funding', 'low'],
  ['Public Service Values', 'Laws, rules, regulations & conscience as sources of ethical guidance', 'high'],
  ['Public Service Values', 'Ethical concerns & dilemmas in government & private institutions', 'high'],
  ['Probity in Governance', 'Concept of public service; philosophical basis of governance & probity', 'high'],
  ['Probity in Governance', 'Information sharing & transparency in government; RTI', 'high'],
  ['Probity in Governance', 'Citizen\u2019s Charters, work culture, quality of service delivery', 'medium'],
  ['Probity in Governance', 'Utilisation of public funds; challenges of corruption', 'high'],
  ['Case Studies', 'Case studies on the above topics — practice & answer framework', 'high']
];

const CSAT: Seed[] = [
  ['Comprehension', 'Reading comprehension passages — practice & technique', 'high'],
  ['Interpersonal Skills', 'Interpersonal skills incl. communication — decision-oriented questions', 'medium'],
  ['Logical Reasoning', 'Logical reasoning & analytical ability — practice sets', 'high'],
  ['Decision Making', 'Decision-making & problem-solving questions (no negative marking)', 'high'],
  ['General Mental Ability', 'General mental ability — puzzles, direction sense, seating arrangement', 'medium'],
  ['Basic Numeracy', 'Basic numeracy (Class X level) — percentages, ratio, averages, time & work', 'high'],
  ['Data Interpretation', 'Data interpretation (Class X level) — charts, graphs, tables', 'high']
];

const ESSAY: Seed[] = [
  ['Essay practice', 'Structure drill — introduction, thesis, body, conclusion', 'high'],
  ['Essay practice', 'Philosophical outline — one abstract topic in 30 minutes', 'high'],
  ['Essay practice', 'GS-linked essay — a polity argument with a current example', 'high'],
  ['Essay practice', 'Past-topic brainstorm — five UPSC topics, three arguments each', 'medium'],
  ['Essay practice', 'Timed write — 1000–1200 words in 90 minutes', 'high'],
  ['Essay practice', 'Self review — mark one essay for structure and examples', 'medium'],
  ['Essay practice', 'Multi-dimensional essay — social, economic and ethical angles', 'medium'],
  ['Essay practice', 'Quote essay — unpack the quote, then argue', 'medium'],
  ['Essay practice', 'Way-forward endings — propose, don’t only summarise', 'medium'],
  ['Essay practice', 'Language edit — rewrite one essay for clarity', 'low']
];

const PAPER_SEEDS: Record<string, Seed[]> = {
  PRELIMS,
  GS1,
  GS2,
  GS3,
  GS4,
  ESSAY,
  CSAT
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42);

export function buildSyllabusItems(): SyllabusItem[] {
  const items: SyllabusItem[] = [];
  for (const [paper, seeds] of Object.entries(PAPER_SEEDS)) {
    seeds.forEach(([category, microTopic, priority], idx) => {
      items.push({
        id: `${paper.toLowerCase()}-${slug(category)}-${String(idx + 1).padStart(2, '0')}`,
        paper: paper as Paper,
        category,
        microTopic,
        status: 'not_started',
        revisionCount: 0,
        priority,
        sortOrder: idx
      });
    });
  }
  return items;
}
