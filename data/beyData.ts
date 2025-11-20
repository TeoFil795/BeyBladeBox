import { BeyCombo } from '../types';

const createRagContent = (c: Partial<BeyCombo>) => {
  return `Combo ID: ${c.id}. Rank: ${c.rank} (Punti: ${c.points}). Componenti -> Blade: ${c.blade}, Ratchet: ${c.ratchet}, Bit: ${c.bit}. Vittorie nel campione: ${c.wins}.`;
};

// Initial Mock Data populated with RAG content
const RAW_MOCK_DB: Partial<BeyCombo>[] = [
  { id: "WIZ-001", rank: 1, points: 4500, blade: "Wizard Rod", ratchet: "9-60", bit: "Ball", wins: 1240, description: "Stamina king." },
  { id: "PHO-002", rank: 2, points: 4200, blade: "Phoenix Wing", ratchet: "5-60", bit: "Point", wins: 1150, description: "Heavy attack." },
  { id: "WIZ-003", rank: 3, points: 3800, blade: "Wizard Rod", ratchet: "5-70", bit: "Hexa", wins: 980, description: "Tanky stamina." },
  { id: "HEL-004", rank: 4, points: 3600, blade: "Hells Scythe", ratchet: "3-60", bit: "Ball", wins: 890, description: "Balance standard." },
  { id: "SHA-005", rank: 5, points: 3400, blade: "Shark Edge", ratchet: "3-60", bit: "Low Flat", wins: 850, description: "Upper attack." },
  { id: "PHO-006", rank: 6, points: 3300, blade: "Phoenix Wing", ratchet: "3-60", bit: "Rush", wins: 820, description: "Aggressive." },
  { id: "DRA-007", rank: 7, points: 3100, blade: "Dran Sword", ratchet: "3-60", bit: "Flat", wins: 780, description: "Classic attack." },
  { id: "COB-008", rank: 8, points: 2900, blade: "Cobalt Drake", ratchet: "4-60", bit: "Flat", wins: 750, description: "Heavy chrome." },
  { id: "UNI-009", rank: 9, points: 2800, blade: "Unicorn Sting", ratchet: "5-60", bit: "Gear Point", wins: 710, description: "Unpredictable." },
  { id: "VIP-010", rank: 10, points: 2600, blade: "Viper Tail", ratchet: "5-80", bit: "Orb", wins: 680, description: "Smash stamina." },
  { id: "WIZ-011", rank: 11, points: 2500, blade: "Wizard Arrow", ratchet: "4-80", bit: "Ball", wins: 650, description: "Beginner stamina." },
  { id: "KNI-012", rank: 12, points: 2400, blade: "Knight Shield", ratchet: "3-80", bit: "Needle", wins: 620, description: "High defense." },
  { id: "HEL-013", rank: 13, points: 2300, blade: "Hells Chain", ratchet: "5-60", bit: "High Taper", wins: 600, description: "Shock absorb." },
  { id: "DKE-014", rank: 14, points: 2200, blade: "Dran Dagger", ratchet: "3-60", bit: "Rush", wins: 580, description: "Barrage." },
  { id: "RHI-015", rank: 15, points: 2100, blade: "Rhino Horn", ratchet: "3-80", bit: "Spike", wins: 550, description: "Compact defense." }
];

export const MOCK_DB: BeyCombo[] = RAW_MOCK_DB.map(c => ({
  ...c,
  ragContent: createRagContent(c)
} as BeyCombo));

// Synonyms to simulate "Semantic" search for key archetypes
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  "stamina": ["wizard", "rod", "ball", "orb", "glide", "9-60"],
  "resistenza": ["wizard", "rod", "ball", "orb", "glide", "9-60"],
  "attack": ["flat", "rush", "low", "shark", "dran", "phoenix", "wing", "sword", "axe", "buster"],
  "attacco": ["flat", "rush", "low", "shark", "dran", "phoenix", "wing", "sword", "axe", "buster"],
  "defense": ["needle", "shield", "chain", "keeper", "hexa"],
  "difesa": ["needle", "shield", "chain", "keeper", "hexa"],
  "balance": ["point", "taper", "unicorn", "scythe"],
  "equilibrio": ["point", "taper", "unicorn", "scythe"],
};

