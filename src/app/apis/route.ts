import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    const prisma = new PrismaClient()
    const ret = await prisma.toolKit.findMany()
    return NextResponse.json(ret)
}

export async function POST() {

}