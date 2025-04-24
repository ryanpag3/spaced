/*
  Warnings:

  - You are about to drop the column `encryptedMasterKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedPrivateKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kekSalt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `masterKeyNonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privateKeyNonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "encryptedMasterKey",
DROP COLUMN "encryptedPrivateKey",
DROP COLUMN "kekSalt",
DROP COLUMN "masterKeyNonce",
DROP COLUMN "privateKeyNonce",
DROP COLUMN "publicKey";

-- DropTable
DROP TABLE "Media";