/**
 * Parses a CSV string into BeyCombo objects using flexible headers.
 * Matches your Python script logic: 'Combo Rank', 'Sample Size', etc.
 */
export const parseBeyCSV = (csvText: string): BeyCombo[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Normalize headers to handle "Combo Rank" vs "Rank" etc.
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
  
  const result: BeyCombo[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(','); // Simple split (warning: doesn't handle commas inside quotes perfectly)
    if (values.length < 3) continue;

    const entry: any = {};
    
    headers.forEach((header, index) => {
      let value = values[index]?.trim();
      if (value && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!value) return;

      // Mapping logic based on your CSV structure
      if (header.includes('rank')) entry.rank = Number(value) || 999;
      else if (header.includes('points') || header.includes('punti')) entry.points = Number(value) || 0;
      else if (header.includes('win') || header.includes('sample') || header.includes('vittorie')) entry.wins = Number(value) || 0;
      else if (header.includes('blade')) entry.blade = value;
      else if (header.includes('ratchet')) entry.ratchet = value;
      else if (header.includes('bit')) entry.bit = value;
      else if (header.includes('id')) entry.id = value;
      else if (header.includes('desc')) entry.description = value;
    });

    // Defaults
    if (!entry.id) entry.id = `CSV-${i}`;
    if (!entry.blade) entry.blade = "Unknown";
    if (!entry.ratchet) entry.ratchet = "Unknown";
    if (!entry.bit) entry.bit = "Unknown";
    if (!entry.rank) entry.rank = 999;

    // Generate the RAG content string exactly like the python script
    entry.ragContent = createRagContent(entry);

    result.push(entry as BeyCombo);
  }

  return result.sort((a, b) => a.rank - b.rank);
};

/**
 * REPLICATING THE PYTHON "SEARCH_COMBO_SMART" LOGIC
 * 1. Filter/Score candidates (Pseudo-Semantic via Synonyms) -> Top 100
 * 2. Sort by Rank (Ascending)
 * 3. Take Top 30
 */
export const searchCombos = (query: string, dataset: BeyCombo[] = MOCK_DB): BeyCombo[] => {
  const lowerQuery = query.toLowerCase();
  const queryTerms = lowerQuery.split(" ").filter(t => t.length > 2);

  // Expand query with synonyms for better recall (simulating embeddings)
  const expandedTerms = [...queryTerms];
  Object.entries(KEYWORD_SYNONYMS).forEach(([key, synonyms]) => {
    if (lowerQuery.includes(key)) {
      expandedTerms.push(...synonyms);
    }
  });

  const scored = dataset.map(combo => {
    let score = 0;
    
    // Full text string for searching
    const fullText = `${combo.blade} ${combo.ratchet} ${combo.bit} ${combo.description || ''} ${combo.ragContent || ''}`.toLowerCase();
    
    // Basic Match
    if (fullText.includes(lowerQuery)) score += 50;

    // Term Match
    expandedTerms.forEach(term => {
      if (fullText.includes(term)) score += 10;
    });

    return { combo, score };
  });

  // 1. Filter candidates (Simulating "Cosine Similarity > Threshold")
  // We take broadly anything that matches, or if query is generic ("best"), we take everything.
  let candidates = scored.filter(s => s.score > 0);
  
  // Fallback for generic queries: if no matches, take everything (to let Rank sort decide)
  if (candidates.length === 0) {
     candidates = scored.map(s => ({ ...s, score: 1 })); 
  }

  // Get Top 100 candidates based on relevance first (The "Semantic" Phase)
  // If the query is specific, we want relevant items. If generic, we want top ranks.
  candidates.sort((a, b) => b.score - a.score);
  let top100 = candidates.slice(0, 100).map(s => s.combo);

  // 2. SORT BY RANK (The "Mathematical" Phase)
  // "Ordiniamo per Rank... I migliori rank in alto"
  top100.sort((a, b) => a.rank - b.rank);

  // 3. TAKE TOP 30
  // "Prendiamo le top 30 invece di 5! Diamo all'AI più materiale."
  const finalResults = top100.slice(0, 30);

  return finalResults;
};

export const serializeCombosForPrompt = (combos: BeyCombo[]): string => {
  // Simply join the pre-calculated RAG strings
  return combos.map(c => c.ragContent).join("\n\n");
};