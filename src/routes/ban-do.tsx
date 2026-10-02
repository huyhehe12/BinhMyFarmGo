import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, MapPinned } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { mapConfig } from "@/lib/map-config";
import { demoLocations } from "@/data/map-locations";
import { listLocations } from "@/lib/farmgo.functions";

export const Route = createFileRoute("/ban-do")({
  head: () => ({
    meta: [
      { title: "Bản đồ khám phá Bình Mỹ — Bình Mỹ FarmGo" },
      {
        name: "description",
        content:
          "Bản đồ tương tác Bình Mỹ hiển thị điểm bán nông sản, nhà vườn, điểm trải nghiệm và điểm nhận hàng.",
      },
      { property: "og:title", content: "Bản đồ khám phá Bình Mỹ" },
      {
        property: "og:description",
        content: "Khám phá đặc sản, nhà vườn và các điểm trải nghiệm nông nghiệp trên bản đồ Bình Mỹ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async () => {
    try {
      return await listLocations();
    } catch (error) {
      console.error(error);
      return {
        locations: demoLocations,
        error: "Không kết nối được dữ liệu thật, đang hiển thị 4 địa điểm minh họa.",
        usingDemo: true,
      };
    }
  },
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12">Không tải được bản đồ, vui lòng thử lại.</div>
  ),
  notFoundComponent: () => <div className="mx-auto max-w-6xl px-4 py-12">Không tìm thấy.</div>,
  component: MapPage,
});

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "diem_ban", label: "Điểm bán nông sản" },
  { id: "nha_vuon", label: "Nhà vườn" },
  { id: "trai_nghiem", label: "Điểm trải nghiệm nông nghiệp" },
  { id: "diem_nhan_hang", label: "Điểm nhận hàng" },
] as const;
const catLabel = Object.fromEntries(filters.map((f) => [f.id, f.label])) as Record<string, string>;

const categoryEmoji: Record<string, string> = {
  diem_ban: "🧺",
  nha_vuon: "🌿",
  trai_nghiem: "📸",
  diem_nhan_hang: "📦",
};

type MapLocation = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact: string | null;
  maps_url: string;
  embed_url: string | null;
  specialty: string;
  note: string;
  is_demo: boolean;
};

type LeafletMapInstance = {
  setView(coords: [number, number], zoom: number): LeafletMapInstance;
  fitBounds(bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }): LeafletMapInstance;
  invalidateSize(): void;
  remove(): void;
};

type LeafletLayer = {
  addTo(map: LeafletMapInstance): LeafletLayer;
};

type LeafletMarker = {
  addTo(map: LeafletMapInstance): LeafletMarker;
  bindPopup(content: HTMLElement): LeafletMarker;
  on(event: string, handler: () => void): LeafletMarker;
  openPopup(): LeafletMarker;
};

type LeafletNamespace = {
  map(element: HTMLElement, options?: Record<string, unknown>): LeafletMapInstance;
  tileLayer(url: string, options?: Record<string, unknown>): LeafletLayer;
  marker(coords: [number, number], options?: Record<string, unknown>): LeafletMarker;
  divIcon(options?: Record<string, unknown>): unknown;
  latLngBounds(coords: [number, number][]): unknown;
};

type WindowWithLeaflet = Window & typeof globalThis & { L?: LeafletNamespace };

function loadLeaflet() {
  return new Promise<LeafletNamespace>((resolve, reject) => {
    const win = window as WindowWithLeaflet;
    if (win.L) {
      resolve(win.L);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const css = document.createElement("link");
      css.id = "leaflet-css";
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }

    const existing = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        const loaded = (window as WindowWithLeaflet).L;
        if (loaded) resolve(loaded);
        else reject(new Error("Leaflet không khởi tạo được."));
      });
      existing.addEventListener("error", () => reject(new Error("Không tải được Leaflet.")));
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const loaded = (window as WindowWithLeaflet).L;
      if (loaded) resolve(loaded);
      else reject(new Error("Leaflet không khởi tạo được."));
    };
    script.onerror = () => reject(new Error("Không tải được Leaflet."));
    document.body.appendChild(script);
  });
}

function popupContent(location: MapLocation) {
  const root = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = location.name;
  root.appendChild(title);

  const category = document.createElement("div");
  category.textContent = catLabel[location.category] ?? location.category;
  category.style.marginTop = "4px";
  root.appendChild(category);

  if (location.specialty) {
    const specialty = document.createElement("div");
    specialty.textContent = `Đặc sản / nổi bật: ${location.specialty}`;
    specialty.style.marginTop = "4px";
    specialty.style.fontWeight = "600";
    root.appendChild(specialty);
  }

  if (location.address) {
    const address = document.createElement("div");
    address.textContent = location.address;
    address.style.marginTop = "4px";
    root.appendChild(address);
  }

  return root;
}

