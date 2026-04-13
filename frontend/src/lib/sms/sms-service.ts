/**
 * SMS Service - Stub for testing / future integration.
 * Will connect to NetGSM, Twilio, or another provider later.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SMS (DEV MODE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€");
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return true;
}

export const smsService = {
    sendSMS,
};
