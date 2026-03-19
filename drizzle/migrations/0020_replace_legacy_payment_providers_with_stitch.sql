ALTER TYPE "payment_provider" RENAME TO "payment_provider_old";

CREATE TYPE "payment_provider" AS ENUM ('stitch');

ALTER TABLE "contributions"
ALTER COLUMN "payment_provider" TYPE "payment_provider"
USING ('stitch'::"payment_provider");

DROP TYPE "payment_provider_old";
