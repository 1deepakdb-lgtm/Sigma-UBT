import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEsewaConfig, verifyEsewaSignature, queryEsewaTransactionStatus } from "@/lib/esewa";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const dataEncoded = searchParams.get("data");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    if (!dataEncoded) {
      console.warn("[eSewa Verify] No 'data' param received in callback");
      return NextResponse.redirect(`${origin}/student?payment_status=failed&reason=missing_data`);
    }

    // Decode base64 payload
    let decodedData = {};
    try {
      const decodedJson = Buffer.from(dataEncoded, "base64").toString("utf-8");
      decodedData = JSON.parse(decodedJson);
    } catch (parseErr) {
      console.error("[eSewa Verify] Failed to decode base64 data:", parseErr);
      return NextResponse.redirect(`${origin}/student?payment_status=failed&reason=invalid_data_format`);
    }

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code
    } = decodedData;

    if (!transaction_uuid) {
      return NextResponse.redirect(`${origin}/student?payment_status=failed&reason=missing_uuid`);
    }

    // Require transaction to exist in database
    const tx = await prisma.paymentTransaction.findUnique({
      where: { transactionUuid: transaction_uuid }
    });

    if (!tx) {
      console.warn("[eSewa Verify] Unregistered transaction callback rejected:", transaction_uuid);
      return NextResponse.redirect(`${origin}/student?payment_status=failed&reason=invalid_transaction`);
    }

    // Replay attack prevention: if transaction was already marked complete, do not duplicate release
    if (tx.status === "COMPLETE") {
      const redirectUrl = new URL(`${origin}/student`);
      redirectUrl.searchParams.set("payment_status", "success");
      redirectUrl.searchParams.set("item_id", tx.itemId);
      redirectUrl.searchParams.set("already_verified", "true");
      return NextResponse.redirect(redirectUrl.toString());
    }

    const config = await getEsewaConfig();

    // 1. Verify HMAC-SHA256 signature
    const isSignatureValid = verifyEsewaSignature(config.secretKey, decodedData);

    // 2. Query eSewa server directly for confirmation
    const serverStatus = await queryEsewaTransactionStatus(config, total_amount, transaction_uuid);

    const isConfirmed =
      (isSignatureValid && status === "COMPLETE") ||
      serverStatus.success ||
      serverStatus.status === "COMPLETE";

    // 3. Verify amount paid matches or exceeds the initiated bill amount
    const paidAmountNum = Number(total_amount);
    const expectedAmountNum = Number(tx.amount);
    const isAmountCorrect = !isNaN(paidAmountNum) && paidAmountNum >= expectedAmountNum;

    if (!isConfirmed || !isAmountCorrect) {
      console.warn("[eSewa Verify] Payment verification failed:", {
        isSignatureValid,
        status,
        serverStatus,
        paidAmountNum,
        expectedAmountNum
      });

      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "FAILED",
          rawResponse: JSON.stringify(decodedData)
        }
      });

      return NextResponse.redirect(`${origin}/student?payment_status=failed&reason=unverified_or_amount_mismatch`);
    }

    const txCode = transaction_code || serverStatus.refId || "ESEWA_VERIFIED";

    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: "COMPLETE",
        transactionCode: txCode,
        rawResponse: JSON.stringify(decodedData)
      }
    });

    const itemId = tx.itemId;
    const itemName = tx.itemName;
    const itemType = tx.itemType;
    const amount = tx.amount;

    const redirectUrl = new URL(`${origin}/student`);
    redirectUrl.searchParams.set("payment_status", "success");
    redirectUrl.searchParams.set("item_id", itemId);
    redirectUrl.searchParams.set("item_name", itemName);
    redirectUrl.searchParams.set("item_type", itemType);
    redirectUrl.searchParams.set("amount", String(amount));
    redirectUrl.searchParams.set("txn_code", txCode);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("[eSewa Verify Internal Error]:", err);
    return NextResponse.redirect(new URL("/student?payment_status=failed&reason=server_error", req.url));
  }
}
