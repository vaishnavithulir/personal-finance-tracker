import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ msg: "Missing userID" }, { status: 400 });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        summary: "No transactions found yet. Add some to get insights!",
        tips: ["Spend less than you earn", "Invest in yourself", "Track everything"],
        encouragement: "Everyone starts somewhere. Start tracking today!",
      });
    }

    const dataStr = transactions
      .map((t) => `${t.type}: ₹${t.amount} (${t.category?.name || t.legacyCategory} - ${t.description})`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ msg: "API Key missing in .env" }, { status: 500 });
    }

    const prompt = `
            You are a professional financial advisor. Analyze the following recent transactions for a user and provide:
            1. A brief summary of their spending habits (be concise).
            2. Three actionable tips to save money or invest more effectively.
            3. A short, powerful motivational boost.

            Respond ONLY with a JSON object in this format:
            {
               "summary": "...",
               "tips": ["tip1", "tip2", "tip3"],
               "encouragement": "..."
            }

            Transactions:
            ${dataStr}
        `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      let aiText = result.candidates[0].content.parts[0].text;
      if (aiText.includes("```json")) {
        aiText = aiText.split("```json")[1].split("```")[0];
      } else if (aiText.includes("```")) {
        aiText = aiText.split("```")[1].split("```")[0];
      }
      return NextResponse.json(JSON.parse(aiText.trim()));
    } else {
      throw new Error("Invalid AI response");
    }
  } catch (err: any) {
    console.error("AI Error:", err.message);
    return NextResponse.json({ msg: "Error generating advice" }, { status: 500 });
  }
}
