import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyAuth(req: Request) {
  const token = req.headers.get("x-auth-token");
  if (!token) {
    return { error: "No token, authorization denied", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    return { user: decoded.user };
  } catch (err) {
    return { error: "Token is not valid", status: 401 };
  }
}
