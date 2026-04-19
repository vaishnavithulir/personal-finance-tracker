import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ msg: auth.error }, { status: auth.status });
  }

  try {
    // Check Admin Role
    if (!auth.user.role || auth.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ msg: "Access denied. Admins only." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
        createdAt: true,
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ msg: "Server Error" }, { status: 500 });
  }
}
