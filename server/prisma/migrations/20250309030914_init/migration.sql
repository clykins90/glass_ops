-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "isLead" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "vinNumber" TEXT,
    "licensePlate" TEXT,
    "glassType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "vehicleId" INTEGER,
    "technicianId" INTEGER,
    "serviceType" TEXT NOT NULL,
    "glassLocation" TEXT NOT NULL,
    "materialsRequired" TEXT,
    "materialsUsed" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "paymentType" TEXT,
    "paymentStatus" TEXT,
    "insuranceClaim" BOOLEAN NOT NULL DEFAULT false,
    "insuranceInfo" TEXT,
    "warrantyInfo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "skills" TEXT[],
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
