import { randomBytes } from "crypto";

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_LENGTH = 8; // 8 hex chars = 4 bytes of entropy each

/**
 * Generate a set of one-time recovery codes for 2FA backup.
 * Returns both the plaintext codes (to show to user once) and hashed versions (to store in DB).
 */
export async function generateRecoveryCodes(): Promise<{
    plaintextCodes: string[];
    hashedCodes: string[];
}> {
    const bcrypt = await import("bcryptjs");
    const plaintextCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
        // Generate readable code: XXXX-XXXX format
        const raw = randomBytes(RECOVERY_CODE_LENGTH / 2).toString("hex").toUpperCase();
        const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
        plaintextCodes.push(code);

        const hash = await bcrypt.hash(code, 10);
        hashedCodes.push(hash);
    }

    return { plaintextCodes, hashedCodes };
}

/**
 * Verify a recovery code against the stored hashed codes.
 * Returns the index of the matched code (for removal), or -1 if no match.
 */
export async function verifyRecoveryCode(
    inputCode: string,
    hashedCodes: string[]
): Promise<number> {
    const bcrypt = await import("bcryptjs");
    const normalized = inputCode.trim().toUpperCase();

    for (let i = 0; i < hashedCodes.length; i++) {
        const isMatch = await bcrypt.compare(normalized, hashedCodes[i]);
        if (isMatch) return i;
    }

    return -1;
}
