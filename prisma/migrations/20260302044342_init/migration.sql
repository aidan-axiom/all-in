-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "betType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stake" REAL NOT NULL,
    "odds" INTEGER,
    "payout" REAL,
    "teaserPoints" REAL,
    "sportsbook" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "betId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "league" TEXT,
    "eventName" TEXT NOT NULL,
    "eventDate" DATETIME,
    "marketType" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "odds" INTEGER NOT NULL,
    "line" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Leg_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Bet_userId_idx" ON "Bet"("userId");

-- CreateIndex
CREATE INDEX "Bet_status_idx" ON "Bet"("status");

-- CreateIndex
CREATE INDEX "Bet_placedAt_idx" ON "Bet"("placedAt");

-- CreateIndex
CREATE INDEX "Leg_betId_idx" ON "Leg"("betId");
