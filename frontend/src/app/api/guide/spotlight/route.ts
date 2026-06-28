import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";
import { requestSpotlight } from "@/modules/tokens/application/spotlight.service";
import crypto from 'crypto';

interface SpotlightRequest {
    listingId: string;
    city: string;
}

interface SpotlightResponse {
    success?: boolean;
    error?: string;
    ok?: boolean;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const { listingId, city } = (await req.json()) as SpotlightRequest;

        if (!listingId || !city) {
            return NextResponse.json<SpotlightResponse>({ error: "Missing listingId or city" }, { status: 400 });
        }

        // Generate idempotency key specifically for this request server-side
        // Format: spotlight:${userId}:${listingId}:${YYYYMMDD-HH}
        const hourBucket = new Date().toISOString().slice(0, 13);
        const idempotencyKey = crypto.createHash('sha256')
            .update(`spotlight:${session!.user.id}:${listingId}:${hourBucket}`)
            .digest('hex');

        const result = await requestSpotlight(
            session!.user.id!,
            listingId,
            city,
            idempotencyKey
        );

        if (!result.ok) {
            return NextResponse.json<SpotlightResponse>({ error: result.error }, { status: 403 });
        }

        return NextResponse.json<SpotlightResponse>({ success: true, ...result });

    } catch (error: unknown) {
        return NextResponse.json<SpotlightResponse>({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
