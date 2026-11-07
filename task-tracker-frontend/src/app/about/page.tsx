import { PublicLayout, Reveal } from '@/components/layout/PublicLayout';

const values = [
  {
    title: 'Clarity Over Visual Clutter',
    desc: 'Workspaces should never distract you from the work itself. We design high-contrast, monochrome interactions that feel immediate and focused.',
    icon: '01'
  },
  {
    title: 'Integrated Time & Calendar',
    desc: 'Scheduling tasks on dates and tracking their execution time should be effortless. We treat calendars and timers as first-class citizens.',
    icon: '02'
  },
  {
    title: 'High-Contrast Accessibility',
    desc: 'Text must always be readable in both dark and light modes. We test every element against strict contrast guidelines.',
    icon: '03'
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center">
          <span className="eyebrow">Our Philosophy</span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl text-[var(--text-main)]">
            A calmer way to move work forward.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[var(--text-muted)]">
            Organizo was created to replace visual noise with pure, high-contrast task tracking and integrated calendar management.
          </p>
        </div>

        {/* Story Section */}
        <Reveal className="mt-16">
          <div className="glass-card grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow">The Background</span>
              <h2 className="mt-3 text-2xl font-bold text-[var(--text-main)]">
                Built for builders who value focus over rainbow dashboards.
              </h2>
              <div className="mt-5 space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                <p>
                  Most productivity tools overwhelm teams with endless colorful tags, badges, and complicated status charts.
                </p>
                <p>
                  We built Organizo around clean typography, intuitive calendar scheduling, and distraction-free monochrome styling that looks great in any lighting environment.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--canvas-bg)] p-6 text-xs text-[var(--text-main)] space-y-3">
              <div className="font-mono font-bold text-sm">Organizo Principles</div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                &ldquo;Every task has a place in time. Put it on the calendar, measure its momentum, and ship without friction.&rdquo;
              </p>
            </div>
          </div>
        </Reveal>

        {/* Values Grid */}
        <section className="mt-20">
          <div className="text-center">
            <span className="eyebrow">Core Beliefs</span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl text-[var(--text-main)]">How we design software</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={i}>
                <div className="glass-card flex h-full flex-col p-8">
                  <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{v.icon}</span>
                  <h3 className="mt-5 text-base font-bold text-[var(--text-main)]">{v.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
