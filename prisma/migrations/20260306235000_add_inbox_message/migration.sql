-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputText" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "replies" JSONB NOT NULL,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);
