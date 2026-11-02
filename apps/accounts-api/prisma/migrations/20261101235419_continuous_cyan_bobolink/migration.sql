-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'RESTRICTED', 'SUSPENDED', 'PENDING_DELETION', 'ANONYMIZED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "email_verified_at" TIMESTAMPTZ(6),
    "password_hash" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "given_name" VARCHAR(100),
    "family_name" VARCHAR(100),
    "display_name" VARCHAR(150),
    "avatar_url" TEXT,
    "locale" VARCHAR(35),
    "timezone" VARCHAR(64),
    "terms_accepted_at" TIMESTAMPTZ(6),
    "terms_version" VARCHAR(32),
    "privacy_policy_accepted_at" TIMESTAMPTZ(6),
    "privacy_policy_version" VARCHAR(32),
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent_at" TIMESTAMPTZ(6),
    "marketing_consent_version" VARCHAR(32),
    "analytics_consent" BOOLEAN NOT NULL DEFAULT false,
    "analytics_consent_at" TIMESTAMPTZ(6),
    "analytics_consent_version" VARCHAR(32),
    "status" "user_status" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "processing_restricted" BOOLEAN NOT NULL DEFAULT false,
    "processing_restricted_at" TIMESTAMPTZ(6),
    "restriction_reason" VARCHAR(255),
    "last_data_export_requested_at" TIMESTAMPTZ(6),
    "last_data_exported_at" TIMESTAMPTZ(6),
    "deletion_requested_at" TIMESTAMPTZ(6),
    "deletion_scheduled_at" TIMESTAMPTZ(6),
    "anonymized_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "last_activity_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deletion_scheduled_at_idx" ON "users"("deletion_scheduled_at");

-- CreateIndex
CREATE INDEX "users_last_activity_at_idx" ON "users"("last_activity_at");
