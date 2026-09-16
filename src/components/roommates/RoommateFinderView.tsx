import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { RoommateProfile } from '../../types';
import { CreateRoommateModal } from './CreateRoommateModal';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Phone,
  Sparkles,
  Heart,
  BookOpen,
  Coffee,
  Bed,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoommateFinderViewProps {
  onBack?: () => void;
  onOpenChatWithUser?: (targetUserId: string) => void;
  onOpenAuth?: () => void;
}

export const RoommateFinderView: React.FC<RoommateFinderViewProps> = ({
  onBack,
  onOpenChatWithUser,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCleanliness, setSelectedCleanliness] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const campuses = StorageService.getCampuses('uni-uniosun');

  const myRoommateProfile = currentUser
    ? StorageService.getRoommateByUserId(currentUser.id)
    : null;

  const profiles = StorageService.getRoommateProfiles({
    campusId: selectedCampus,
    gender: selectedGender,
    cleanliness: selectedCleanliness,
    searchQuery,
  });

  const handleOpenCreate = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <span className="text-xs text-slate-400">/ Roommate Finder</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-md">
            <Users className="w-3.5 h-3.5" />
            UNIOSUN Roommate Matching
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find Compatible Campus Roommates
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Split off-campus hostel rent with verified students across Osogbo, Okuku, Ikire, Ejigbo, Ifetedo, and Ipetu-Ijesha campuses.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {myRoommateProfile ? 'Edit My Roommate Profile' : 'Post Roommate Listing'}
          </button>
        </div>
      </div>

      {/* Filter Bar Bento */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dept, area, bio..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Campus Selector */}
          <div>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All UNIOSUN Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Selector */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Any Student Gender</option>
              <option value="male">Male Seeking Roommate</option>
              <option value="female">Female Seeking Roommate</option>
            </select>
          </div>

          {/* Cleanliness Filter */}
          <div>
            <select
              value={selectedCleanliness}
              onChange={(e) => setSelectedCleanliness(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Cleanliness: Any</option>
              <option value="very_clean">Very Clean Only</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-800">No matching roommate listings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your filters or be the first to publish a roommate listing for your campus!
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
          >
            Post Your Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* User Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        profile.userAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={profile.userName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">{profile.userName}</span>
                        <span title="Verified Student">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {profile.department} &bull; {profile.level}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {profile.campusName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₦{profile.budget.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal">/yr</span>
                    </span>
                  </div>
                </div>

                {/* Preference Tag Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {profile.gender}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {profile.preferredRoomType}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Clean: {profile.cleanlinessLevel.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                    Study: {profile.studyHabits.replace('_', ' ')}
                  </span>
                </div>

                {/* Location target & Bio */}
                <div className="text-xs text-slate-600 space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Area: {profile.preferredLocation}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{profile.bio}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (!currentUser && onOpenAuth) {
                      onOpenAuth();
                      return;
                    }
                    if (onOpenChatWithUser) {
                      onOpenChatWithUser(profile.userId);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Chat in App
                </button>

                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=Hello%20${encodeURIComponent(
                      profile.userName
                    )},%20I%20saw%20your%20roommate%20listing%20on%20CampusCore%20for%20${encodeURIComponent(
                      profile.campusName
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE / EDIT ROOMMATE MODAL --- */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRoommateModal
            existingProfile={myRoommateProfile}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
