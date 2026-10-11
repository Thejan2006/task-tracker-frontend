import Link from 'next/link';
import { LandingLayout, Reveal } from '@/components/LandingLayout';

const plans = [
  {
    name: 'Starter',
    price: '0',
    detail: 'For personal momentum',
    features: ['Unlimited tasks', '1 active workspace', 'Basic insights', 'Community support'],
  },
  {
    name: 'Flow',
    price: '12',
    detail: 'For teams in motion',
    features: [
      'Everything in Starter',
      'Unlimited collaborators',
      'Advanced insights',
      'Priority support',
      'Custom categories',
    ],
    featured: true,
  },
  {
    name: 'Scale',
    price: '32',
    detail: 'For growing organizations',
    features: [
      'Everything in Flow',
      'Private workspaces',
      'Custom workflows',
      'Admin controls',
      'Dedicated account manager',
    ],
  },
];

export default function PricingPage() {
  return (
    <LandingLayout
      eyebrow="Simple, transparent pricing"
      title={
        <>
          Invest in your team&apos;s <span>best work.</span>
        </>
      }
      description="Start free. Upgrade when your momentum demands it. No hidden fees, no long-term lock-ins."
    >
      <section className="mx-auto grid max-w-[1180px] grid-cols-3 gap-[18px] px-7 py-20 max-[800px]:grid-cols-1 max-[800px]:py-14">
        {plans.map((plan) => (
          <Reveal
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-2xl border bg-white/[0.04] p-7 backdrop-blur-xl transition-all ${
              plan.featured
                ? 'border-[#8b5cf6] shadow-[0_0_36px_rgba(139,92,246,0.18)] ring-1 ring-[#8b5cf6]/50'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              {plan.featured && (
                <span className="absolute right-5 top-5 rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-1 text-[0.65rem] font-semibold text-[#c4b5fd]">
                  Most popular
                </span>
              )}
              <h3 className="m-0 text-xl font-bold text-[#f8f7ff]">{plan.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#9898ad]">{plan.detail}</p>

              <div className="my-7 flex items-baseline gap-1.5">
                <strong className="text-5xl font-extrabold tracking-tight text-[#f8f7ff]">${plan.price}</strong>
                <span className="text-xs text-[#9898ad]">/ user / month</span>
              </div>

              <Link
                href="/login"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'neon-button shadow-[0_8px_25px_rgba(139,92,246,0.25)]'
                    : 'glass-button hover:border-white/30 text-[#f8f7ff]'
                }`}
              >
                Choose {plan.name} →
              </Link>

              <ul className="m-0 mt-6 list-none border-t border-white/10 px-0 pt-5 space-y-3 text-xs leading-relaxed text-[#9898ad]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </section>
    </LandingLayout>
  );
}
