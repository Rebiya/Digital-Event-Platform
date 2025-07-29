-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isBreakout" BOOLEAN NOT NULL DEFAULT false,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakoutRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreakoutRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BreakoutRoom" ADD CONSTRAINT "BreakoutRoom_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
