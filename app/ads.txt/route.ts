import { NextResponse } from "next/server";

/**
 * AdSense ads.txt — required for authorized sellers once ads run in production.
 * https://support.google.com/adsense/answer/7532444
 */
export function GET() {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "";
  const pub = raw.replace(/^ca-/, "");
  if (!pub.startsWith("pub-")) {
    return new NextResponse(
      "# Add NEXT_PUBLIC_ADSENSE_PUBLISHER_ID (e.g. ca-pub-… ) to enable ads.txt\n",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
