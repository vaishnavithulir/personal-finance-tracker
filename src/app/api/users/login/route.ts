import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ msg: "Invalid Credentials" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return NextResponse.json({ msg: "Invalid Credentials" }, { status: 400 });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1000h" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ msg: "Server Error" }, { status: 500 });
  }
}
