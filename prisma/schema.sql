CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "batch" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "instituteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL, "language" TEXT DEFAULT 'both',
    CONSTRAINT "User_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "InstituteExamSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instituteId" TEXT NOT NULL,
    "examSetId" TEXT NOT NULL,
    CONSTRAINT "InstituteExamSet_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InstituteExamSet_examSetId_fkey" FOREIGN KEY ("examSetId") REFERENCES "ExamSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examSetId" TEXT NOT NULL,
    "qIndex" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "mainHeading" TEXT,
    "questionHeading" TEXT,
    "description" TEXT,
    "image" TEXT,
    "audio" TEXT,
    "optionsJson" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_examSetId_fkey" FOREIGN KEY ("examSetId") REFERENCES "ExamSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ExamSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examSetId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT "ExamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamSession_examSetId_fkey" FOREIGN KEY ("examSetId") REFERENCES "ExamSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ExamResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examSetId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "readingScore" INTEGER NOT NULL DEFAULT 0,
    "listeningScore" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 40,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "unanswered" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answersJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamResult_examSetId_fkey" FOREIGN KEY ("examSetId") REFERENCES "ExamSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'all',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "InstituteExamSet_instituteId_examSetId_key" ON "InstituteExamSet"("instituteId", "examSetId");
CREATE UNIQUE INDEX "ExamResult_sessionId_key" ON "ExamResult"("sessionId");
CREATE TABLE IF NOT EXISTS "BillingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instituteId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "panVatNumber" TEXT NOT NULL,
    "logoUrl" TEXT,
    "stampUrl" TEXT,
    "googleSheetUrl" TEXT,
    "ownerEmail" TEXT,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "BillingProfile_instituteId_key" ON "BillingProfile"("instituteId");
CREATE TABLE IF NOT EXISTS "BillRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billNumber" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "parentNumber" TEXT,
    "courseDetail" TEXT NOT NULL,
    "coursePackage" TEXT NOT NULL,
    "paymentSystem" TEXT NOT NULL,
    "grossFee" REAL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "totalFee" REAL NOT NULL,
    "vatPercent" REAL NOT NULL DEFAULT 13,
    "vatAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL,
    "dueAmount" REAL NOT NULL DEFAULT 0,
    "amountInWords" TEXT NOT NULL,
    "firstInstallment" REAL,
    "firstBillNo" TEXT,
    "firstPaymentDate" TEXT,
    "secondInstallment" REAL,
    "secondBillNo" TEXT,
    "secondPaymentDate" TEXT,
    "thirdInstallment" REAL,
    "thirdBillNo" TEXT,
    "thirdPaymentDate" TEXT,
    "paymentsJson" TEXT,
    "materialsJson" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL,
    "parentBillNumber" TEXT,
    "isSyncedToSheet" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "classTime" TEXT, "parentName" TEXT, "admittedDate" TEXT);
CREATE UNIQUE INDEX "BillRecord_billNumber_key" ON "BillRecord"("billNumber");
CREATE TABLE IF NOT EXISTS "ExamPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorInstituteId" TEXT,
    "creatorInstituteName" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ExamPackage_name_key" ON "ExamPackage"("name");
CREATE TABLE IF NOT EXISTS "Institute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "subscription" TEXT NOT NULL DEFAULT '1 Month',
    "entryDate" TEXT NOT NULL,
    "expireDate" TEXT NOT NULL,
    "examPackage" TEXT NOT NULL DEFAULT 'Full Set UBT',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "logoUrl" TEXT,
    "watermarkText" TEXT,
    "language" TEXT NOT NULL DEFAULT 'both',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Institute_username_key" ON "Institute"("username");
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionUuid" TEXT NOT NULL,
    "transactionCode" TEXT,
    "userId" TEXT,
    "studentPhone" TEXT,
    "studentName" TEXT,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "gateway" TEXT NOT NULL DEFAULT 'ESEWA',
    "rawResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "PaymentTransaction_transactionUuid_key" ON "PaymentTransaction"("transactionUuid");
CREATE TABLE IF NOT EXISTS "ExamSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "packageName" TEXT,
    "packageId" TEXT,
    "creatorInstituteId" TEXT,
    "creatorInstituteName" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "setType" TEXT DEFAULT 'UBT',
    "duration" INTEGER NOT NULL DEFAULT 3000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamSet_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ExamPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
