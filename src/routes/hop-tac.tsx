import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { contactConfig } from "@/lib/contact-config";
import { saveApplication } from "@/lib/partner-store";

export const Route = createFileRoute("/hop-tac")({
  head: () => ({
    meta: [
      { title: "Hợp tác cùng FarmGo — Đăng ký đơn vị cung cấp" },
      { name: "description", content: "Hộ nông dân và đơn vị tại Bình Mỹ đăng ký trở thành đơn vị cung cấp nông sản cùng Bình Mỹ FarmGo." },
      { property: "og:title", content: "Hợp tác cùng Bình Mỹ FarmGo" },
      { property: "og:description", content: "Đăng ký trở thành đơn vị cung cấp nông sản Bình Mỹ — FarmGo điều phối tập trung, không cần tài khoản riêng." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HopTacPage,
});

const schema = z.object({
  farmName: z.string().trim().min(1, "Vui lòng nhập tên hộ / đơn vị").max(150),
  representative: z.string().trim().min(1, "Vui lòng nhập họ tên người đại diện").max(100),
  phone: z.string().trim().regex(/^(\+?84|0)\d{9,10}$/, "Số điện thoại không hợp lệ"),
  area: z.string().trim().min(1, "Vui lòng nhập khu vực sản xuất").max(200),
  products: z.string().trim().min(1, "Vui lòng nhập loại nông sản").max(300),
  volume: z.string().trim().max(100),
  price: z.string().trim().max(100),
  schedule: z.string().trim().max(200),
  note: z.string().trim().max(1000),
});

const empty = { farmName: "", representative: "", phone: "", area: "", products: "", volume: "", price: "", schedule: "", note: "" };
type Field = keyof typeof empty;

const fields: { key: Field; label: string; required?: boolean; placeholder?: string; area?: boolean }[] = [
  { key: "farmName", label: "Tên hộ nông dân / đơn vị cung cấp", required: true },
  { key: "representative", label: "Họ tên người đại diện", required: true },
  { key: "phone", label: "Số điện thoại / Zalo của nhà cung cấp", required: true, placeholder: "VD: 09xxxxxxxx" },
  { key: "area", label: "Khu vực sản xuất tại Bình Mỹ", required: true, placeholder: "VD: Ấp 4A, xã Bình Mỹ" },
  { key: "products", label: "Loại nông sản cung cấp", required: true, placeholder: "VD: rau móp, dưa leo, rau ăn lá" },
  { key: "volume", label: "Sản lượng dự kiến (kg/ngày hoặc kg/tuần)" },
  { key: "price", label: "Giá cung cấp dự kiến" },
  { key: "schedule", label: "Thời gian thu hoạch và giao hàng" },
  { key: "note", label: "Ghi chú thêm", area: true },
];

export function callFarmGo() {
  window.location.href = `tel:${contactConfig.phone}`;
}
export function openFarmGoZalo() {
  if (!contactConfig.zaloUrl) return toast.info("Thông tin Zalo đang cập nhật");
  window.open(contactConfig.zaloUrl, "_blank", "noopener,noreferrer");
}

function HopTacPage() {
  const [form, setForm] = useState(empty);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field | "agree", string>>>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    const errs: typeof errors = {};
    if (!r.success) for (const i of r.error.issues) errs[i.path[0] as Field] ??= i.message;
    if (!agree) errs.agree = "Vui lòng đồng ý để tiếp tục";
    setErrors(errs);
    if (!r.success || !agree) return;
    try {
      saveApplication(r.data);
      setDone(true);
      setForm(empty);
      setAgree(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Không lưu được đăng ký, vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Hợp tác cùng FarmGo</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">ĐĂNG KÝ TRỞ THÀNH ĐƠN VỊ CUNG CẤP</h1>
      <p className="mt-3 text-muted-foreground">
        FarmGo điều phối tập trung — nhà cung cấp không cần tạo tài khoản. Hồ sơ sẽ được xác minh trước khi hiển thị công khai.
      </p>

      {done && (
        <div role="status" className="mt-6 flex gap-3 rounded-2xl border border-primary/30 bg-secondary p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Gửi đăng ký hợp tác thành công!</p>
            <p className="text-sm text-muted-foreground">
              Hồ sơ đang ở trạng thái "Chờ xác minh". FarmGo sẽ liên hệ qua số điện thoại bạn cung cấp.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} noValidate className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6">
        {fields.map((f) => (
          <label key={f.key} className={`grid gap-1 text-sm ${f.area || f.required ? "sm:col-span-2" : ""}`}>
            <span className="font-medium">
              {f.label} {f.required && <span className="text-destructive">*</span>}
            </span>
            {f.area ? (
              <textarea rows={3} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" />
            ) : (
              <input value={form[f.key]} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" />
            )}
            {errors[f.key] && <span className="text-xs text-destructive">{errors[f.key]}</span>}
          </label>
        ))}
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>Đồng ý cho FarmGo sử dụng thông tin liên hệ để xử lý yêu cầu hợp tác. <span className="text-destructive">*</span></span>
        </label>
        {errors.agree && <span className="-mt-3 text-xs text-destructive sm:col-span-2">{errors.agree}</span>}
        <button type="submit" className="rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90 sm:col-span-2">
          Gửi đăng ký hợp tác
        </button>
      </form>

      <section className="mt-8 rounded-2xl bg-secondary p-6 text-center">
        <h2 className="text-lg font-bold">CẦN HỖ TRỢ ĐĂNG KÝ?</h2>
        <p className="mt-1 text-muted-foreground">Liên hệ Bình Mỹ FarmGo:</p>
        <p className="mt-1 text-lg font-semibold">Hotline: {contactConfig.phone}</p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={callFarmGo} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground">
            <Phone className="h-4 w-4" /> Gọi FarmGo
          </button>
          <button type="button" onClick={openFarmGoZalo} className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-5 py-2.5 font-medium text-primary">
            <MessageCircle className="h-4 w-4" /> Liên hệ Zalo
          </button>
        </div>
      </section>
    </div>
  );
}
