import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";
import { getBackupData } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Downloads all orders, enquiries, products and settings as one JSON file. Signed-in admins only.
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) return new NextResponse("Unauthorized", { status: 401 });

  const data = await getBackupData();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="outtake-backup-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
