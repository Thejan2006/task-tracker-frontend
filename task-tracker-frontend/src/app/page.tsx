'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { Reveal } from '@/components/LandingLayout';

const features = [
  ['01', 'One calm workspace', 'Bring tasks, priorities, and progress into one focused view.'],
  ['02', 'Momentum, measured', 'See what is moving and what needs your attention without the noise.'],
  ['03', 'Made for humans', 'Thoughtful defaults help your team do its best work every day.'],
];

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/dashboard');
    else setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return <div className="grid min-h-screen place-items-center bg-[#080812] text-[#9898ad]">Loading Taskflow...</div>;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.14),transparent_28%),radial-gradient(circle_at_10%_42%,rgba(6,182,212,0.08),transparent_25%),#080812] text-[#f8f7ff]">
      <SiteHeader />
      <section className="mx-auto grid max-w-[1240px] grid-cols-[0.9fr_1.1fr] items-center gap-[60px] px-7 py-24 pb-[120px] max-[800px]:grid-cols-1 max-[800px]:pt-[55px]">
        <div>
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">The operating system for momentum</span>
          <h1 className="my-[22px] mb-5 max-w-[650px] text-[clamp(3.3rem,6vw,5.4rem)] leading-[0.98] tracking-[-0.075em] [&>span]:text-[#8b5cf6]">Make progress <span>feel effortless.</span></h1>
          <p className="max-w-[510px] text-[1.08rem] leading-[1.7] text-[#9898ad]">Taskflow gives ambitious teams a beautiful, focused space to plan clearly, collaborate deeply, and ship their best work.</p>
          <div className="mt-[30px] flex items-center gap-6 max-[480px]:flex-col max-[480px]:items-stretch max-[480px]:gap-[17px]">
            <Link href="/users/create" className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_8px_25px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(139,92,246,0.4)]">Start for free <span>→</span></Link>
            <Link href="/login" className="text-[0.86rem] text-[#9898ad] transition-colors hover:text-[#f8f7ff]">Sign in <span>↗</span></Link>
          </div>
          <div className="mt-14 flex items-center gap-3 text-[0.76rem] text-[#9898ad]"><div className="flex pl-[9px] [&>i]:-ml-[9px] [&>i]:grid [&>i]:h-[27px] [&>i]:w-[27px] [&>i]:place-items-center [&>i]:rounded-full [&>i]:border-2 [&>i]:border-[#080812] [&>i]:text-[0.68rem] [&>i]:not-italic [&>i:first-child]:bg-[#ef8354] [&>i:nth-child(2)]:bg-[#4e8dd7] [&>i:nth-child(3)]:bg-[#a17edc] [&>i:nth-child(4)]:bg-[#15152a]"><i>A</i><i>M</i><i>J</i><i>+</i></div><span>Trusted by 2,000+ focused teams</span></div>
        </div>
        <motion.div className="relative grid min-h-[460px] place-items-center max-[800px]:min-h-[360px]" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }}>
          <div className="absolute right-[8%] top-[6%] h-[230px] w-[230px] rounded-full bg-[rgba(139,92,246,0.23)] blur-[2px]" /><div className="absolute bottom-[2%] left-[3%] h-[170px] w-[170px] rounded-full bg-[rgba(6,182,212,0.18)] blur-[2px]" />
          <div className="relative z-[1] w-full max-w-[530px] overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(20,20,39,0.8)] shadow-[0_28px_90px_rgba(0,0,0,0.35),0_0_0_9px_rgba(255,255,255,0.025)] backdrop-blur-[18px] [transform:perspective(1000px)_rotateY(-5deg)_rotateX(3deg)]"><div className="flex justify-between border-b border-white/10 px-[18px] py-[15px] text-[0.68rem] text-[#9898ad]"><span className="text-[0.5rem] tracking-[3px] text-[#777]">● ● ●</span><span>My workspace</span><span>•••</span></div><div className="grid min-h-[330px] grid-cols-[125px_1fr] max-[480px]:grid-cols-[85px_1fr]"><div className="flex flex-col gap-[17px] border-r border-white/10 px-3.5 py-[22px] text-[0.67rem] text-[#77768e] max-[480px]:px-[9px] max-[480px]:py-[18px]"><b className="mb-1.5 text-[#f5f2ff]">Workspace</b><span className="rounded-md bg-[rgba(139,92,246,0.16)] px-2 py-[7px] text-white">Overview</span><span>My tasks</span><span>Projects</span><span>Insights</span></div><div className="px-[27px] py-[34px] max-[480px]:px-[15px] max-[480px]:py-6"><small className="text-[0.53rem] tracking-[0.12em] text-[#818097]">MONDAY, SEPTEMBER 14</small><h3 className="my-[13px] mb-[5px] text-[1.3rem] tracking-[-0.04em]">Good morning, Alex <span className="text-[#f5c96d]">✦</span></h3><p className="text-[0.7rem] text-[#818097]">Here&apos;s what&apos;s moving today.</p><div className="my-[26px] mb-3 grid grid-cols-2 gap-2.5 [&>div]:rounded-[9px] [&>div]:border [&>div]:border-white/10 [&>div]:bg-white/[0.035] [&>div]:p-[15px]"><div><strong className="block text-[1.45rem]">12</strong><span className="mt-[5px] block text-[0.62rem] text-[#818097]">In progress</span></div><div><strong className="block text-[1.45rem]">84%</strong><span className="mt-[5px] block text-[0.62rem] text-[#818097]">On track</span></div></div><div className="grid grid-cols-[1fr_auto] gap-[5px] rounded-[9px] border border-white/10 bg-white/[0.035] p-[15px]"><span className="mt-[5px] block text-[0.62rem] text-[#818097]">This week&apos;s focus</span><b className="text-[0.72rem]">84%</b><div className="col-span-full mt-2 h-[5px] rounded-[5px] bg-[#303047]"><i className="block h-full w-[84%] rounded-[inherit] bg-[#8b5cf6]" /></div></div></div></div></div>
        </motion.div>
      </section>
      <section className="mx-auto max-w-[1180px] px-7 py-[95px] max-[800px]:py-[65px]"><Reveal><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">Less managing. More making.</span><h2 className="my-[18px] mb-[50px] text-[clamp(2.4rem,4vw,4rem)] leading-[1.05] tracking-[-0.065em]">Everything your team needs<br /><span className="text-[#8b5cf6]">to move as one.</span></h2></Reveal><div className="grid grid-cols-3 gap-[18px] max-[800px]:grid-cols-1">{features.map(([number, title, text]) => <Reveal key={number} className="relative min-h-[230px] rounded-2xl border border-white/10 bg-white/[0.04] p-[27px] backdrop-blur-[16px] transition hover:-translate-y-1.5 hover:border-[rgba(139,92,246,0.5)]"><span className="text-[0.7rem] text-[#8b5cf6]">{number}</span><h3 className="my-[45px] mb-2.5 text-[1.15rem]">{title}</h3><p className="text-[0.85rem] leading-[1.6] text-[#9898ad]">{text}</p><span className="absolute right-[25px] top-[25px] text-[#9898ad]">↗</span></Reveal>)}</div></section>
      <section className="mx-auto mb-[90px] mt-[30px] max-w-[1180px] rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_50%_0,rgba(139,92,246,0.2),transparent_55%)] px-[30px] py-20 text-center"><Reveal><h2 className="mb-5 text-[clamp(2.4rem,4vw,4rem)] leading-[1.05] tracking-[-0.065em]">Ready to find your flow?</h2><p className="mb-7 text-[#9898ad]">Join thousands of teams building their next big thing with less friction.</p><Link href="/users/create" className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_8px_25px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5">Get started free <span>→</span></Link></Reveal></section>
      <footer className="mx-auto flex max-w-[1180px] items-end justify-between px-7 pb-10 text-[0.75rem] text-[#9898ad] max-[800px]:items-start max-[800px]:flex-col max-[800px]:gap-6"><div><Link href="/" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em] text-[#f8f7ff]"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white shadow-[0_0_22px_rgba(139,92,246,0.45)]">T</span><span>Taskflow</span></Link><p>Make space for the work that matters.</p></div><span>© 2026 Taskflow. Built for focused teams.</span></footer>
    </div>
  );
}
