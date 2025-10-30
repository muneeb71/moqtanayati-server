-- Set default for Review.status to PENDING in a separate migration
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';


