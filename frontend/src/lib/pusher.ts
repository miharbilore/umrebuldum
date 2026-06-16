import type Pusher from "pusher";
import type PusherClientType from "pusher-js";

const PusherServerClass = require("pusher") as typeof Pusher;
const PusherClientClass = typeof window !== "undefined" ? require("pusher-js") : null;

// Server instance (only safe to use in API routes / Server Components)
export const pusherServer: Pusher = typeof window === "undefined" 
    ? new PusherServerClass({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        useTLS: true,
    }) 
    : (null as any);

// Client instance (used in Client Components)
export const pusherClient: PusherClientType = typeof window !== "undefined" && PusherClientClass
    ? new (PusherClientClass.default || PusherClientClass)(
        process.env.NEXT_PUBLIC_PUSHER_KEY!,
        {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        }
    )
    : (null as any);
