/*
  Warnings:

  - You are about to drop the column `encryptedPrivateKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "encryptedPrivateKey",
ADD COLUMN     "masterKeyNonce" TEXT;
