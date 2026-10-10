// Lưu hồ sơ đăng ký hợp tác (fallback an toàn trên trình duyệt khi chưa có database).
export type PartnerStatus = "cho_xac_minh" | "da_duyet" | "tu_choi";
export type PartnerApplication = {
  id: string;
  createdAt: string;
  status: PartnerStatus;
  farmName: string;
  representative: string;
  phone: string;
  area: string;
  products: string;
  volume: string;
  price: string;
  schedule: string;
  note: string;
};

const KEY = "farmgo-partner-applications";

export const partnerStatusLabel: Record<PartnerStatus, string> = {
  cho_xac_minh: "Chờ xác minh",
  da_duyet: "Đã duyệt – Đơn vị chính thức",
  tu_choi: "Từ chối / Lưu trữ",
};

export function listApplications(): PartnerApplication[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as PartnerApplication[];
  } catch {
    return [];
  }
}

export function saveApplication(a: Omit<PartnerApplication, "id" | "createdAt" | "status">) {
  const item: PartnerApplication = {
    ...a,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "cho_xac_minh",
  };
  localStorage.setItem(KEY, JSON.stringify([item, ...listApplications()]));
  return item;
}

export function setApplicationStatus(id: string, status: PartnerStatus) {
  const list = listApplications().map((a) => (a.id === id ? { ...a, status } : a));
  localStorage.setItem(KEY, JSON.stringify(list));
}
