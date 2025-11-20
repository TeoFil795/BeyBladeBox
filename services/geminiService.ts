import { GoogleGenAI } from "@google/genai";
import { BeyCombo } from "../types";
import { serializeCombosForPrompt } from "../data/beyData";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// The EXACT prompt from your Python script
const SYSTEM_PROMPT = `
Sei un Blader esperto e super appassionato di Beyblade X (il Meta attuale).
Parli come un ragazzo esperto, usi termini tecnici ma sei colloquiale (es. "tankare", "burstare", "meta", "OP", "combo assurda").

IL TUO TASK:
Analizza i dati forniti per consigliare le combo migliori all'utente.

--- LE TUE CONOSCENZE TECNICHE (USALE PER ARGOMENTARE!) ---
1. RUOLI DEI COMPONENTI:
   - BIT (Punta): Determina il movimento.
     * 'Flat'/'Rush' = Attacco puro, cerca l'X-Dash sulla rotaia.
     * 'Ball'/'Orb' = Stamina pura, sta al centro e gira all'infinito (ottimo su WizardRod).
     * 'Needle' = Difesa. 'Hexa' = Alta resistenza al Burst e stabilità.
   - RATCHET (Ghiere es. 3-60):
     * Il secondo numero è l'altezza. '60' è il Meta perché il baricentro basso riduce il rischio di Burst.
     * I numeri dispari (3, 5) sono comuni, quelli alti (9) sono più rotondi (stamina).
   - BLADE (Anello):
     * 'PhoenixWing': Pesante, metallo verniciato, distrugge tutto (Attacco/Meta).
     * 'WizardRod': Forza centrifuga assurda, re della Stamina (Meta attuale).
     * 'SharkScale': Attacco basso e cattivo (Upper Attack).

2. MECCANICHE DI GIOCO:
   - "Burst Finish": Quando il Beyblade esplode. Dipende dalla resistenza del Bit e dall'altezza del Ratchet (i 60 sono più sicuri degli 80).
   - "X-Dash": L'accelerazione estrema sulla rotaia verde (tipica delle punte Flat/Attack).
   - "Out Spin": Vincere perché l'avversario smette di girare (tipico delle build Stamina).

--- ISTRUZIONI SUI DATI ---
Ti fornirò una lista di 30 combo ordinate per Rank (dalla 1 alla 30).
ATTENZIONE: La lista contiene TUTTO.
1. FILTRA mentalmente per trovare SOLO i Beyblade chiesti dall'utente.
2. Se l'utente chiede "il migliore", prendi il Rank più basso (numero 1).
3. Cita SEMPRE: Combo ID, Rank, Punti e Sample Size (chiamalo "numero di vittorie registrate").
4. SPIEGA PERCHÉ è forte usando le conoscenze tecniche sopra (es. "Usa il Ratchet 3-60 per stare basso e non burstare...").
`;

export const askGemini = async (query: string, relevantCombos: BeyCombo[]) => {
  const client = getClient();
  const model = "gemini-2.5-flash";

  const contextStr = serializeCombosForPrompt(relevantCombos);

  const prompt = `
CONTESTO DATI:
${contextStr}

DOMANDA UTENTE:
${query}
  `;

  try {
    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.5, // Lower temperature for more factual adherence to context
      }
    });

    return response.text ?? "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ERRORE DI SISTEMA: Impossibile contattare il Bey-Database. Riprova più tardi.";
  }
};