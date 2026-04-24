import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ msg: auth.error }, { status: auth.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        fullName: true,
        email: true,
        role: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ msg: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("PROFILE GET ERROR:", err.message);
    return NextResponse.json({ msg: "Server Error: " + err.message }, { status: 500 });
  }
}
