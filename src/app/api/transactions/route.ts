import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ msg: auth.error }, { status: auth.status });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ msg: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ msg: auth.error }, { status: auth.status });
  }

  try {
    const { description, amount, type, category } = await req.json();

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        type,
        legacyCategory: category || "Other",
        userId: auth.user.id,
      },
    });

    return NextResponse.json(transaction);
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ msg: "Server Error" }, { status: 500 });
  }
}
