/*
  Warnings:

  - You are about to drop the column `technicianId` on the `service_orders` table. All the data in the column will be lost.
  - Added the required column `openedById` to the `service_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EquipmentStatus" ADD VALUE 'RECEBIDO';

-- DropForeignKey
ALTER TABLE "service_orders" DROP CONSTRAINT "service_orders_technicianId_fkey";

-- AlterTable
ALTER TABLE "equipments" ALTER COLUMN "status" SET DEFAULT 'RECEBIDO';

-- AlterTable
ALTER TABLE "service_orders" DROP COLUMN "technicianId",
ADD COLUMN     "closedById" TEXT,
ADD COLUMN     "openedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
