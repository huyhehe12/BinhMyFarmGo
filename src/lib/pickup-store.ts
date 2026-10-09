/**
 * Kho đơn Smart Pickup mô phỏng (chạy hoàn toàn trên trình duyệt).
 *
 * Dùng khi Supabase chưa kết nối được dữ liệu thật: đơn demo, mã nhận hàng
 * bí mật, trạng thái đơn và 6 ngăn tủ A01–A06 được lưu trong localStorage để
 * trang /dat-mua, /nhan-hang và /quan-tri cùng đọc một nguồn dữ liệu.
 * Cấu trúc được thiết kế sẵn để sau này thay bằng bảng Supabase + ESP32/IoT.
 */

export type PickupOrderStatus =
  | "cho_xac_nhan"
  | "da_xac_nhan"
  | "dang_chuan_bi"
  | "da_dua_vao_tram"
  | "cho_thanh_toan"
  | "da_thanh_toan"
  | "dang_nhan_hang"
  | "hoan_tat"
  | "da_huy";

export const pickupStatusLabel: Record<PickupOrderStatus, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  da_xac_nhan: "Đã xác nhận",
  dang_chuan_bi: "Đang chuẩn bị",
  da_dua_vao_tram: "Đã đưa vào trạm",
  cho_thanh_toan: "Chờ thanh toán",
  da_thanh_toan: "Đã thanh toán",
  dang_nhan_hang: "Đang nhận hàng",
  hoan_tat: "Hoàn tất",
  da_huy: "Đã hủy",
};

/** Thứ tự chuyển trạng thái hợp lệ cho quản trị viên. */
export const nextPickupStatus: Record<PickupOrderStatus, PickupOrderStatus[]> = {
  cho_xac_nhan: ["da_xac_nhan", "da_huy"],
  da_xac_nhan: ["dang_chuan_bi", "da_huy"],
  dang_chuan_bi: ["da_dua_vao_tram", "da_huy"],
  da_dua_vao_tram: ["cho_thanh_toan", "da_huy"],
  cho_thanh_toan: ["da_thanh_toan", "da_huy"],
  da_thanh_toan: ["dang_nhan_hang"],
  dang_nhan_hang: ["hoan_tat"],
  hoan_tat: [],
  da_huy: [],
};

export type LockerId = "A01" | "A02" | "A03" | "A04" | "A05" | "A06";
export const LOCKER_IDS: LockerId[] = ["A01", "A02", "A03", "A04", "A05", "A06"];

export type LockerState = "trong" | "co_hang" | "da_lay" | "bao_tri";
export const lockerStateLabel: Record<LockerState, string> = {
  trong: "Trống",
  co_hang: "Có hàng",
  da_lay: "Đã lấy",
  bao_tri: "Bảo trì",
};

export type PickupOrderItem = { name: string; quantity: number; unit: string };

export type PickupOrder = {
  code: string; // mã đơn công khai BMFG-...
  pickupCode: string; // mã nhận hàng bí mật dùng 1 lần
  customerName: string;
  phone: string;
  delivery: string;
  station: string | null;
  pickupDate: string | null;
  pickupSlot: string | null;
  address: string | null;
  items: PickupOrderItem[];
  amount: number; // tổng tiền VND dùng cho VietQR
  status: PickupOrderStatus;
  locker: LockerId | null;
  createdAt: string;
  updatedAt: string;
  demo: true;
};

export type Locker = {
  id: LockerId;
  state: LockerState;
  orderCode: string | null;
};

export const SMART_PICKUP_STATION = "Trạm Smart Pickup Bình Mỹ - Điểm thử nghiệm 01";
export const PICKUP_SLOTS = ["07:00 – 09:00", "09:00 – 11:00", "13:00 – 15:00", "15:00 – 17:00"] as const;

const ORDER_KEY = "farmgo-pickup-orders";
const LOCKER_KEY = "farmgo-pickup-lockers";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // bộ nhớ đầy hoặc bị chặn — bỏ qua, prototype vẫn chạy trong phiên
  }
}

export function listOrders(): PickupOrder[] {
  return readJson<PickupOrder[]>(ORDER_KEY, []);
}

function saveOrders(orders: PickupOrder[]) {
  writeJson(ORDER_KEY, orders);
}

export function getLockers(): Locker[] {
  const saved = readJson<Locker[]>(LOCKER_KEY, []);
  return LOCKER_IDS.map((id) => {
    const found = saved.find((l) => l.id === id);
    return found ?? { id, state: "trong" as LockerState, orderCode: null };
  });
}

function saveLockers(lockers: Locker[]) {
  writeJson(LOCKER_KEY, lockers);
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomTail(len: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function makeOrderCode() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `BMFG-${yy}${mm}${dd}-${randomTail(10)}`;
}

/** Mã nhận hàng bí mật dùng 1 lần, dạng PICKUP-XXXX. */
export function makePickupCode() {
  return `PICKUP-${randomTail(4)}`;
}

export function saveOrder(order: PickupOrder) {
  const orders = listOrders().filter((o) => o.code !== order.code);
  orders.unshift(order);
  saveOrders(orders);
}

/** Tra cứu bằng mã đơn BMFG hoặc mã nhận hàng bí mật. */
export function findOrder(query: string): PickupOrder | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  return listOrders().find((o) => o.code.toUpperCase() === q || o.pickupCode.toUpperCase() === q) ?? null;
}

export function updateOrder(code: string, patch: Partial<PickupOrder>): PickupOrder | null {
  const orders = listOrders();
  const idx = orders.findIndex((o) => o.code === code);
  if (idx < 0) return null;
  const current = orders[idx]!;
  const next: PickupOrder = { ...current, ...patch, updatedAt: new Date().toISOString() };
  orders[idx] = next;
  saveOrders(orders);
  return next;
}

/** Gán đơn vào ngăn trống, đánh dấu ngăn Có hàng. */
export function assignLocker(orderCode: string, lockerId: LockerId): boolean {
  const lockers = getLockers();
  const locker = lockers.find((l) => l.id === lockerId);
  if (!locker || locker.state === "co_hang" || locker.state === "bao_tri") return false;
  const order = updateOrder(orderCode, { locker: lockerId, status: "da_dua_vao_tram" });
  if (!order) return false;
  locker.state = "co_hang";
  locker.orderCode = orderCode;
  saveLockers(lockers);
  return true;
}

/** Đánh dấu ngăn đã lấy hàng / trả ngăn về trống. */
export function releaseLocker(lockerId: LockerId) {
  const lockers = getLockers();
  const locker = lockers.find((l) => l.id === lockerId);
  if (!locker) return;
  locker.state = "da_lay";
  locker.orderCode = null;
  saveLockers(lockers);
}

export function setLockerState(lockerId: LockerId, state: LockerState) {
  const lockers = getLockers();
  const locker = lockers.find((l) => l.id === lockerId);
  if (!locker) return;
  locker.state = state;
  if (state !== "co_hang") locker.orderCode = null;
  saveLockers(lockers);
}
