/**
 * SMS Service - Stub for testing / future integration.
 * Will connect to NetGSM, Twilio, or another provider later.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log("──────────── SMS (DEV MODE) ────────────");
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log("────────────────────────────────────────");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return true;
}

export const smsService = {
    sendSMS,
};
