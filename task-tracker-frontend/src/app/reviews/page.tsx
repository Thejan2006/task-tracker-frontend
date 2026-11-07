import { PublicLayout, Reveal } from '@/components/layout/PublicLayout';

const testimonials = [
  {
    quote: 'The high-contrast black and white UI is so much easier on the eyes during late night coding sessions. It just works.',
    name: 'Maya Chen',
    role: 'VP of Product, Horizon Labs',
    avatar: 'M',
  },
  {
    quote: 'Being able to place tasks directly on the calendar and see what is due this week without endless color distractions made planning fun again.',
    name: 'Jonah Vance',
    role: 'Lead Architect, Stellar Works',
    avatar: 'J',
  },
  {
    quote: 'The dark and light theme switching is seamless. The text contrast is crisp, and the widget layout is exactly what our team needed.',
    name: 'Ari Santos',
    role: 'Design Director, Echo Systems',
    avatar: 'A',
  },
];

export default function ReviewsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="text-center">
          <span className="eyebrow">User Feedback</span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl text-[var(--text-main)]">
            Trusted by teams that demand focus.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-[var(--text-muted)]">
            Read what developers and founders say about Organizo&apos;s clean monochrome workspace.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Reveal key={idx}>
              <div className="glass-card flex h-full flex-col justify-between p-8">
                <blockquote className="text-xs leading-relaxed text-[var(--text-main)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3 border-t border-[var(--card-border)] pt-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold shadow-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">{t.name}</div>
                    <div className="text-[0.68rem] text-[var(--text-muted)]">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
