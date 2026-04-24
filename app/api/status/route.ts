import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ 
      status: "alive", 
      database: "connected",
      time: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ 
      status: "error", 
      database: "disconnected",
      message: err.message 
    }, { status: 500 });
  }
}
