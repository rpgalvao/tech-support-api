-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN     "client_signature" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "signature_url" TEXT;
