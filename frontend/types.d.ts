declare module 'react-day-picker' {
    export interface DateRange {
        from?: Date;
        to?: Date;
    }
    export type DayPickerProps = any;
    export const DayPicker: any;
    export const DayButton: any;
    export const getDefaultClassNames: any;
}
declare module 'firebase/app';
declare module 'firebase/auth' {
    export class RecaptchaVerifier {
        constructor(container: unknown, parameters?: unknown, auth?: unknown);
        clear(): void;
    }
    export interface ConfirmationResult {
        confirm(code: string): Promise<{ user: { getIdToken(): Promise<string> } }>;
    }
    export function signInWithPhoneNumber(auth: unknown, phoneNumber: string, appVerifier: unknown): Promise<ConfirmationResult>;
    export function getAuth(app?: unknown): unknown;
}
declare module 'framer-motion' {
    export const motion: Record<string, React.FC<Record<string, unknown>>>;
    export const AnimatePresence: React.FC<{children: React.ReactNode}>;
    export interface Variants {
        [key: string]: unknown;
    }
    export type HTMLMotionProps<T> = Record<string, unknown>;
}
