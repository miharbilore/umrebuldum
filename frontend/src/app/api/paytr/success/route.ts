import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        `<html>
            <body>
                <script>
                    window.top.location.href = "/dashboard/billing?success=true";
                </script>
                <p>Yönlendiriliyorsunuz...</p>
            </body>
        </html>`,
        {
            headers: {
                "Content-Type": "text/html",
            },
        }
    );
}
