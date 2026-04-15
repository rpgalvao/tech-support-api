-- CreateEnum
CREATE TYPE "ServiceOrderStatus" AS ENUM ('ABERTA', 'FINALIZADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "status" "ServiceOrderStatus" NOT NULL DEFAULT 'ABERTA';
