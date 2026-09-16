import React from 'react';
import { Search, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenCreateProduct: () => void;
  onExploreMarketplace: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onOpenCreateProduct,
  onExploreMarketplace,
}) => {
  const steps = [
    {
      number: '01',
      title: 'Discover or List an Item',
      description:
        'Browse phones, study lamps, laptops, and textbooks or list what you don’t need in under 60 seconds with zero charges.',
      icon: Search,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      number: '02',
      title: 'Chat Direct on WhatsApp',
      description:
        'Connect directly with the student seller or hostel caretaker without any platform fee or middlemen commission.',
      icon: MessageCircle,
      color: 'bg-teal-100 text-teal-700',
    },
    {
      number: '03',
      title: 'Inspect & Pay On Campus',
      description:
        'Meet at popular campus landmarks (Student Union Building or Main Gate). Inspect the item physically before paying.',
      icon: ShieldCheck,
      color: 'bg-sky-100 text-sky-700',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-purple-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest bg-purple-50 dark:bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/60">
            Simple, Safe & Direct
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            How CampusCore Works for UNIOSUN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Designed specifically for student life, trade, and accommodation across all Osun State University campuses.
          </p>
        </div>

        {/* 3 Step Cards in Bento style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/90 rounded-[28px] p-6 sm:p-7 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bento CTA Bar */}
        <div className="mt-10 bg-gradient-to-r from-[#1b0a33] via-[#120724] to-[#250d44] rounded-[32px] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-purple-800/40">
          <div>
            <h3 className="text-xl sm:text-2xl font-black">Have things you no longer use?</h3>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 font-medium">
              Turn your old textbooks, gadgets, and hostels into quick cash or bookings right on campus.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onExploreMarketplace}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl backdrop-blur-xs transition-colors cursor-pointer"
            >
              Browse Items
            </button>
            <button
              onClick={onOpenCreateProduct}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sell An Item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
