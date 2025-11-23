import { BeyCombo } from '../types';

// --- 1. HARDCODED CSV DATA (THE "BAKED IN" DB) ---
// INCOLLA QUI SOTTO IL CONTENUTO DEL TUO FILE 'beyblade_data.csv' COMPLETO.
// Mantenere l'intestazione è fondamentale.
const EMBEDDED_CSV_DATA = `Combo ID,Combo Rank,Points,Blade,Ratchet,Bit,Sample Size (Win Count)
WIZ-001,1,4500,Wizard Rod,9-60,Ball,1240
PHO-002,2,4200,Phoenix Wing,5-60,Point,1150
WIZ-003,3,3800,Wizard Rod,5-70,Hexa,980
HEL-004,4,3600,Hells Scythe,3-60,Ball,890
SHA-005,5,3400,Shark Edge,3-60,Low Flat,850
PHO-006,6,3300,Phoenix Wing,3-60,Rush,820
DRA-007,7,3100,Dran Sword,3-60,Flat,780
COB-008,8,2900,Cobalt Drake,4-60,Flat,750
UNI-009,9,2800,Unicorn Sting,5-60,Gear Point,710
VIP-010,10,2600,Viper Tail,5-80,Orb,680
WIZ-011,11,2500,Wizard Arrow,4-80,Ball,650
KNI-012,12,2400,Knight Shield,3-80,Needle,620
HEL-013,13,2300,Hells Chain,5-60,High Taper,600
DKE-014,14,2200,Dran Dagger,3-60,Rush,580
RHI-015,15,2100,Rhino Horn,3-80,Spike,550
WIZ-016,16,2050,Wizard Rod,5-60,Ball,540
PHO-017,17,2000,Phoenix Wing,9-60,Point,530
SHA-018,18,1950,Shark Edge,4-60,Low Flat,520
HEL-019,19,1900,Hells Scythe,5-60,Taper,510
DRA-020,20,1850,Dran Buster,1-60,Low Flat,500
WIZ-021,21,1800,Wizard Rod,9-60,Orb,490
UNI-022,22,1750,Unicorn Sting,3-60,Point,480
COB-023,23,1700,Cobalt Drake,9-60,Flat,470
VIP-024,24,1650,Viper Tail,4-60,Ball,460
KNI-025,25,1600,Knight Shield,5-60,Hexa,450
HEL-026,26,1550,Hells Chain,9-60,Taper,440
DKE-027,27,1500,Dran Dagger,5-60,Rush,430
RHI-028,28,1450,Rhino Horn,5-80,Needle,420
WIZ-029,29,1400,Wizard Arrow,3-60,Orb,410
PHO-030,30,1350,Phoenix Wing,5-60,Rush,400`;

/**
 * Creates the RAG string exactly matching your Python script:
 * f"Combo ID: {row['Combo ID']}. Rank: {row['Combo Rank']} (Punti: {row['Points']}). Componenti -> Blade: {row['Blade']}, Ratchet: {row['Ratchet']}, Bit: {row['Bit']}. Vittorie nel campione: {row['Sample Size (Win Count)']}. "
 */
const createRagContent = (c: Partial<BeyCombo>) => {
  return `Combo ID: ${c.id}. Rank: ${c.rank} (Punti: ${c.points}). Componenti -> Blade: ${c.blade}, Ratchet: ${c.ratchet}, Bit: ${c.bit}. Vittorie nel campione: ${c.wins}.`;
};

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
      // Handle "Sample Size (Win Count)" or simply "Wins"
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

  // Default sort by Rank ascending (1 is best)
  return result.sort((a, b) => a.rank - b.rank);
};

// --- INITIALIZE DATABASE FROM EMBEDDED STRING ---
export const INITIAL_DB: BeyCombo[] = parseBeyCSV(EMBEDDED_CSV_DATA);

/**
 * REPLICATING THE PYTHON "SEARCH_COMBO_SMART" LOGIC
 * 1. Filter/Score candidates (Pseudo-Semantic via Synonyms) -> Top 100
 * 2. Sort by Rank (Ascending)
 * 3. Take Top 30
 */
export const searchCombos = (query: string, dataset: BeyCombo[] = INITIAL_DB): BeyCombo[] => {
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
  // We take broadly anything that matches.
  let candidates = scored.filter(s => s.score > 0);
  
  // Fallback for generic queries: if no matches (or user asks "best combos"), 
  // take everything (to let Rank sort decide)
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
