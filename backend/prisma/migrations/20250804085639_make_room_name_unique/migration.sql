/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `BreakoutRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BreakoutRoom_name_key" ON "BreakoutRoom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
