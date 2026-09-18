import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  StudentCommunity,
  CommunityPost,
} from '../../types';
import { CreatePostModal } from './CreatePostModal';
import {
  ArrowLeft,
  Users,
  Plus,
  Heart,
  MessageSquare,
  Pin,
  Share2,
  CheckCircle2,
  Globe,
  Lock,
  Send,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityDetailViewProps {
  community: StudentCommunity;
  onBack: () => void;
}

export const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({
  community,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const loadPosts = () => {
    const p = StorageService.getCommunityPosts(community.id);
    setPosts(p);
    if (currentUser) {
      const userCommIds = StorageService.getUserJoinedCommunityIds(currentUser.id);
      setIsMember(userCommIds.includes(community.id));
    }
  };

  useEffect(() => {
    loadPosts();
    const handleUpdate = () => loadPosts();
    window.addEventListener('campusplug_storage_update', handleUpdate);
    return () => window.removeEventListener('campusplug_storage_update', handleUpdate);
  }, [community.id, currentUser?.id]);

  const handleToggleJoin = () => {
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
    loadPosts();
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) {
      toastError('Please log in to like posts.');
      return;
    }
    StorageService.toggleLikeCommunityPost(postId, currentUser.id);
    loadPosts();
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    if (!currentUser) {
      toastError('Please log in to vote in polls.');
      return;
    }
    const res = StorageService.voteCommunityPoll(postId, optionId, currentUser.id);
    if (!res.success) {
      toastError(res.error || 'Failed to vote.');
      return;
    }
    success('Vote recorded!');
    loadPosts();
  };

  const handleAddComment = (postId: string) => {
    if (!currentUser) {
      toastError('Please log in to comment.');
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    StorageService.addCommunityComment(postId, {
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      authorDepartment: currentUser.department,
      content: text,
    });

    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadPosts();
  };

  return (
    <div className="min-w-0 max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Communities
      </button>

      {/* Community Banner & Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative aspect-[16/6] sm:aspect-[16/4] bg-slate-900 overflow-hidden">
          <img
            src={community.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
            alt={community.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8 relative z-10">
          <div className="flex items-end gap-4">
            <img
              src={community.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={community.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {community.name}
                </h1>
                {community.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <strong>{community.memberCount}</strong> members
                </span>
                <span>•</span>
                <span className="uppercase font-semibold text-slate-600">{community.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 capitalize">
                  {community.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {community.privacy}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleJoin}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                isMember
                  ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              }`}
            >
              {isMember ? 'Joined ✓' : 'Join Community'}
            </button>

            {isMember && (
              <button
                onClick={() => setCreatePostOpen(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Feed & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Posts Feed */}
        <div className="lg:col-span-8 space-y-4">
          {isMember && (
            <div
              onClick={() => setCreatePostOpen(true)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt="user"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl text-xs text-slate-400 font-medium">
                Write something or ask a question to {community.name}...
              </div>
              <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800">No posts in this community yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Start the conversation, ask for study partners, or share campus resources!
              </p>
              {isMember && (
                <button
                  onClick={() => setCreatePostOpen(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => {
              const hasLiked = currentUser && post.likedBy.includes(currentUser.id);

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs">{post.authorName}</h4>
                          {post.authorVerification && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {post.authorDepartment || 'Student'} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {post.pinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-current" /> Pinned
                        </span>
                      )}
                      {post.isAnnouncement && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Announcement
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Body */}
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* Post Images if any */}
                  {post.images && post.images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200">
                      <img
                        src={post.images[0]}
                        alt="attachment"
                        referrerPolicy="no-referrer"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Poll if any */}
                  {post.poll && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        <h5 className="font-bold text-slate-900 text-xs">{post.poll.question}</h5>
                      </div>

                      <div className="space-y-2">
                        {post.poll.options.map((opt) => {
                          const hasVotedThis = currentUser && opt.voterIds.includes(currentUser.id);
                          const totalVotes = post.poll?.totalVotes || 1;
                          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleVotePoll(post.id, opt.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden flex items-center justify-between text-xs ${
                                hasVotedThis
                                  ? 'border-indigo-500 bg-indigo-50/50 font-bold'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              {/* Progress bar background */}
                              <div
                                className="absolute inset-y-0 left-0 bg-indigo-100/60 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />

                              <span className="relative z-10 text-slate-800">{opt.text}</span>
                              <span className="relative z-10 font-mono text-slate-500 text-[11px]">
                                {percentage}% ({opt.votes})
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[10px] text-slate-400 block text-right">
                        {post.poll.totalVotes} total vote(s)
                      </span>
                    </div>
                  )}

                  {/* Footer Actions (Like & Comment stats) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                          hasLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>{post.comments.length} comments</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {post.comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl text-xs">
                          <img
                            src={c.authorAvatar}
                            alt={c.authorName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{c.authorName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-700 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Sidebar with Rules & About */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm">About Community</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {community.description}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Created by</span>
                <strong className="text-slate-900">{community.creatorName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Created Date</span>
                <span>{new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Rules Card */}
          {community.rules && community.rules.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm">Community Guidelines</h3>
              <div className="space-y-2">
                {community.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        community={community}
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onSuccess={loadPosts}
      />
    </div>
  );
};