function LeafletMap({
  locations,
  selectedId,
  onSelect,
}: {
  locations: MapLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMapInstance | null = null;

    void loadLeaflet()
      .then((L) => {
        if (disposed || !mapElement.current) return;
        setFailed(false);
        map = L.map(mapElement.current, { scrollWheelZoom: true }).setView([11.0023, 106.5938], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const usable = locations.filter(
          (location): location is MapLocation & { latitude: number; longitude: number } =>
            typeof location.latitude === "number" && typeof location.longitude === "number",
        );
        const coords: [number, number][] = [];

        for (const location of usable) {
          const point: [number, number] = [location.latitude, location.longitude];
          coords.push(point);
          const icon = L.divIcon({
            className: "farmgo-map-pin",
            html: `<div style="font-size:28px;line-height:32px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">${categoryEmoji[location.category] ?? "📍"}</div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 28],
            popupAnchor: [0, -25],
          });
          const marker = L.marker(point, { icon }).addTo(map).bindPopup(popupContent(location));
          marker.on("click", () => onSelect(location.id));
          if (location.id === selectedId) {
            marker.openPopup();
            map.setView(point, 16);
          }
        }

        if (!selectedId && coords.length > 1) {
          map.fitBounds(L.latLngBounds(coords), { padding: [35, 35], maxZoom: 16 });
        } else if (!selectedId && coords.length === 1 && coords[0]) {
          map.setView(coords[0], 16);
        }

        window.setTimeout(() => map?.invalidateSize(), 80);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [locations, onSelect, selectedId]);

  if (failed) {
    return (
      <iframe
        src={mapConfig.embedSrc}
        title="Bản đồ khu vực Bình Mỹ, TP.HCM"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-[520px] w-full border-0"
      />
    );
  }

  return <div ref={mapElement} className="h-[520px] w-full bg-secondary" aria-label="Bản đồ các địa điểm Bình Mỹ" />;
}

function MapPage() {
  const { locations, error, usingDemo } = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = useMemo(
    () => locations.filter((location) => filter === "all" || location.category === filter),
    [locations, filter],
  );
  const selected = locations.find((location) => location.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
        <MapPinned className="h-4 w-4" />
        Bản đồ sau cải tiến
      </div>
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Bản đồ nông sản & trải nghiệm Bình Mỹ</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Xem trực tiếp các ghim nhà vườn, điểm bán, điểm trải nghiệm và điểm nhận hàng. Chọn một ghim
        để biết đặc sản hoặc hoạt động nổi bật tại địa điểm đó.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Lọc địa điểm">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => {
              setFilter(item.id);
              setSelectedId(null);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-label="Bản đồ Bình Mỹ">
          <LeafletMap locations={shown as MapLocation[]} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="border-t border-border p-4">
            {selected ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{selected.name}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {selected.is_demo ? "Dữ liệu minh họa" : "Đã xác minh"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{catLabel[selected.category]}</p>
                {selected.specialty && <p className="mt-2 text-sm font-medium text-primary">Đặc sản / nổi bật: {selected.specialty}</p>}
                {selected.note && <p className="mt-1 text-sm text-muted-foreground">{selected.note}</p>}
                {selected.address && <p className="mt-2 text-sm">{selected.address}</p>}
                {selected.contact && <p className="mt-1 text-sm text-muted-foreground">Liên hệ: {selected.contact}</p>}
                <a
                  href={selected.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Xem vị trí trên Google Maps
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Bấm một ghim trên bản đồ hoặc chọn địa điểm ở danh sách bên cạnh.</p>
            )}
          </div>
        </section>

        <section aria-label="Danh sách địa điểm" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold">{catLabel[filter]}</h2>
          {error && <p className="mt-3 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">{error}</p>}
          {shown.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Danh sách địa điểm đang cập nhật.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {shown.map((location) => (
                <li key={location.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(location.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selectedId === location.id ? "border-primary bg-secondary" : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">
                        <span className="mr-2" aria-hidden="true">{categoryEmoji[location.category] ?? "📍"}</span>
                        {location.name}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {location.is_demo ? "Minh họa" : "Đã xác minh"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{catLabel[location.category]}</p>
                    {location.specialty && <p className="mt-2 text-sm font-medium text-primary">{location.specialty}</p>}
                    {location.address && <p className="mt-1 text-sm text-muted-foreground">{location.address}</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-8 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
        {usingDemo
          ? "Các ghim hiện tại là dữ liệu minh họa phục vụ prototype. Khi có dữ liệu thật được quản trị xác minh, hệ thống sẽ ưu tiên hiển thị dữ liệu đó."
          : "Các ghim đang hiển thị là địa điểm đã được quản trị đánh dấu xác minh. Có thể lọc theo loại địa điểm và bấm ghim để xem đặc sản, địa chỉ và đường đi."}
      </p>
    </div>
  );
}
