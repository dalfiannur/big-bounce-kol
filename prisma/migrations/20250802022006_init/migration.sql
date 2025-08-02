-- DropForeignKey
ALTER TABLE "public"."Follower" DROP CONSTRAINT "Follower_memberId_fkey";

-- AlterTable
ALTER TABLE "public"."Follower" ALTER COLUMN "memberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Follower" ADD CONSTRAINT "Follower_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
