import ChatWidget from "@/components/ChatWidget";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { IconCalendar, IconChat, IconPhone, IconWrench } from "@/components/Icons";

const services = [
  "Oil changes",
  "Brake repair",
  "Engine diagnostics",
  "Tire replacement",
  "Battery replacement",
];

const stats = [
  { value: "24/7", label: "Always answering" },
  { value: "<3s", label: "Avg. response time" },
  { value: "5+", label: "Lead fields captured" },
];

const features = [
  {
    icon: IconPhone,
    title: "Capture every lead",
    desc: "After-hours visitors get real answers — not voicemail or a dead website.",
  },
  {
    icon: IconChat,
    title: "Quote services instantly",
    desc: "Oil changes, brakes, diagnostics — ballpark pricing builds trust before they walk in.",
  },
  {
    icon: IconCalendar,
    title: "Book appointments",
    desc: "Collects name, phone, vehicle, and service — then emails you the lead.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-ink-950 shadow-glow">
              <IconWrench className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-sm font-semibold tracking-tight text-white">
                ShopLine AI
              </span>
              <p className="text-[11px] text-ink-400">Receptionist for repair shops</p>
            </div>
          </div>
          <a
            href="#demo"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-gold-light"
          >
            Get a Demo
          </a>
        </div>
      </header>

      <main className="pt-[72px]">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
          <div
            className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60"
            style={{ backgroundSize: "48px 48px" }}
          />
          <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-gold/8 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:pt-20 lg:pb-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_420px] lg:gap-12 xl:grid-cols-[1fr_440px]">
              <div className="animate-fade-up">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gold" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                    Live demo — try it now
                  </span>
                </div>

                <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                  Never miss another{" "}
                  <span className="text-gradient">service call</span>
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-300">
                  Your AI receptionist answers customers around the clock — quotes
                  services, shares hours, and books appointments while you&apos;re under
                  the hood.
                </p>

                <div className="mt-10 flex flex-wrap gap-8 border-t border-white/[0.06] pt-8">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-2xl font-bold text-gold">
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                <ul className="mt-10 grid gap-2.5 sm:grid-cols-2">
                  {services.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2.5 text-sm text-ink-200"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-[10px] text-gold">
                        ✓
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div id="chat" className="animate-fade-up lg:translate-y-2" style={{ animationDelay: "0.15s" }}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
                      Talk to the AI Receptionist
                    </h2>
                    <p className="mt-1 text-sm text-ink-400">
                      Real AI · Mike&apos;s Auto Repair demo
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gold/10 blur-2xl" />
                  <div className="relative">
                    <ChatWidget />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-light border-y border-ink-200/80 px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gold-dark">
              Why shop owners switch
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold text-ink-950 sm:text-4xl">
              Built for the bay, not the boardroom
            </h2>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-ink-200/80 bg-white p-8 shadow-sm transition hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-gold transition group-hover:bg-gold group-hover:text-ink-950">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="demo"
          className="relative overflow-hidden px-5 py-20 sm:py-28"
        >
          <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-50" />
          <div className="relative mx-auto max-w-lg">
            <h2 className="text-center font-display text-3xl font-bold text-white sm:text-4xl">
              Get Your Own AI Receptionist
            </h2>
            <p className="mt-4 text-center text-ink-400">
              Custom demo with your shop name, services, hours, and pricing — ready
              in 48 hours.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-ink-900/60 p-6 shadow-card backdrop-blur sm:p-8">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
