import type { SyllabusItem } from '../types';

export interface OptionalTemplate {
  key: string;
  name: string;
  popularity: string;
  topics: { paper: 'OPTIONAL_P1' | 'OPTIONAL_P2'; category: string; microTopic: string }[];
}

const t = (
  key: string,
  name: string,
  popularity: string,
  p1: [string, string[]][],
  p2: [string, string[]][]
): OptionalTemplate => ({
  key,
  name,
  popularity,
  topics: [
    ...p1.flatMap(([category, topics]) => topics.map((microTopic) => ({ paper: 'OPTIONAL_P1' as const, category, microTopic }))),
    ...p2.flatMap(([category, topics]) => topics.map((microTopic) => ({ paper: 'OPTIONAL_P2' as const, category, microTopic })))
  ]
});

export const OPTIONAL_TEMPLATES: OptionalTemplate[] = [
  t(
    'psir',
    'Political Science & International Relations (PSIR)',
    'Most popular',
    [
      ['Political Theory', ['What is Politics? Approaches to Political Theory', 'Concepts — Liberty, Equality, Rights, Democracy, Power', 'Theories of the State — liberal, Marxist, elitist, pluralist']],
      ['Political Thought', ['Ancient — Plato, Aristotle; Kautilya', 'Modern — Machiavelli, Hobbes, Locke, Rousseau, Mill, Marx', 'Gandhi, Ambedkar & communitarian critiques']],
      ['Indian Political Thought', ['Dharamshastra, Sir Syed Ahmed Khan, Sri Aurobindo', 'M.N. Roy, Nehru, Lohiya, Deendayal Upadhyaya']],
      ['Comparative Politics', ['Approaches; political regimes — democratic & authoritarian', 'Development & underdevelopment; globalisation debates']],
      ['International Relations Theory', ['Realism, liberalism, constructivism, critical theories', 'World order post-Cold War; US hegemony & its decline']],
      ['India\u2019s Foreign Policy', ['Non-alignment to strategic autonomy; neighbourhood policy', 'India & major powers; multilateralism (UN, BRICS, SCO)']]
    ],
    [
      ['Indian National Movement', ['Rise of national consciousness; Gandhi & mass movements', 'Constitutional developments (1909–47); Partition politics']],
      ['Indian Government & Politics', ['Constitution making; Fundamental Rights & DPSP', 'Union Government, Parliament, Judiciary & federalism', 'Party system, elections, regionalism, social movements']],
      ['Comparative Government & Politics', ['UK, USA, China — constitutional frameworks', 'Democracy & development in the Global South']],
      ['Contemporary Global Issues', ['Terrorism, human rights, environment in IR', 'Nuclear proliferation; UN reforms; WTO & trade governance']]
    ]
  ),
  t(
    'sociology',
    'Sociology',
    'High scoring, short syllabus',
    [
      ['Sociology — The Discipline', ['Modernity & social change in Europe and emergence of sociology', 'Scope of the subject and comparison with other social sciences', 'Sociology as science; positivism & interpretive methods']],
      ['Sociological Thinkers', ['Karl Marx — historical materialism, class conflict', 'Durkheim — division of labour, religion, suicide', 'Weber — bureaucracy, authority, Protestant ethic', 'Parsons, Merton, Mead & symbolic interactionism']],
      ['Research Methodology', ['Positivism & its critique; scientific method', 'Research design, sampling, variables & hypothesis', 'Techniques of data collection & analysis']],
      ['Sociology as Science', ['Fact, value & objectivity; value-neutrality debate', 'Science, technology & social change']]
    ],
    [
      ['Indian Society — Structure & Change', ['Impact of colonial rule; renunciation traditions', 'Hindu social organisation — varna, jati, gotra', 'Caste in contemporary India; Sanskritisation (Srinivas)']],
      ['Social Change in India', ['Sanskritisation, westernisation, modernisation', 'Protests & movements — caste, tribal, women\u2019s, peasants\u2019', 'Reforms — Arya Samaj, Ram Mohan Roy, Vedic to constitutional']],
      ['Challenges of Social Transformation', ['Communalism, regionalism, casteism & secularism', 'Population dynamics & urbanisation', 'Globalisation & labour; changes in family & marriage']]
    ]
  ),
  t(
    'geography',
    'Geography',
    'Popular with science background',
    [
      ['Geomorphology', ['Interior of the earth; plate tectonics & mountain building', 'Weathering, erosion, deposition & landform evolution', 'Earthquakes, volcanoes, tsunamis']],
      ['Climatology', ['Atmosphere — composition & structure; insolation', 'Jet streams, cyclones, monsoon mechanisms', 'Climate classification (K\u00F6ppen) & climate change']],
      ['Oceanography', ['Ocean relief, temperature, salinity & circulation', 'Marine resources, coral reefs, ocean pollution']],
      ['Biogeography', ['Soil genesis & classification; vegetation belts', 'Wildlife conservation, biosphere reserves']],
      ['Environmental Geography', ['Human-environment interactions; hazards & disasters', 'Sustainable development debates']],
      ['Perspectives in Human Geography', ['Areal differentiation; quantitative revolution; radical & behavioural geography']],
      ['Economic Geography', ['Agricultural systems; world industrial regions', 'Transport, communication & trade networks']]
    ],
    [
      ['Physical Setting of India', ['Structure & relief; drainage systems; climate', 'Soils, natural vegetation & wildlife regions']],
      ['Resources of India', ['Land, water, mineral & energy resources; conservation', 'Energy crises & renewable energy potential']],
      ['Agriculture in India', ['Cropping patterns, agro-climatic regions; Green Revolution & after', 'Irrigation, dry-zone farming & agrarian issues']],
      ['Industry & Settlements', ['Industrial regions & policy; SEZs; Make in India', 'Human settlements — rural, urban, urbanisation problems, smart cities']],
      ['Regional Development & Planning', ['Five Year Plans, regional imbalances, tribal area development']],
      ['Contemporary Issues', ['Environmental hazards & management; population issues & policies']]
    ]
  ),
  t(
    'anthropology',
    'Anthropology',
    'Rising choice, science-based',
    [
      ['Meaning & Scope', ['Anthropology — meaning, scope & development; branches', 'Relationship with other sciences; main branches']],
      ['Biological Anthropology', ['Theories of organic evolution; evolutionary biology', 'Primates & primate behaviour; hominid evolution', 'Human genetics — Mendelian principles, pedigree, mutations, genetic disorders', 'Racial classification, criteria & classification of races']],
      ['Archaeological Anthropology', ['Dating methods (relative & absolute)', 'Cultural evolution — Palaeolithic to Neolithic; prehistoric art']],
      ['Concepts & Society', ['Society, culture, community, institutions; marriage & family', 'Kinship, descent, marriage rules; economic & political organisation', 'Religion — animism, totemism, shamanism; magic & science']]
    ],
    [
      ['Evolution of Indian Culture & Civilisation', ['Prehistoric cultures in India; Indus Valley civilisation', 'Vedic, Iron Age (Megalithic) cultures; ethno-archaeology']],
      ['Palaeoanthropology of India', ['Fossil hominoids in India; Ramapithecus to Homo sapiens']],
      ['Indian Society & Tribals', ['Caste system — origin & features; scheduled castes & tribes', 'Tribal India — distribution, problems, displacement & rehabilitation', 'Tribal administration & constitutional safeguards']],
      ['Social/Cultural Anthropology of India', ['Village studies; caste & village studies (S.C. Dube, M.N. Srinivas)', 'Little traditions & great traditions; sanskritisation', 'Impact of Buddhism, Jainism, Islam & Christianity on Indian society']],
      ['Applied Anthropology', ['Anthropology in medicine, forensics & development; PMVS & DNA applications']]
    ]
  ),
  t(
    'pubad',
    'Public Administration',
    'Overlap with GS2',
    [
      ['Introduction', ['Meaning, scope & significance of public administration', 'Wilson\u2019s vision; New Public Administration; minnowbrook conferences', 'Public & private administration; interdisciplinary approach']],
      ['Administrative Thought', ['Scientific management (Taylor); bureaucracy (Weber)', 'Human relations (Mayo); systems approach (Parsons, Katz & Kahn)', 'Public choice theory; managerialism (Drucker, F.W. Riggs)']],
      ['Administrative Behaviour', ['Decision making theories (Simon); motivation (Maslow, Herzberg)', 'Communication — types & barriers; leadership styles']],
      ['Organisations & Accountability', ['Theories of organisation; organisational culture', 'Accountability & control — legislative, executive, judicial; citizen control']],
      ['Administrative Law', ['Meaning & significance; delegated legislation; O&M']],
      ['Comparative & Development Administration', ['Riggs\u2019 salient features; development administration concepts', 'Bureaucracy & development; changing role of District Collector']],
      ['Public Policy', ['Models of policy-making — rational, incremental; inter-governmental relations']]
    ],
    [
      ['Evolution of Indian Administration', ['Kautilya\u2019s Arthashastra; Mughal administration; legacy of British rule']],
      ['Constitutional Framework', ['Union Government — President, PM & Council of Ministers, Cabinet', 'Parliament; Supreme Court; CAG; Election Commission', 'State government & administration; district administration']],
      ['Union Government & Administration', ['Structure of central secretariat; cabinet committees; PMO', 'Missions & mode, e-governance initiatives']],
      ['Civil Services in India', ['Role & status; recruitment & training; neutral vs committed', 'Values & ethics in administration; minister-civil servant relations']],
      ['State & District Administration', ['State secretariat; Chief Secretary; divisional & district administration', 'Local government — 73rd/74th amendments; rural & urban local governance', 'Finances of local bodies; special purpose agencies']],
      ['Techniques of Administrative Improvement', ['E-governance & information technology; MIS; organisational improvement methods (O&M, work study)']]
    ]
  ),
  t(
    'history',
    'History',
    'Overlap with GS1, vast syllabus',
    [
      ['Historiography', ['Sources & approaches to ancient Indian history; archaeology', 'Historical interpretation — colonial, nationalist, Marxist']],
      ['Ancient India', ['Pre-Harappan & Harappan cultures; Vedic period', 'Iron Age & Mahajanapadas; rise of Magadha; Persian & Greek invasions', 'Mauryan Empire — polity, economy, Ashoka\u2019s Dhamma; post-Mauryan (Shungas, Kushanas, Satavahanas)', 'Gupta period — polity, society, economy, culture; Harsha', 'Ancient South India — Sangam age; Cholas, Pallavas, Chalukyas; regional states']],
      ['Medieval India', ['Early medieval India — Rajputs, Arab & Turkish invasions', 'Delhi Sultanate — administration, economy, society; Vijayanagara & Bahmani kingdoms', 'Mughal Empire — polity, administration, economy; agrarian system', 'Marathas & the 18th century — Shivaji, Peshwas, successor states']],
      ['Modern India', ['European penetration & British supremacy; economic impact of colonial rule', 'Socio-religious reform movements; national movement — 1857 to Gandhian era', 'Rise of the Left; constitutional developments; Partition & independence']],
      ['World History', ['Renaissance & Reformation; voyages of discovery', 'American & French Revolutions', 'Industrial Revolution; unification of Germany & Italy', 'World Wars; Russian Revolution; decolonisation & Cold War']]
    ],
    []
  )
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42);

export function buildOptionalItems(templateKey: string): SyllabusItem[] {
  const tpl = OPTIONAL_TEMPLATES.find((x) => x.key === templateKey);
  if (!tpl) return [];
  const seen = new Set<string>();
  const items: SyllabusItem[] = [];
  tpl.topics.forEach(({ paper, category, microTopic }, i) => {
    let id = `opt-${slug(category)}-${slug(microTopic).slice(0, 24)}-${i}`;
    while (seen.has(id)) id += 'x';
    seen.add(id);
    items.push({
      id,
      paper,
      category,
      microTopic,
      status: 'not_started',
      revisionCount: 0,
      priority: 'medium'
    });
  });
  return items;
}
