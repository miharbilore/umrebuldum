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
    const testUserId = "cmmhzs1p500003uj64jbhi0l5"; // Sample Admin account

    console.log("=== [SENIOR ARCHITECT] STARTING ATOMICITY TEST ===");

    // 1. Capture initial state
    const beforeUser = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { quizAttempts: true, tokenBalance: true }
    });
    
    console.log(`[Initial State] Attempts: ${beforeUser?.quizAttempts}, Balance: ${beforeUser?.tokenBalance}`);

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
                "ATOMICITY_STRESS_TEST",
                undefined,
                `idemp_test_${Date.now()}`,
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

    // 2. Verify Final State (Should be identical to initial state)
    const afterUser = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { quizAttempts: true, tokenBalance: true }
    });

    console.log(`[Final State]   Attempts: ${afterUser?.quizAttempts}, Balance: ${afterUser?.tokenBalance}`);

    const isAttemptsRolledBack = beforeUser?.quizAttempts === afterUser?.quizAttempts;
    const isBalanceRolledBack = beforeUser?.tokenBalance === afterUser?.tokenBalance;

    if (isAttemptsRolledBack && isBalanceRolledBack) {
        console.log("\n✅ PROOF SUCCESSFUL: Both operations were rolled back.");
        console.log("🎉 SISTEM TAMAMEN KİLİTLENDİ VE GÜVENDE!");
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
