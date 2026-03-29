import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-static';
import prisma from "@/lib/db";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst({
      where: { id: "site_settings" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "site_settings" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: "site_settings" },
      update: body,
      create: { id: "site_settings", ...body },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
