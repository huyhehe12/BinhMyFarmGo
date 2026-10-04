import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, ExternalLink, Facebook, Leaf, MapPin, Phone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { experiences } from "@/data/experiences";
import { riverside } from "@/data/riverside";

export const Route = createFileRoute("/du-lich")({
  head: () => ({
    meta: [
      { title: "Du lịch nông nghiệp Bình Mỹ — Bình Mỹ FarmGo" },
      {
        name: "description",
        content:
          "Các hoạt động trải nghiệm nông nghiệp, sông nước và mua sắm nông sản trong hành trình tại Bình Mỹ.",
      },
      { property: "og:title", content: "Du lịch nông nghiệp Bình Mỹ" },
      {
        property: "og:description",
        content: "Tham quan vườn, chèo xuồng, làm bánh và mua nông sản tại Bình Mỹ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TourismPage,
});

function TourismPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Du lịch nông nghiệp Bình Mỹ</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Khám phá các hoạt động trải nghiệm nông nghiệp, sông nước và mua sắm nông sản trong hành
        trình tại Bình Mỹ.
      </p>

      <article className="mt-9 overflow-hidden rounded-lg border border-primary/30 bg-card shadow-sm">
        <div className="border-b border-primary/20 bg-primary px-5 py-5 text-primary-foreground sm:px-7">
          <p className="text-xs font-semibold uppercase">Điểm đến nổi bật</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">BÌNH MỸ RIVERSIDE</h2>
          <p className="mt-1 text-sm sm:text-base">Khu du lịch sinh thái – trải nghiệm tại Bình Mỹ</p>
        </div>
        <div className="p-5 sm:p-7">
          <div className="grid gap-4 text-sm sm:grid-cols-2 sm:text-base">
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong>Địa điểm:</strong> {riverside.address}</span></p>
            <p className="flex items-start gap-2"><Phone className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong>Hotline:</strong> <a className="font-bold text-primary hover:underline" href={riverside.phoneUrl}>{riverside.phone}</a></span></p>
            <p className="flex items-start gap-2"><Leaf className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong>Loại hình:</strong> Du lịch sinh thái, tham quan và vui chơi</span></p>
            <p className="flex items-start gap-2"><Clock3 className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong>Thời gian hoạt động:</strong> Liên hệ đơn vị để xác nhận</span></p>
            <p className="flex items-start gap-2 sm:col-span-2"><Wallet className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong>Giá dịch vụ:</strong> Liên hệ đơn vị tổ chức</span></p>
          </div>
          <p className="mt-5 border-t border-border pt-5 leading-7 text-muted-foreground">
            Bình Mỹ Riverside là điểm du lịch sinh thái tại xã Bình Mỹ, phù hợp cho gia đình, nhóm bạn và khách muốn tham quan, vui chơi và trải nghiệm không gian gần gũi thiên nhiên.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/du-lich/binh-my-riverside">Xem chi tiết <ArrowRight /></Link></Button>
            <Button asChild variant="outline"><a href={riverside.phoneUrl}><Phone /> Gọi {riverside.phone}</a></Button>
            <Button asChild variant="outline"><a href={riverside.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook /> Liên hệ Facebook <ExternalLink /></a></Button>
          </div>
        </div>
      </article>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {experiences.map((experience, index) => (
          <article
            key={experience.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <img
              src={experience.image}
              alt={experience.imageAlt}
              loading="lazy"
              width={1024}
              height={768}
              className="aspect-4/3 w-full object-cover"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">
                  {index + 1}. {experience.title}
                </h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{experience.description}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
        Nội dung trải nghiệm được xây dựng theo định hướng du lịch nông nghiệp tại Bình Mỹ và
        dùng để minh họa cho nguyên mẫu. Lịch trình thực tế cần được xác nhận trước khi triển
        khai.
      </p>

      <Link
        to="/san-pham"
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Chọn nông sản để gửi yêu cầu mua
      </Link>
    </div>
  );
}
