/*
  Warnings:

  - The values [PAYMENT] on the enum `OTPPurpose` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OTPPurpose_new" AS ENUM ('LOGIN', 'SIGNUP', 'VERIFY_TRANSACTION');
ALTER TABLE "OTP" ALTER COLUMN "purpose" TYPE "OTPPurpose_new" USING ("purpose"::text::"OTPPurpose_new");
ALTER TYPE "OTPPurpose" RENAME TO "OTPPurpose_old";
ALTER TYPE "OTPPurpose_new" RENAME TO "OTPPurpose";
DROP TYPE "public"."OTPPurpose_old";
COMMIT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
