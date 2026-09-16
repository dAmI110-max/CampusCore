import React from 'react';
import { X, Zap, Mail, ShieldCheck, Globe, GraduationCap, Sparkles, ShoppingBag, Home, Wrench, Briefcase, Calendar, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-purple-900/40 relative my-6 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                <Zap className="w-6 h-6 fill-white text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">About CampusCore</h2>
                <p className="text-xs text-slate-500 dark:text-purple-300/70 font-medium">The All-in-One University Tech & Student Life Super-App</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-purple-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="py-4 space-y-5 text-xs sm:text-sm text-slate-600 dark:text-purple-200/80 leading-relaxed overflow-y-auto pr-1">
            {/* Mission Statement */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-800/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Our Mission</span>
              </div>
              <p className="text-slate-700 dark:text-purple-100/90 leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-bold">CampusCore</strong> is built to empower African university students with a secure, modern, all-in-one digital ecosystem. We connect student buyers, campus sellers, hostel owners, student freelancers, and academic researchers through trusted escrow protections and university-specific tools.
              </p>
            </div>

            {/* Launch Campus Highlights */}
            <div className="p-4.5 bg-gradient-to-br from-[#1b0d2e] via-[#150a24] to-[#250e3d] rounded-2xl text-white space-y-2 border border-purple-800/50 shadow-md">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                Phase 1 Live Campus: Osun State University (UNIOSUN)
              </div>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                Currently deployed across all 6 UNIOSUN campuses: <strong>Osogbo</strong>, <strong>Ikire</strong>, <strong>Okuku</strong>, <strong>Ejigbo</strong>, <strong>Ifetedo</strong>, and <strong>Ipetu-Ijesha</strong>. Students can trade gadgets, discover verified lodges near campus gates, hire fellow student freelancers, and study smarter with AI.
              </p>
            </div>

            {/* What Students Can Do */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                What Students Can Do on CampusCore
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex items-start gap-2.5">
                  <ShoppingBag className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Student Marketplace</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Buy & sell phones, laptops, textbooks, fashion and dorm appliances with 100% Escrow buyer protection.</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5">
                  <Sparkles className="w-4.5 h-4.5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Campus Study & StudyGen AI</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Free AI academic assistant, past questions repository, textbooks, lecture slides, and GPA calculator.</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5">
                  <Home className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Hostels & Roommates</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Verified off-campus student accommodation, self-contain apartments, and verified roommate matching.</span>
                  </div>
                </div>

                <div className="p-3 bg-fuchsia-50/70 dark:bg-fuchsia-950/20 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/40 flex items-start gap-2.5">
                  <Wrench className="w-4.5 h-4.5 text-fuchsia-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Student Freelancers & Services</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Hire student graphics designers, tutors, web coders, hair stylists, phone technicians and laundry vendors.</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
                  <Briefcase className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Campus Jobs & Gigs</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Discover flexible campus-friendly part-time gigs, teaching opportunities, and student internships.</span>
                  </div>
                </div>

                <div className="p-3 bg-pink-50/70 dark:bg-pink-950/20 rounded-2xl border border-pink-100 dark:border-pink-900/40 flex items-start gap-2.5">
                  <Calendar className="w-4.5 h-4.5 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">Campus Events & Tickets</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">Departmental galas, freshers' welcome parties, tech conferences, and instant digital QR ticketing.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Vision & Pillars */}
            <div className="space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">Future Vision</h3>
              <div className="p-3.5 bg-slate-50 dark:bg-purple-950/30 rounded-2xl border border-slate-200 dark:border-purple-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Pan-African University Expansion</span>
                </div>
                <p className="text-slate-600 dark:text-purple-300/80 text-[11px] leading-relaxed">
                  CampusCore is engineered to expand rapidly to Obafemi Awolowo University (OAU), University of Ibadan (UI), University of Lagos (UNILAG), and universities across Nigeria and West Africa.
                </p>
              </div>
            </div>

            {/* Official Support & Enquiries */}
            <div className="p-4 bg-purple-950 text-white rounded-2xl space-y-1.5 border border-purple-900/60 shadow-inner">
              <span className="text-[11px] text-purple-300 font-semibold block uppercase tracking-wider">
                Official CampusCore Support & Partnerships
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Mail className="w-4 h-4 text-amber-400" />
                <a href="mailto:support@campuscore.app" className="hover:underline text-sm text-white">
                  support@campuscore.app
                </a>
              </div>
              <p className="text-[11px] text-purple-300/80">
                For student verification issues, escrow inquiries, dispute resolution, or campus partnerships.
              </p>
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-3 border-t border-slate-100 dark:border-purple-900/30 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 dark:text-purple-400">CampusCore &copy; 2026</span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

