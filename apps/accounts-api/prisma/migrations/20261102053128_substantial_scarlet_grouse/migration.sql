/*
  Warnings:

  - You are about to drop the column `analytics_consent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `analytics_consent_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `analytics_consent_version` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `anonymized_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletion_requested_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletion_scheduled_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `family_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_activity_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_data_export_requested_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_data_exported_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_consent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_consent_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_consent_version` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `privacy_policy_accepted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `privacy_policy_version` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `processing_restricted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `processing_restricted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `restriction_reason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_accepted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_version` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_deletion_scheduled_at_idx";

-- DropIndex
DROP INDEX "users_last_activity_at_idx";

-- DropIndex
DROP INDEX "users_status_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "analytics_consent",
DROP COLUMN "analytics_consent_at",
DROP COLUMN "analytics_consent_version",
DROP COLUMN "anonymized_at",
DROP COLUMN "avatar_url",
DROP COLUMN "deleted_at",
DROP COLUMN "deletion_requested_at",
DROP COLUMN "deletion_scheduled_at",
DROP COLUMN "family_name",
DROP COLUMN "given_name",
DROP COLUMN "last_activity_at",
DROP COLUMN "last_data_export_requested_at",
DROP COLUMN "last_data_exported_at",
DROP COLUMN "last_login_at",
DROP COLUMN "locale",
DROP COLUMN "marketing_consent",
DROP COLUMN "marketing_consent_at",
DROP COLUMN "marketing_consent_version",
DROP COLUMN "privacy_policy_accepted_at",
DROP COLUMN "privacy_policy_version",
DROP COLUMN "processing_restricted",
DROP COLUMN "processing_restricted_at",
DROP COLUMN "restriction_reason",
DROP COLUMN "status",
DROP COLUMN "terms_accepted_at",
DROP COLUMN "terms_version",
DROP COLUMN "timezone",
DROP COLUMN "updated_at";

-- DropEnum
DROP TYPE "user_status";
