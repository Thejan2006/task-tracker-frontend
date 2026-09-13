import Link from 'next/link';
import { LandingLayout, Reveal } from '@/components/LandingLayout';

const plans = [{ name: 'Starter', price: '0', detail: 'For personal momentum', features: ['Unlimited tasks', '1 active workspace', 'Basic insights'] }, { name: 'Flow', price: '12', detail: 'For teams in motion', features: ['Everything in Starter', 'Unlimited collaborators', 'Advanced insights', 'Priority support'], featured: true }, { name: 'Scale', price: '32', detail: 'For growing organizations', features: ['Everything in Flow', 'Private workspaces', 'Custom workflows'] }];

export default function PricingPage() {
  return <LandingLayout eyebrow="Simple, transparent pricing" title={<>Invest in your team&apos;s <span>best work.</span></>} description="Start free. Upgrade when your momentum demands it. No hidden fees, no long-term lock-ins."><section className="pricing-grid">{plans.map((plan) => <Reveal key={plan.name} className={`price-card ${plan.featured ? 'featured' : ''}`}>{plan.featured && <span className="popular-tag">Most popular</span>}<h3>{plan.name}</h3><p>{plan.detail}</p><div className="price"><strong>${plan.price}</strong><span>/ user / month</span></div><Link href="/login" className={`button ${plan.featured ? 'button-primary' : 'button-ghost'}`}>Choose {plan.name}</Link><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></Reveal>)}</section></LandingLayout>;
}
