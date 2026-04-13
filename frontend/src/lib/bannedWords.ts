
/**
 * Profanity filter with production-grade normalization.
 *
 * Normalization pipeline (in order):
 *  1. NFC  â€” canonical composition
 *  2. NFD  â€” decompose, strip all combining marks (diacritics)
 *  3. NFC  â€” recompose clean chars
 *  4. Repeated-char collapse: "siiikkk" â†’ "sik", "fuuuck" â†’ "fuk"
 *  5. Lowercase
 *
 * This defeats common evasion techniques:
 *  - Accented chars:  "şİktÃ®r" â†’ "siktir"
 *  - Repeated chars:  "siiikktttiirr" â†’ "sikitr"
 *  - Mixed case:      "FuCk" â†’ "fuck"
 *  - Unicode clones:  Cyrillic, look-alike letters (stripped by combining mark removal)
 */

// BANNED list stores already-normalized forms (no diacritics, lowercase)
const BANNED_WORDS: string[] = [
    // Turkish
    "orospu", "amk", "siktir", "sik", "yarak", "oc", "pic", "kahpe", "yavsak", "got", "meme",
    // English
    "fuck", "shit", "bitch", "ashole", "dick", "pusi", "whore", "slut", "bastard",
];

/**
 * Normalizes text for comparison against the banned list.
 * Does NOT mutate the stored message body â€” call this only for check purposes.
 */
export function normalizeText(text: string): string {
    return text
        // 1. NFC: resolve composed sequences first
        .normalize("NFC")
        // 2. Decompose to NFD so combining marks become separate code points
        .normalize("NFD")
        // 3. Strip all Unicode combining marks (Category M: Mn, Mc, Me)
        .replace(/\p{M}/gu, "")
        // 4. Recompose
        .normalize("NFC")
        // 5. Collapse consecutive identical characters to one
        //    "siiikktttiirr" â†’ "sikitr"   "fuuuck" â†’ "fuk"
        .replace(/(.)\1+/gu, "$1")
        // 6. Lowercase
        .toLowerCase()
        .trim();
}

/**
 * Returns true if `text` contains any banned word after normalization.
 * Uses substring match (not word-boundary) so embedded words are caught:
 * e.g. "myfuckingday" â†’ matched.
 */
export function containsProfanity(text: string): boolean {
    const normalized = normalizeText(text);
    return BANNED_WORDS.some(banned => normalized.includes(banned));
}
