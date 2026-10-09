import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, PackageOpen, QrCode, ScanLine } from "lucide-react";
import { useState } from "react";
import { buildVietQrUrl, getVietQrTransferContent, paymentConfig } from "@/lib/payment-config";
import {
  findOrder,
  LOCKER_IDS,
  pickupStatusLabel,
  releaseLocker,
  updateOrder,
  type PickupOrder,
} from "@/lib/pickup-store";

export const Route = createFileRoute("/nhan-hang")({
  head: () => ({
    meta: [
      { title: "Nhận hàng tại trạm Smart Pickup — Bình Mỹ FarmGo" },
      {
        name: "description",
        content:
          "Mô phỏng màn hình nhận hàng tại trạm FarmGo Smart Pickup: nhập mã đơn hoặc mã nhận hàng, quét VietQR và mở ngăn tủ.",
      },
      { property: "og:title", content: "Nhận hàng tại trạm Smart Pickup" },
      {
        property: "og:description",
        content: "Nhập mã đơn BMFG hoặc mã nhận hàng bí mật để thanh toán QR và mở ngăn nhận hàng.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PickupPage,
});

const vnd = (n: number) => `${n.toLocaleString("vi-VN")} đ`;

function PickupPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<PickupOrder | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [lockerOpen, setLockerOpen] = useState(false);
  const [done, setDone] = useState(false);

  function search(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);
    setPaid(false);
    setLockerOpen(false);
    setDone(false);
    const found = findOrder(query);
    if (!found) {
      setOrder(null);
      setMessage("Không tìm thấy đơn phù hợp. Kiểm tra lại mã đơn BMFG hoặc mã nhận hàng bí mật.");
      return;
    }
    setOrder(found);
    if (found.status === "hoan_tat") {
      setMessage("Đơn này đã hoàn tất. Cảm ơn bạn đã sử dụng FarmGo Smart Pickup.");
    } else if (found.status === "da_huy") {
      setMessage("Đơn này đã bị hủy. Vui lòng liên hệ FarmGo để được hỗ trợ.");
    } else if (found.status !== "da_dua_vao_tram" && found.status !== "cho_thanh_toan" && found.status !== "da_thanh_toan") {
      setMessage(
        `Đơn đang ở trạng thái “${pickupStatusLabel[found.status]}”. Hàng chưa sẵn sàng tại trạm — vui lòng quay lại sau.`,
      );
    }
  }

  function simulatePay() {
    if (!order) return;
    const next = updateOrder(order.code, { status: "da_thanh_toan" });
    if (next) setOrder(next);
    setPaid(true);
    setLockerOpen(true);
  }

  function confirmTaken() {
    if (!order) return;
    if (order.locker) releaseLocker(order.locker);
    const next = updateOrder(order.code, { status: "hoan_tat" });
    if (next) setOrder(next);
    setDone(true);
  }

  const ready =
    order &&
    (order.status === "da_dua_vao_tram" ||
      order.status === "cho_thanh_toan" ||
      order.status === "da_thanh_toan" ||
      (done && order.status === "hoan_tat"));

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <ScanLine className="h-4 w-4" />
          Màn hình tại trạm — MÔ PHỎNG PROTOTYPE
        </div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Nhận hàng tại trạm Smart Pickup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Khi đến trạm, khách quét mã QR cố định tại tủ để mở trang này trên điện thoại, rồi nhập mã
          đơn BMFG hoặc mã nhận hàng bí mật.
        </p>
      </div>

      <form onSubmit={search} className="mt-6 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BMFG-... hoặc PICKUP-XXXX"
          maxLength={30}
          aria-label="Mã đơn hoặc mã nhận hàng"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          disabled={!query.trim()}
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          Tra cứu
        </button>
      </form>
      {message && <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">{message}</p>}

      {order && ready && (
        <div className="mt-6 space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-primary">{order.code}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {pickupStatusLabel[order.status]}
              </span>
            </div>
            <ul className="mt-3 space-y-1">
              {order.items.map((item) => (
                <li key={item.name}>
                  {item.name} × {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Số tiền cuối</span>
              <span className="text-lg font-bold text-primary">{vnd(order.amount)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Ngăn tủ được gán</span>
              <span className="font-bold">{order.locker ?? "Chưa gán"}</span>
            </div>
          </section>

          {!paid ? (
            <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
              <QrCode className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 font-semibold">Quét VietQR để thanh toán</p>
              <img
                src={buildVietQrUrl(order.amount, order.code)}
                alt={`VietQR ${vnd(order.amount)} cho đơn ${order.code}`}
                width={480}
                height={480}
                className="mx-auto mt-3 h-64 w-64 max-w-full rounded-xl border border-border bg-white object-contain p-2"
              />
              <div className="mx-auto mt-3 max-w-64 rounded-xl bg-primary/10 px-4 py-2">
                <p className="text-xs text-muted-foreground">Số tiền cần chuyển</p>
                <p className="text-xl font-bold text-primary">{vnd(order.amount)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nội dung: {getVietQrTransferContent(order.code)} · {paymentConfig.accountHolder}
                </p>
              </div>
              <button
                type="button"
                onClick={simulatePay}
                className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Mô phỏng thanh toán (DEMO)
              </button>
              <p className="mt-2 text-xs font-semibold text-destructive">
                DEMO – KHÔNG PHẢI THANH TOÁN THẬT
              </p>
            </section>
          ) : (
            <section className="rounded-2xl border border-primary/30 bg-card p-5 text-center">
              <p className="font-semibold text-primary">Thanh toán demo thành công</p>
              <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
                {LOCKER_IDS.map((id) => {
                  const isMine = order.locker === id;
                  return (
                    <div
                      key={id}
                      className={`flex h-16 flex-col items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                        isMine && lockerOpen
                          ? "border-primary bg-primary text-primary-foreground shadow-lg"
                          : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isMine && lockerOpen ? <PackageOpen className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      <span className="mt-1">{id}</span>
                    </div>
                  );
                })}
              </div>
              {order.locker ? (
                <p className="mt-3 text-sm">
                  Ngăn <b className="text-primary">{order.locker}</b> đang mở — vui lòng lấy hàng.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Đơn chưa được gán ngăn. Vui lòng liên hệ nhân viên trạm.
                </p>
              )}
              {!done ? (
                <button
                  type="button"
                  onClick={confirmTaken}
                  disabled={!order.locker}
                  className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  Tôi đã lấy hàng
                </button>
              ) : (
                <p className="mt-4 rounded-xl bg-secondary p-3 text-sm font-semibold text-secondary-foreground">
                  Đã hoàn tất. Cảm ơn bạn đã nhận hàng tại FarmGo Smart Pickup!
                </p>
              )}
            </section>
          )}
        </div>
      )}

      <p className="mt-8 rounded-xl bg-secondary p-4 text-xs leading-5 text-secondary-foreground">
        Đây là mô phỏng prototype phục vụ đề tài: thanh toán và mở ngăn tủ đều là DEMO, chưa có
        giao dịch hay thiết bị thật. Cấu trúc trạng thái đơn và ngăn tủ đã được thiết kế sẵn để kết
        nối tủ ESP32/IoT và đối soát thanh toán thật khi triển khai. Chưa có đơn?{" "}
        <Link to="/dat-mua" className="font-semibold text-primary hover:underline">
          Đặt mua nông sản
        </Link>{" "}
        và chọn “Nhận tại FarmGo Smart Pickup”.
      </p>
    </div>
  );
}
