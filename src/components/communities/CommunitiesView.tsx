import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { StudentCommunity } from '../../types';
import { CommunityCard } from './CommunityCard';
import { CommunityDetailView } from './CommunityDetailView';
import { CreateCommunityModal } from './CreateCommunityModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Users,
  Layers,
  Sparkles,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunitiesViewProps {
  onBack?: () => void;
  onOpenAuth?: () => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ onBack, onOpenAuth }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'explore' | 'my_joined' | 'my_created'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');

  // Modals & View States
  const [selectedCommunity, setSelectedCommunity] = useState<StudentCommunity | null>(null);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);

  // Data
  const [communities, setCommunities] = useState<StudentCommunity[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);

  const loadData = () => {
    setCampuses(StorageService.getCampuses());
    setCommunities(
      StorageService.getCommunities(
        selectedCampus === 'all' ? undefined : selectedCampus,
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery
      )
    );
    if (currentUser) {
      setJoinedCommunityIds(StorageService.getUserJoinedCommunityIds(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campusplug_storage_update', handleUpdate);
    return () => window.removeEventListener('campusplug_storage_update', handleUpdate);
  }, [selectedCategory, selectedCampus, searchQuery, currentUser?.id]);

  const handleToggleJoin = (community: StudentCommunity) => {
    if (!currentUser) {
      toastError('Please log in to join communities.');
      return;
    }
    const res = StorageService.toggleCommunityMembership(community.id, currentUser.id);
    if (res.isMember) {
      success(`Joined ${community.name}!`);
    } else {
      success(`Left ${community.name}`);
    }
    loadData();
  };

  const myJoinedCommunities = communities.filter((c) =>
    joinedCommunityIds.includes(c.id)
  );

  const myCreatedCommunities = communities.filter(
    (c) => c.creatorId === currentUser?.id
  );

  if (selectedCommunity) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <CommunityDetailView
          community={selectedCommunity}
          onBack={() => setSelectedCommunity(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          <span className="text-xs text-slate-400">/ Student Communities</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Social & Departmental Hubs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Communities
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Join peer discussion forums, departmental study groups, tech clubs, gaming guilds, and hostel communities with interactive polls and student feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-community-btn"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateCommunityOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Start a Community
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Explore ({communities.length})
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab('my_joined')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_joined'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Joined ({myJoinedCommunities.length})
              </button>

              <button
                onClick={() => setActiveTab('my_created')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_created'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Communities I Manage ({myCreatedCommunities.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* EXPLORE TAB */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student communities by name, topic, or department..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="tech">Tech & Developers</option>
                <option value="academic">Academic & Study</option>
                <option value="hostel">Hostels</option>
                <option value="creative">Creative & Arts</option>
                <option value="gaming">Gaming</option>
                <option value="sports">Sports</option>
                <option value="general">General</option>
              </select>

              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {communities.length === 0 ? (
            <EmptyState
              title="No student communities found"
              description="Be the leader to establish a community for your department, hostel, or interest group."
              actionLabel="Launch a Community"
              onAction={() => setCreateCommunityOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((comm) => (
                <CommunityCard
                  key={comm.id}
                  community={comm}
                  isMember={joinedCommunityIds.includes(comm.id)}
                  onSelect={(c) => setSelectedCommunity(c)}
                  onToggleJoin={(c) => handleToggleJoin(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY JOINED COMMUNITIES TAB */}
      {activeTab === 'my_joined' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Communities You've Joined ({myJoinedCommunities.length})
          </h2>

          {myJoinedCommunities.length === 0 ? (
            <EmptyState
              title="You haven't joined any communities yet"
              description="Join tech guilds, study clubs, and departmental groups to see their updates."
              actionLabel="Explore Communities"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myJoinedCommunities.map((comm) => (
                <CommunityCard
                  key={comm.id}
                  community={comm}
                  isMember={true}
                  onSelect={(c) => setSelectedCommunity(c)}
                  onToggleJoin={(c) => handleToggleJoin(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY CREATED COMMUNITIES TAB */}
      {activeTab === 'my_created' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Communities You Manage ({myCreatedCommunities.length})
            </h2>
            <button
              onClick={() => setCreateCommunityOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Start New Community
            </button>
          </div>

          {myCreatedCommunities.length === 0 ? (
            <EmptyState
              title="You haven't created any communities yet"
              description="Found a campus guild or student forum and invite your classmates."
              actionLabel="Create a Community"
              onAction={() => setCreateCommunityOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCreatedCommunities.map((comm) => (
                <CommunityCard
                  key={comm.id}
                  community={comm}
                  isMember={true}
                  onSelect={(c) => setSelectedCommunity(c)}
                  onToggleJoin={(c) => handleToggleJoin(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
