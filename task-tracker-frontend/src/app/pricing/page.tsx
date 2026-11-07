import Link from 'next/link';
import { PublicLayout, Reveal } from '@/components/layout/PublicLayout';

const tiers = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    description: 'For individuals and freelancers seeking clear, calm task organization.',
    features: [
      'Unlimited tasks & categories',
      'Interactive Monthly Calendar Planner',
      'Kanban board & Table timeline views',
      'Task timer tracking widget',
      'Full Dark & Light mode contrast',
    ],
    cta: 'Start Free',
    href: '/users/create',
    highlighted: false,
  },
  {
    name: 'Pro Flow',
    price: '$12',
    period: 'per user / month',
    description: 'For teams that need high-velocity synchronization and advanced calendar workflows.',
    features: [
      'Everything in Starter',
      'Unlimited workspace members',
      'Real-time collaborative updates',
      'Multi-team category distribution',
      'Historical velocity analytics',
      'Priority email & chat support',
    ],
    cta: 'Get Started with Pro',
    href: '/users/create',
    highlighted: true,
    badge: 'Popular',
  },
  {
    name: 'Enterprise',
    price: '$29',
    period: 'per user / month',
    description: 'For organizations demanding governance, SLA guarantees, and dedicated management.',
    features: [
      'Everything in Pro Flow',
      'Custom SLA & 99.99% uptime',
      'Single Sign-On (SSO) & OAuth',
      'Tenant isolation & audit logs',
      'Dedicated success manager',
    ],
    cta: 'Contact Sales',
    href: '/users/create',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center">
          <span className="eyebrow">Pricing Plans</span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl text-[var(--text-main)]">
            Transparent pricing for every stage
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-[var(--text-muted)]">
            Simple, honest plans that scale with your team. No hidden extras or surprise fees.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier, idx) => (
            <Reveal key={idx} className="flex">
              <div
                className={`glass-card relative flex w-full flex-col justify-between p-8 sm:p-10 ${
                  tier.highlighted
                    ? 'border-[var(--text-main)] ring-2 ring-[var(--text-main)]/20 shadow-2xl'
                    : ''
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 right-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-3.5 py-1 text-xs font-bold shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">{tier.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{tier.description}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-[var(--text-main)]">{tier.price}</span>
                    <span className="text-xs text-[var(--text-muted)]">/ {tier.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 border-t border-[var(--card-border)] pt-6 text-xs text-[var(--text-muted)]">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="text-[var(--text-main)] font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-4">
                  <Link
                    href={tier.href}
                    className={`w-full ${tier.highlighted ? 'btn-primary-mono' : 'btn-ghost-mono'} justify-center py-2.5 text-center text-xs`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
