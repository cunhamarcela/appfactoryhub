-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "techBackend" TEXT NOT NULL DEFAULT 'firebase_functions',
ADD COLUMN     "techDatabase" TEXT NOT NULL DEFAULT 'firebase',
ADD COLUMN     "techFrontend" TEXT NOT NULL DEFAULT 'flutter',
ADD COLUMN     "techLanguage" TEXT NOT NULL DEFAULT 'flutter';

-- CreateTable
CREATE TABLE "public"."Surface" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Surface_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feature" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "surfaces" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'planned',
    "repoSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Surface" ADD CONSTRAINT "Surface_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feature" ADD CONSTRAINT "Feature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
