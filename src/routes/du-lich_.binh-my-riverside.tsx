import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Facebook, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { experiences } from "@/data/experiences";
import { riverside } from "@/data/riverside";

export const Route = createFileRoute("/du-lich_/binh-my-riverside")({
  head: () => ({
    meta: [
      { title: "Bình Mỹ Riverside — Du lịch nông nghiệp Bình Mỹ FarmGo" },
      { name: "description", content: "Thông tin liên hệ Bình Mỹ Riverside tại Ấp 4A, xã Bình Mỹ, TP.HCM. Gọi hoặc nhắn tin trực tiếp để xác nhận dịch vụ, giá và lịch hoạt động." },
      { property: "og:title", content: "Bình Mỹ Riverside — Bình Mỹ FarmGo" },
      { property: "og:description", content: "Khám phá thông tin Bình Mỹ Riverside và liên hệ trực tiếp đơn vị để xác nhận chuyến tham quan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RiversideDetail,
});

const highlights = [
  { title: "Không gian xanh", description: "Tìm hiểu không gian sinh thái và cảnh quan địa phương.", image: experiences[0].image, alt: experiences[0].imageAlt },
  { title: "Cảnh quan sông nước", description: "Khám phá nét đặc trưng của vùng ven sông Bình Mỹ.", image: experiences[1].image, alt: experiences[1].imageAlt },
  { title: "Thời gian cùng người thân", description: "Một gợi ý thư giãn cho gia đình và nhóm bạn.", image: experiences[3].image, alt: experiences[3].imageAlt },
];

function RiversideDetail() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <Link to="/du-lich" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> Du lịch nông nghiệp
      </Link>
      <header className="mt-8 border-b border-border pb-8">
        <p className="text-sm font-semibold uppercase text-primary">Điểm đến tại Bình Mỹ</p>
        <h1 className="mt-2 text-3xl font-bold text-primary sm:text-5xl">Bình Mỹ Riverside</h1>
        <p className="mt-3 text-lg text-muted-foreground">Khu du lịch sinh thái – trải nghiệm tại Bình Mỹ</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg"><a href={riverside.phoneUrl}><Phone /> Gọi ngay</a></Button>
          <Button asChild size="lg" variant="outline"><a href={riverside.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook /> Nhắn tin Facebook <ExternalLink /></a></Button>
        </div>
      </header>

      <div className="grid gap-10 py-10 md:grid-cols-[1fr_1fr]">
        <section aria-labelledby="riverside-intro">
          <h2 id="riverside-intro" className="text-2xl font-bold">Giới thiệu Bình Mỹ Riverside</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Bình Mỹ Riverside là điểm du lịch sinh thái tại Bình Mỹ, cung cấp không gian tham quan, vui chơi và trải nghiệm cho du khách.
          </p>
        </section>
        <section aria-labelledby="riverside-contact">
          <h2 id="riverside-contact" className="text-2xl font-bold">Thông tin liên hệ</h2>
          <dl className="mt-4 divide-y divide-border border-t border-b border-border text-sm sm:text-base">
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Đơn vị</dt><dd>{riverside.name}</dd></div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Địa điểm</dt><dd className="inline-flex items-start gap-1"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" />{riverside.address}</dd></div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Hotline</dt><dd><a className="font-bold text-primary hover:underline" href={riverside.phoneUrl}>{riverside.phone}</a></dd></div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Facebook</dt><dd><a className="font-bold text-primary hover:underline" href={riverside.facebookUrl} target="_blank" rel="noopener noreferrer">Bình Mỹ Riverside ↗</a></dd></div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Giá dịch vụ</dt><dd>Liên hệ trực tiếp đơn vị</dd></div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 py-3"><dt className="min-w-32 font-semibold">Lịch hoạt động</dt><dd>Liên hệ trực tiếp đơn vị để xác nhận</dd></div>
          </dl>
        </section>
      </div>

      <section aria-labelledby="riverside-highlights" className="border-t border-border py-10">
        <h2 id="riverside-highlights" className="text-2xl font-bold">Trải nghiệm nổi bật</h2>
        <p className="mt-2 text-sm text-muted-foreground">Hình ảnh minh họa cho không gian trải nghiệm tại Bình Mỹ; vui lòng hỏi đơn vị về hoạt động thực tế.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={item.image} alt={item.alt} loading="lazy" width={1024} height={768} className="aspect-4/3 w-full object-cover" />
              <div className="p-5"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p></div>
            </article>
          ))}
        </div>
      </section>
      <p className="border-t border-border py-8 text-sm leading-6 text-muted-foreground">
        Bình Mỹ FarmGo cung cấp thông tin và kết nối du khách với đơn vị tổ chức. Giá, lịch hoạt động và dịch vụ thực tế vui lòng xác nhận trực tiếp với Bình Mỹ Riverside.
      </p>
    </div>
  );
}