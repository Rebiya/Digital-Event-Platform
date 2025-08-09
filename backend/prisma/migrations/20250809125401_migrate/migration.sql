/*
  Warnings:

  - You are about to drop the column `parentId` on the `BreakoutRoom` table. All the data in the column will be lost.
  - Added the required column `hostId` to the `BreakoutRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainRoomId` to the `BreakoutRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BreakoutRoom" DROP CONSTRAINT "BreakoutRoom_parentId_fkey";

-- DropIndex
DROP INDEX "BreakoutRoom_name_key";

-- AlterTable
ALTER TABLE "BreakoutRoom" DROP COLUMN "parentId",
ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "mainRoomId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BreakoutRoomParticipant" (
    "id" TEXT NOT NULL,
    "breakoutRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BreakoutRoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BreakoutRoomParticipant_breakoutRoomId_userId_key" ON "BreakoutRoomParticipant"("breakoutRoomId", "userId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakoutRoom" ADD CONSTRAINT "BreakoutRoom_mainRoomId_fkey" FOREIGN KEY ("mainRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakoutRoom" ADD CONSTRAINT "BreakoutRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakoutRoomParticipant" ADD CONSTRAINT "BreakoutRoomParticipant_breakoutRoomId_fkey" FOREIGN KEY ("breakoutRoomId") REFERENCES "BreakoutRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakoutRoomParticipant" ADD CONSTRAINT "BreakoutRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
