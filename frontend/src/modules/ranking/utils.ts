import { EMA_ALPHA } from "./constants";

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Apply Exponential Moving Average to prevent ranking oscillation.
 * α=0.3: 70% weight on previous, 30% on new → smooth convergence in ~5 cycles.
 */
export function smoothScore(rawScore: number, previousScore: number | null): number {
    if (previousScore === null) return rawScore;
    return Math.round(EMA_ALPHA * rawScore + (1 - EMA_ALPHA) * previousScore);
}
