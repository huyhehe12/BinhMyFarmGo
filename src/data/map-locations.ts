export type PublicLocation = {
  id: string;
  name: string;
  category: "diem_ban" | "nha_vuon" | "trai_nghiem" | "diem_nhan_hang";
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  maps_url: string;
  embed_url: string | null;
  specialty: string;
  note: string;
  is_demo: boolean;
};

/**
 * Tọa độ minh họa quanh khu vực Bình Mỹ để prototype luôn có ghim trên bản đồ.
 * Khi bảng locations có dữ liệu verified=true, dữ liệu thật sẽ được ưu tiên.
 */
export const demoLocations: PublicLocation[] = [
  {
    id: "demo-rau-mop",
    name: "Vùng rau móp Bình Mỹ",
    category: "nha_vuon",
    address: "Khu vực trồng rau tại xã Bình Mỹ, TP.HCM (minh họa)",
    latitude: 11.0042,
    longitude: 106.5942,
    contact: "Liên hệ qua Bình Mỹ FarmGo",
    maps_url: "https://www.google.com/maps?q=11.0042,106.5942",
    embed_url: null,
    specialty: "Rau móp Bình Mỹ",
    note: "Điểm minh họa nhà vườn có đặc sản rau móp.",
    is_demo: true,
  },
  {
    id: "demo-diem-ban",
    name: "Điểm bán nông sản Bình Mỹ",
    category: "diem_ban",
    address: "Khu vực trung tâm xã Bình Mỹ, TP.HCM (minh họa)",
    latitude: 11.0026,
    longitude: 106.5971,
    contact: "Nhận hàng theo khung giờ hẹn trước",
    maps_url: "https://www.google.com/maps?q=11.0026,106.5971",
    embed_url: null,
    specialty: "Rau móp, rau ăn lá, dưa leo",
    note: "Điểm bán minh họa dành cho khách đến nhận hàng trực tiếp.",
    is_demo: true,
  },
  {
    id: "demo-vuon-trai-cay",
    name: "Vườn trải nghiệm trái cây Bình Mỹ",
    category: "trai_nghiem",
    address: "Khu vực vườn cây ăn trái tại Bình Mỹ, TP.HCM (minh họa)",
    latitude: 10.9999,
    longitude: 106.5908,
    contact: "Tham quan và mua trái cây theo mùa",
    maps_url: "https://www.google.com/maps?q=10.9999,106.5908",
    embed_url: null,
    specialty: "Xoài, nhãn, ổi theo mùa",
    note: "Điểm minh họa hoạt động du lịch nông nghiệp gắn với vườn trái cây.",
    is_demo: true,
  },
  {
    id: "demo-diem-nhan-hang",
    name: "Điểm nhận hàng FarmGo",
    category: "diem_nhan_hang",
    address: "Khu vực hẹn nhận hàng tại Bình Mỹ, TP.HCM (minh họa)",
    latitude: 11.0061,
    longitude: 106.5893,
    contact: "Xác nhận trước khi đến nhận",
    maps_url: "https://www.google.com/maps?q=11.0061,106.5893",
    embed_url: null,
    specialty: "Điểm nhận đơn đã chốt",
    note: "Điểm minh họa để gom đơn và hẹn khách đến nhận.",
    is_demo: true,
  },
];
