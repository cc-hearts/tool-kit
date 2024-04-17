
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const POST = async (params: any) => {
  const prisma = new PrismaClient()
  const body = await params.json();
  const { type } = body
  if (typeof type === 'string') {
    await prisma.translationLogger.create({ data: { type } })
  }
  return NextResponse.json({ code: 200, message: 'ok' })
}