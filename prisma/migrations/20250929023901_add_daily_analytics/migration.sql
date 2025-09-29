-- CreateTable
CREATE TABLE "public"."daily_analytics" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "totalStaked" INTEGER NOT NULL DEFAULT 0,
    "totalUnstaked" INTEGER NOT NULL DEFAULT 0,
    "netStaked" INTEGER NOT NULL DEFAULT 0,
    "cumulativeStaked" INTEGER NOT NULL DEFAULT 0,
    "totalClaimed" INTEGER NOT NULL DEFAULT 0,
    "totalPending" INTEGER NOT NULL DEFAULT 0,
    "dailyRewardsGenerated" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_analytics_date_key" ON "public"."daily_analytics"("date");
