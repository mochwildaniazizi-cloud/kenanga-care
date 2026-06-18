-- CreateTable
CREATE TABLE "mothers" (
    "mother_id" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "age" INTEGER,
    "husband_name" TEXT,
    "phone_number" TEXT,
    "blood_type" TEXT,
    "estimated_due_date" TIMESTAMP(3),
    "risk_status" TEXT,
    "number_of_children" INTEGER DEFAULT 0,
    "ui_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mothers_pkey" PRIMARY KEY ("mother_id")
);

-- CreateTable
CREATE TABLE "children" (
    "child_id" TEXT NOT NULL,
    "mother_id" TEXT NOT NULL,
    "national_id" TEXT,
    "child_name" TEXT NOT NULL,
    "birth_order" INTEGER,
    "birth_date" TIMESTAMP(3),
    "gender" VARCHAR(1) NOT NULL,
    "birth_weight" DECIMAL(5,2),
    "birth_length" DECIMAL(5,2),
    "current_weight" DECIMAL(5,2),
    "current_height" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("child_id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "schedule_id" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "service_focus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "schedule_logs" (
    "log_id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "change_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL,
    "change_details" TEXT NOT NULL,

    CONSTRAINT "schedule_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "child_measurements" (
    "measurement_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "measurement_method" TEXT,
    "head_circumference" DECIMAL(4,2),
    "vitamin_a_capsule" TEXT,
    "deworming_pill" BOOLEAN NOT NULL DEFAULT false,
    "immunizations" TEXT,
    "supplementary_feeding" BOOLEAN NOT NULL DEFAULT false,
    "cadre_notes" TEXT,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_measurements_pkey" PRIMARY KEY ("measurement_id")
);

-- CreateTable
CREATE TABLE "maternal_health_records" (
    "record_id" TEXT NOT NULL,
    "mother_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(5,2),
    "blood_pressure" TEXT,
    "muac" DECIMAL(4,2),
    "fundal_height" DECIMAL(4,2),
    "fetal_heart_rate" INTEGER,
    "iron_pills_given" INTEGER DEFAULT 0,
    "cadre_notes" TEXT,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maternal_health_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mothers_national_id_key" ON "mothers"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "children_national_id_key" ON "children"("national_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "mothers"("mother_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_logs" ADD CONSTRAINT "schedule_logs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_measurements" ADD CONSTRAINT "child_measurements_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("child_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_measurements" ADD CONSTRAINT "child_measurements_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maternal_health_records" ADD CONSTRAINT "maternal_health_records_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "mothers"("mother_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maternal_health_records" ADD CONSTRAINT "maternal_health_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE SET NULL ON UPDATE CASCADE;
