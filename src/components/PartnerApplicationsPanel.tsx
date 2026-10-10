import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listApplications,
  partnerStatusLabel,
  setApplicationStatus,
  type PartnerApplication,
  type PartnerStatus,
} from "@/lib/partner-store";

export function PartnerApplicationsPanel() {
  const [list, setList] = useState<PartnerApplication[]>([]);
  const [filter, setFilter] = useState<PartnerStatus | "all">("cho_xac_minh");
  useEffect(() => setList(listApplications()), []);

  const update = (id: string, s: PartnerStatus) => {
    setApplicationStatus(id, s);
    setList(listApplications());
    toast.success(s === "da_duyet" ? "Đã chuyển thành đơn vị cung cấp chính thức" : "Đã lưu trữ hồ sơ");
  };
  const shown = list.filter((a) => filter === "all" || a.status === filter);

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">Hồ sơ đăng ký hợp tác mới</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {(["cho_xac_minh", "da_duyet", "tu_choi", "all"] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full border px-3 py-1 ${filter === k ? "bg-primary text-primary-foreground" : "border-border"}`}>
            {k === "all" ? "Tất cả" : partnerStatusLabel[k]} ({list.filter((a) => k === "all" || a.status === k).length})
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Chưa có hồ sơ.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {shown.map((a) => (
          <article key={a.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{a.farmName}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{partnerStatusLabel[a.status]}</span>
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
              <dt>Đại diện</dt><dd className="text-foreground">{a.representative}</dd>
              <dt>Điện thoại</dt><dd className="text-foreground"><a href={`tel:${a.phone}`}>{a.phone}</a></dd>
              <dt>Khu vực</dt><dd className="text-foreground">{a.area}</dd>
              <dt>Nông sản</dt><dd className="text-foreground">{a.products}</dd>
              <dt>Sản lượng</dt><dd className="text-foreground">{a.volume || "—"}</dd>
              <dt>Giá dự kiến</dt><dd className="text-foreground">{a.price || "—"}</dd>
              <dt>Thu hoạch/giao</dt><dd className="text-foreground">{a.schedule || "—"}</dd>
              <dt>Ghi chú</dt><dd className="text-foreground">{a.note || "—"}</dd>
              <dt>Ngày gửi</dt><dd className="text-foreground">{new Date(a.createdAt).toLocaleString("vi-VN")}</dd>
            </dl>
            {a.status === "cho_xac_minh" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => update(a.id, "da_duyet")} className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground">
                  Phê duyệt & Chuyển thành Đơn vị cung cấp chính thức
                </button>
                <button onClick={() => update(a.id, "tu_choi")} className="rounded-full border border-border px-3 py-1.5">
                  Từ chối / Lưu trữ
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
