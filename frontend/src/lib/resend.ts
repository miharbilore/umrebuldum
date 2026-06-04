import { Resend } from 'resend';

// Initialize Resend client using the RESEND_API_KEY environment variable.
// Make sure RESEND_API_KEY is defined in your .env file.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');
