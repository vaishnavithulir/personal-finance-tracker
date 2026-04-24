import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const auth = verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ msg: auth.error }, { status: auth.status });
  }

  try {
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ msg: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ msg: "Security credentials updated successfully." });
  } catch (err: any) {
    console.error("PASSWORD UPDATE ERROR:", err.message);
    return NextResponse.json({ msg: "Server Error: " + err.message }, { status: 500 });
  }
}
