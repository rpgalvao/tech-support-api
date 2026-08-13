-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN     "accommodation_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "labor_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "travel_cost" DECIMAL(10,2) NOT NULL DEFAULT 0;
