import { prisma } from "../src/lib/prisma";
import { TokenService } from "../src/lib/token-service";
import { Prisma } from "@prisma/client";

/**
 * ATOMICITY STRESS TEST (Serializable & Rollback Verification)
 * 
 * Goal: Prove that under Serializable isolation, a failing transaction 
 * correctly rolls back all operations (User state & Token grant).
 */
async function runAtomicityTest() {
    // 1. Production Guard (Senior Architect Requirement)
    if (process.env.NODE_ENV === 'production') {
        console.error("❌ CRITICAL: This script cannot be run in PRODUCTION environment.");
        process.exit(1);
    }

    // 2. Dynamic CLI Argument Support
    const testUserId = process.argv[2] || "cmmhzs1p500003uj64jbhi0l5"; 
    
    if (!testUserId) {
        console.error("❌ ERROR: Please provide a userId as an argument. Usage: npm run test:atomicity <userId>");
        process.exit(1);
    }

    console.log(`=== [SENIOR ARCHITECT] STARTING ATOMICITY TEST (User: ${testUserId}) ===`);

    // 3. Capture initial state
    const beforeUser = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { quizAttempts: true, tokenBalance: true }
    });
    
    if (!beforeUser) {
        console.error(`❌ ERROR: User ${testUserId} not found in database.`);
        process.exit(1);
    }

    console.log(`[Initial State] Attempts: ${beforeUser.quizAttempts}, Balance: ${beforeUser.tokenBalance}`);

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            console.log("1. Incrementing quizAttempts in transaction...");
            await tx.user.update({
                where: { id: testUserId },
                data: { quizAttempts: { increment: 1 } }
            });

            console.log("2. Granting credits via TokenService (passing tx)...");
            await TokenService.grantCredits(
                testUserId,
                15,
                "admin",
                "ATOMICITY_STRESS_TEST_V2",
                undefined,
                `idemp_test_v2_${Date.now()}`,
                tx
            );

            console.log("3. !!! Intentional Failure: Throwing Error mid-transaction !!!");
            throw new Error("SIMULATED_TRANSACTION_FAILURE");
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
    } catch (err: any) {
        if (err.message === "SIMULATED_TRANSACTION_FAILURE") {
            console.log("Caught expected simulation failure. Checking database state...");
        } else {
            console.error("Caught UNEXPECTED error:", err);
        }
    }

    // 4. Verify Final State (Should be identical to initial state)
    const afterUser = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { quizAttempts: true, tokenBalance: true }
    });

    if (!afterUser) {
        console.error("❌ ERROR: User disappeared during test?");
        process.exit(1);
    }

    console.log(`[Final State]   Attempts: ${afterUser.quizAttempts}, Balance: ${afterUser.tokenBalance}`);

    const isAttemptsRolledBack = beforeUser.quizAttempts === afterUser.quizAttempts;
    const isBalanceRolledBack = beforeUser.tokenBalance === afterUser.tokenBalance;

    if (isAttemptsRolledBack && isBalanceRolledBack) {
        console.log("\n✅ PROOF SUCCESSFUL: Both operations were rolled back.");
        console.log("🚀 SISTEM BİR TANK KADAR SAĞLAM!");
    } else {
        console.log("\n❌ PROOF FAILED: Data was partially committed!");
        if (!isAttemptsRolledBack) console.log("   - quizAttempts was NOT rolled back");
        if (!isBalanceRolledBack) console.log("   - tokenBalance was NOT rolled back");
        process.exit(1);
    }
}

runAtomicityTest()
    .catch(err => {
        console.error("Test execution failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
