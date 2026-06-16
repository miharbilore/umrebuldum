// import * as Sentry from "@sentry/nextjs";
const Sentry = {
  captureException: (...args: any[]) => console.error("[Sentry Mock]", ...args),
};

/**
 * A safe wrapper to dispatch background jobs in a serverless environment.
 * If the queue network is un-reachable, it logs to Sentry but DOES NOT 
 * interrupt the primary HTTP response cycle (Zero blocking).
 */
export const safeInngestSend = async (inngestClient: any, eventPayload: any) => {
  try {
    await inngestClient.send(eventPayload);
  } catch (err: any) {
    // Development ortamında anahtar yoksa uyarıyı sessize al (konsolu kirletmemesi için)
    const isMissingKey = err?.message?.includes("INNGEST_EVENT_KEY") || err?.message?.includes("event key");
    
    if (process.env.NODE_ENV === "development") {
      if (!isMissingKey) {
        console.error("[Inngest Send Failed]", err);
      }
    } else {
      Sentry.captureException(err);
    }
  }
};
