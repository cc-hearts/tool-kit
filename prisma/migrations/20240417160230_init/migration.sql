-- CreateTable
CREATE TABLE "ToolKit" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "logo" TEXT,
    "article" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "ToolKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationLogger" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationLogger_pkey" PRIMARY KEY ("id")
);
