import { Headset, MessageCircle, Phone, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { contactConfig } from "@/lib/contact-config";

const quickQuestions = [
  {
    q: "Tôi muốn mua nông sản thì làm sao?",
    a: "Bạn vào mục Nông sản, chọn sản phẩm và số lượng, sau đó gửi Yêu cầu mua. Hệ thống sẽ tạo mã đơn BMFG và mã QR thanh toán theo tổng tiền đơn hàng.",
  },
  {
    q: "Rau móp Bình Mỹ giá bao nhiêu?",
    a: "Giá rau móp hiện đang hiển thị ở mức tham khảo 25.000 – 35.000đ/kg. Giá cuối cùng có thể được xác nhận lại khi đặt mua.",
  },
  {
    q: "Tôi muốn xem địa điểm tham quan?",
    a: "Bạn vào mục Bản đồ để xem các điểm nhà vườn, điểm bán nông sản, điểm trải nghiệm nông nghiệp và điểm nhận hàng tại Bình Mỹ.",
  },
];

type ChatMsg = { from: "user" | "bot"; text: string };

const roundBtn =
  "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function FloatingContactMenu() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [zaloNotice, setZaloNotice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, zaloNotice]);

  useEffect(() => {
    if (!open || chatOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, chatOpen]);

  function openZaloChat() {
    setChatOpen(true);
    setOpen(false);
  }

  function openMessenger() {
    if (!contactConfig.facebookUrl) return toast.info("Thông tin liên hệ đang cập nhật");
    window.open(contactConfig.facebookUrl, "_blank", "noopener,noreferrer");
  }

  function callPhone() {
    if (!contactConfig.phone) return toast.info("Thông tin liên hệ đang cập nhật");
    try {
      window.location.href = `tel:${contactConfig.phone}`;
    } catch {
      toast.info(`Gọi số ${contactConfig.phone}`);
    }
  }

  function ask(i: number) {
    const item = quickQuestions[i];
    if (!item) return;
    setMessages((m) => [...m, { from: "user", text: item.q }, { from: "bot", text: item.a }]);
  }

  function openZaloLink() {
    if (!contactConfig.zaloUrl) {
      setZaloNotice(true);
      toast.info("Thông tin liên hệ Zalo đang cập nhật.");
      return;
    }
    window.open(contactConfig.zaloUrl, "_blank", "noopener,noreferrer");
  }

  const actions = [
    {
      label: "Zalo",
      onClick: openZaloChat,
      icon: <span className="text-xs font-bold tracking-tight">Zalo</span>,
    },
    { label: "Messenger", onClick: openMessenger, icon: <MessageCircle className="size-5" /> },
    { label: "Gọi điện", onClick: callPhone, icon: <Phone className="size-5" /> },
  ];

  return (
    <TooltipProvider delayDuration={250}>
      {chatOpen && (
        <div
          role="dialog"
          aria-label="Chat Zalo Bình Mỹ FarmGo"
          className="fixed right-3 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] z-50 flex h-[min(420px,calc(100dvh-7rem))] w-[min(340px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6 sm:bottom-24"
        >
          <div className="flex items-start justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="font-semibold">Bình Mỹ FarmGo</p>
              <p className="text-xs opacity-80">Zalo · Hỗ trợ trực tuyến (mô phỏng)</p>
            </div>
            <button
              type="button"
              aria-label="Đóng chatbox"
              onClick={() => setChatOpen(false)}
              className="rounded-full p-1 hover:bg-primary-foreground/15"
            >
              <X className="size-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-background p-3 text-sm">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-secondary-foreground">
              Xin chào! Bình Mỹ FarmGo có thể hỗ trợ bạn về nông sản và trải nghiệm tại Bình Mỹ.
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.from === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-primary-foreground"
                    : "max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-secondary-foreground"
                }
              >
                {m.text}
              </div>
            ))}
            {zaloNotice && (
              <p className="text-center text-xs text-muted-foreground">
                Thông tin liên hệ Zalo đang cập nhật.
              </p>
            )}
            <div className="flex flex-col items-start gap-1.5 pt-1">
              {quickQuestions.map((item, i) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => ask(i)}
                  className="rounded-full border border-primary/40 bg-card px-3 py-1.5 text-left text-xs text-primary hover:bg-primary/10"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={openZaloLink}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Send className="size-4" /> Mở Zalo để chat
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
      >
        <div
          id="quick-contact-actions"
          aria-hidden={!open}
          className={`flex flex-col items-end gap-3 transition-all duration-200 motion-reduce:transition-none ${
            open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          {actions.map((a) => (
            <Tooltip key={a.label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={a.label}
                  tabIndex={open ? 0 : -1}
                  onClick={a.onClick}
                  className={roundBtn}
                >
                  {a.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={10}>
                {a.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <button
          type="button"
          aria-label={open ? "Đóng menu liên hệ" : "Mở menu liên hệ"}
          aria-expanded={open}
          aria-controls="quick-contact-actions"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          {open ? <X className="size-6" /> : <Headset className="size-6" />}
        </button>
      </div>
    </TooltipProvider>
  );
}
