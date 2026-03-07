-- CreateTable
CREATE TABLE "FulfillmentArtifact" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "path" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FulfillmentArtifact_orderId_key" ON "FulfillmentArtifact"("orderId");

-- AddForeignKey
ALTER TABLE "FulfillmentArtifact" ADD CONSTRAINT "FulfillmentArtifact_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
