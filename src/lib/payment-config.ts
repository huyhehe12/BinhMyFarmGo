export const paymentConfig = {
  bankBin: "970405",
  bankName: "Agribank",
  accountNumber: "5101205184196",
  accountHolder: "LE HUU HUY",
  branch: "Agribank - Chi nhánh H. Dak To - Kon Tum",
} as const;

/**
 * Nội dung chuyển khoản dùng trong VietQR: chỉ giữ chữ A-Z và số để tương thích tốt
 * với nhiều ứng dụng ngân hàng. Mã đơn hiển thị trên website vẫn giữ dạng BMFG-...
 */
export function getVietQrTransferContent(orderCode: string) {
  const normalized = orderCode
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 50);
  return normalized || "BMFG";
}

/**
 * Tạo VietQR động dạng qr_only để QR lớn, rõ và dễ quét.
 * amount là số tiền VND của đơn; addInfo là mã đơn đã loại ký tự đặc biệt.
 */
export function buildVietQrUrl(amount: number, orderCode: string) {
  const safeAmount = Math.max(1, Math.round(amount));
  const transferContent = getVietQrTransferContent(orderCode);
  return `https://img.vietqr.io/image/${paymentConfig.bankBin}-${paymentConfig.accountNumber}-qr_only.png?amount=${safeAmount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(paymentConfig.accountHolder)}`;
}
