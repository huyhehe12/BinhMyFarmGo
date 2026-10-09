import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, PackageCheck, QrCode, ScanLine, ShoppingBasket, Truck } from "lucide-react";
import { LOCKER_IDS, lockerStateLabel } from "@/lib/pickup-store";

export const Route = createFileRoute("/smart-pickup")({
  head: () => ({
    meta: [
      { title: "FarmGo Smart Pickup — Đặt trước, quét QR, nhận nông sản" },
      {
        name: "description",
        content:
          "Mô hình trạm nhận hàng thông minh FarmGo Smart Pickup: đặt nông sản trước, thanh toán QR tại trạm và mở ngăn tủ nhận hàng.",
      },
      { property: "og:title", content: "FarmGo Smart Pickup — Bình Mỹ FarmGo" },
      {
        property: "og:description",
        content:
          "Đặt nông sản trước, đến trạm Smart Pickup, quét QR thanh toán và mở ngăn tủ nhận hàng.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SmartPickupPage,
});

const steps = [
  {
    title: "Đặt nông sản",
    description: "Chọn sản phẩm trên FarmGo, chọn hình thức “Nhận tại FarmGo Smart Pickup”, ngày và khung giờ đến nhận.",
    icon: ShoppingBasket,
  },
  {
    title: "FarmGo xác nhận",
    description: "FarmGo điều phối tập trung với nhà cung cấp, xác nhận giá cuối và thời gian chuẩn bị hàng.",
    icon: BadgeCheck,
  },
  {
    title: "Chuẩn bị hàng & đưa vào tủ",
    description: "Nông sản được đóng gói và đặt vào một ngăn tủ (A01–A06) tại trạm Smart Pickup.",
    icon: PackageCheck,
  },
  {
    title: "Đến trạm & quét QR thanh toán",
    description: "Tại trạm, quét mã QR cố định, nhập mã đơn BMFG hoặc mã nhận hàng bí mật và thanh toán bằng VietQR đúng số tiền.",
    icon: QrCode,
  },
  {
    title: "Mở ngăn nhận hàng",
    description: "Sau khi thanh toán, ngăn tủ tương ứng mở ra để bạn lấy nông sản. Nhanh gọn, không cần chờ giao hàng.",
    icon: ScanLine,
  },
];

function SmartPickupPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <Truck className="h-4 w-4" />
          Mô hình thử nghiệm mô phỏng
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">FarmGo Smart Pickup</h1>
        <p className="mt-4 text-muted-foreground">
          Đặt trước, thanh toán QR, nhận nông sản thuận tiện. Smart Pickup là mô hình trạm nhận
          hàng thông minh: khách đặt nông sản trên FarmGo, FarmGo điều phối tập trung với nhà cung
          cấp, hàng được đưa vào ngăn tủ tại trạm và khách quét QR để thanh toán, mở ngăn và nhận
          hàng.
        </p>
        <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
          Đây là bản mô phỏng phục vụ đề tài: ngăn tủ và thanh toán đều là DEMO, chưa kết nối thiết
          bị thật. Cấu trúc hệ thống đã sẵn sàng để kết nối tủ ESP32/IoT và đối soát thanh toán
          thật khi triển khai.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Quy trình 5 bước</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">Trạm thử nghiệm</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trạm Smart Pickup Bình Mỹ - Điểm thử nghiệm 01 · 6 ngăn tủ {LOCKER_IDS.join(", ")} · Trạng
          thái ngăn: {Object.values(lockerStateLabel).join(" / ")}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/dat-mua"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Đặt mua nông sản
          </Link>
          <Link
            to="/nhan-hang"
            className="rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Mô phỏng nhận hàng tại trạm
          </Link>
          <Link
            to="/ban-do"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Xem vị trí trạm trên bản đồ
          </Link>
        </div>
      </section>
    </div>
  );
}
