import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * Returns eSewa configuration (merchant code, secret key, environment URLs)
 * Prioritizes database SystemSetting overrides, then environment variables, then standard defaults.
 */
export async function getEsewaConfig() {
  let productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
  let secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  let envMode = process.env.ESEWA_ENV || "test"; // "test" or "live"

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["esewa_product_code", "esewa_secret_key", "esewa_env"] }
      }
    });
    settings.forEach((s) => {
      if (s.key === "esewa_product_code" && s.value && s.value.trim()) {
        productCode = s.value.trim();
      }
      if (s.key === "esewa_secret_key" && s.value && s.value.trim()) {
        secretKey = s.value.trim();
      }
      if (s.key === "esewa_env" && s.value && s.value.trim()) {
        envMode = s.value.trim().toLowerCase();
      }
    });
  } catch (err) {
    console.error("[eSewa] Failed to read SystemSetting:", err.message);
  }

  const isLive = envMode === "live";
  const baseUrl = isLive
    ? "https://epay.esewa.com.np"
    : "https://rc-epay.esewa.com.np";

  return {
    productCode,
    secretKey,
    envMode: isLive ? "live" : "test",
    isLive,
    baseUrl,
    formUrl: `${baseUrl}/api/epay/main/v2/form`,
    statusUrl: `${baseUrl}/api/epay/transaction/status/`
  };
}

/**
 * Generates HMAC-SHA256 signature for eSewa EPAY v2 form initiation.
 * Spec: total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}
 */
export function generateEsewaSignature(secretKey, totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

/**
 * Verifies HMAC-SHA256 signature returned by eSewa in success callback.
 * Data object decoded from `?data=<base64>`
 */
export function verifyEsewaSignature(secretKey, data) {
  if (!data || !data.signature || !data.signed_field_names) {
    return false;
  }

  const fields = data.signed_field_names.split(",");
  const message = fields.map((field) => `${field}=${data[field] || ""}`).join(",");

  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  const expectedSignature = hmac.digest("base64");

  return expectedSignature === data.signature;
}

/**
 * Queries eSewa Transaction Status API to double-check that payment was genuine and completed.
 * Endpoint: /api/epay/transaction/status/?product_code=...&total_amount=...&transaction_uuid=...
 */
export async function queryEsewaTransactionStatus(config, totalAmount, transactionUuid) {
  try {
    const url = `${config.statusUrl}?product_code=${encodeURIComponent(config.productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      console.error("[eSewa] Status check failed with HTTP", response.status);
      return { success: false, status: "HTTP_ERROR" };
    }

    const result = await response.json();
    return {
      success: result.status === "COMPLETE",
      status: result.status,
      refId: result.ref_id || result.transaction_code,
      data: result
    };
  } catch (err) {
    console.error("[eSewa] Status check network error:", err.message);
    return { success: false, status: "NETWORK_ERROR", error: err.message };
  }
}
