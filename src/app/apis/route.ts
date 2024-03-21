import {PrismaClient} from "@prisma/client/extension";

export async function Get() {
    const prisma = new PrismaClient()
    await prisma.ToolKit.findMany()
}