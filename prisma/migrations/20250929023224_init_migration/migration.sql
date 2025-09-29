-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "firstVisitTime" INTEGER NOT NULL,
    "labsBalance" INTEGER NOT NULL,
    "xLABSBalance" INTEGER NOT NULL,
    "stakedBalance" INTEGER NOT NULL,
    "unstakedBalance" INTEGER NOT NULL,
    "pendingRewards" INTEGER NOT NULL,
    "interestIndex" INTEGER NOT NULL,
    "bump" INTEGER NOT NULL,
    "totalXLabsClaimed" INTEGER NOT NULL DEFAULT 0,
    "pendingXLabsClaim" INTEGER NOT NULL DEFAULT 0,
    "lastClaimTime" INTEGER,
    "lastPendingUpdate" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_stats" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "totalXLabsClaimed" INTEGER NOT NULL DEFAULT 0,
    "totalPendingXLabs" INTEGER NOT NULL DEFAULT 0,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalStaked" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "public"."users"("walletAddress");
