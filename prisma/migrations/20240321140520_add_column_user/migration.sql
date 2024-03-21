-- CreateTable
CREATE TABLE "ToolKit" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "logo" TEXT,
    "article" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "ToolKit_pkey" PRIMARY KEY ("id")
);
