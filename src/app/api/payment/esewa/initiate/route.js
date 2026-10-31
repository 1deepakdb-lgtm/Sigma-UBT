import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEsewaConfig, generateEsewaSignature } from "@/lib/esewa";

export async function POST(req) {
  try {
    const body = await req.json();
    const { itemId, itemName, itemType = "set", amount, studentPhone, studentName } = body;

    const parsedAmount = Number(amount) || (itemType === "set" ? 40 : 1000);
    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const config = await getEsewaConfig();

    // Unique transaction UUID: e.g. EJK-SET-1730274192000-A9X2
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefix = itemType === "set" ? "SET" : "PKG";
    const transactionUuid = `EJK-${prefix}-${Date.now()}-${randomSuffix}`;

    // Create a pending transaction record in database
    await prisma.paymentTransaction.create({
      data: {
        transactionUuid,
        studentPhone: studentPhone || null,
        studentName: studentName || "Student",
        itemId: itemId ? String(itemId) : itemName,
        itemName,
        itemType,
        amount: parsedAmount,
        status: "PENDING",
        gateway: "ESEWA"
      }
    });

    // Determine host origin for callbacks
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    const successUrl = `${origin}/api/payment/esewa/verify`;
    const failureUrl = `${origin}/student?payment_status=failed`;

    // eSewa total amount string (e.g. "40" or "40.0")
    const totalAmountStr = String(parsedAmount);

    const signature = generateEsewaSignature(
      config.secretKey,
      totalAmountStr,
      transactionUuid,
      config.productCode
    );

    const formData = {
      amount: totalAmountStr,
      tax_amount: "0",
      total_amount: totalAmountStr,
      transaction_uuid: transactionUuid,
      product_code: config.productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    };

    return NextResponse.json({
      success: true,
      actionUrl: config.formUrl,
      formData,
      transactionUuid,
      envMode: config.envMode,
      productCode: config.productCode
    });
  } catch (err) {
    console.error("[eSewa Initiate Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate eSewa payment" }, { status: 500 });
  }
}
