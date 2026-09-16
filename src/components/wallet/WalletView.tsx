import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { WalletTransaction, UserBankAccount } from '../../types';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  PlusCircle,
  Building2,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  History,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NIGERIAN_BANKS = [
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '057', name: 'Zenith Bank' },
  { code: '044', name: 'Access Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '090267', name: 'Kuda Microfinance Bank' },
  { code: '999992', name: 'OPay Digital Services' },
  { code: '999991', name: 'PalmPay Limited' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '232', name: 'Sterling Bank' },
  { code: '035', name: 'Wema Bank / ALAT' },
];

export const WalletView: React.FC<{ onNavigateToOrders?: () => void }> = ({ onNavigateToOrders }) => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('5000');
  const [depositMethod, setDepositMethod] = useState<'card' | 'transfer'>('card');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Add Bank Form State
  const [newBankCode, setNewBankCode] = useState(NIGERIAN_BANKS[0].code);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 rounded-3xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Please log in with your student account to access your CampusCore Wallet.</p>
      </div>
    );
  }

  const wallet = StorageService.getWallet(currentUser.id);
  const transactions = StorageService.getWalletTransactions(currentUser.id);
  const bankAccounts = StorageService.getUserBankAccounts(currentUser.id);
  const settings = StorageService.getPlatformSettings();

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.reference.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    success('Reference copied to clipboard');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount < settings.minDepositAmount) {
      showError(`Minimum deposit is ₦${settings.minDepositAmount.toLocaleString()}`);
      return;
    }

    setIsProcessingDeposit(true);
    // Simulate secure Payment Gateway processing
    setTimeout(() => {
      const res = StorageService.depositFunds(currentUser.id, amount, 'paystack');
      setIsProcessingDeposit(false);
      if (res.success) {
        success(`₦${amount.toLocaleString()} successfully credited to your wallet!`);
        setShowDepositModal(false);
        setCustomAmount('5000');
      } else {
        showError(res.message || 'Deposit failed');
      }
    }, 900);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!selectedBankId && bankAccounts.length > 0) {
      setSelectedBankId(bankAccounts[0].id);
    }
    const bankIdToUse = selectedBankId || (bankAccounts[0] ? bankAccounts[0].id : '');

    if (!bankIdToUse) {
      showError('Please add or select a bank account first');
      return;
    }

    if (amount < settings.minWithdrawalAmount) {
      showError(`Minimum withdrawal is ₦${settings.minWithdrawalAmount.toLocaleString()}`);
      return;
    }

    const totalDeduction = amount + settings.withdrawalFeeFixed;
    if (wallet.availableBalance < totalDeduction) {
      showError(`Insufficient balance. Requires ₦${totalDeduction.toLocaleString()} (including ₦${settings.withdrawalFeeFixed} transfer fee)`);
      return;
    }

    setIsProcessingWithdraw(true);
    setTimeout(() => {
      const res = StorageService.requestWithdrawal(currentUser.id, amount, bankIdToUse);
      setIsProcessingWithdraw(false);
      if (res.success) {
        success(`Withdrawal of ₦${amount.toLocaleString()} processed successfully to your bank!`);
        setShowWithdrawModal(false);
      } else {
        showError(res.message || 'Withdrawal failed');
      }
    }, 1000);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setNewAccountNumber(val);
    if (val.length === 10) {
      setIsResolvingAccount(true);
      // Simulate NIBSS / Paystack Bank Account Name Resolution
      setTimeout(() => {
        setIsResolvingAccount(false);
        setResolvedAccountName((currentUser?.fullName || 'Campus Student').toUpperCase());
      }, 600);
    } else {
      setResolvedAccountName('');
    }
  };

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountNumber.length !== 10) {
      showError('Please enter a valid 10-digit NUBAN account number');
      return;
    }
    const bank = NIGERIAN_BANKS.find((b) => b.code === newBankCode);
    if (!bank) return;

    StorageService.addBankAccount(currentUser.id, {
      bankCode: bank.code,
      bankName: bank.name,
      accountNumber: newAccountNumber,
      accountName: resolvedAccountName || (currentUser?.fullName || 'Campus Student').toUpperCase(),
    });

    success('Bank account linked and verified!');
    setShowAddBankModal(false);
    setNewAccountNumber('');
    setResolvedAccountName('');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Title & Micro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            CampusCore Trust & Escrow Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Wallet & Earnings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hold escrow payments safely, receive instant payouts, and withdraw directly to your Nigerian bank.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-900 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-purple-200/50 dark:border-slate-700"
          >
            {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {hideBalances ? 'Show Balances' : 'Hide Balances'}
          </button>
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-900 text-white hover:bg-purple-800 transition-colors flex items-center gap-1.5 shadow-sm shadow-purple-950/20"
            >
              <History className="w-4 h-4 text-purple-300" />
              Escrow Orders
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Main Available Balance Bento */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#120721] via-[#220d43] to-[#361366] text-white p-6 sm:p-7 rounded-3xl shadow-xl shadow-purple-950/20 border border-purple-800/30 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <WalletIcon className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <span className="text-xs text-purple-200/80 font-medium block">Available Balance</span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ready for instant checkout or withdrawal
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-wider uppercase bg-white/10 px-2.5 py-1 rounded-full text-purple-200">
                UNIOSUN Safe Pay
              </span>
            </div>

            <div className="my-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {hideBalances ? '••••••••' : `₦${wallet.availableBalance.toLocaleString()}`}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-purple-900/40 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Fund Wallet
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Withdraw
              </button>
            </div>

            <div className="text-[11px] text-purple-200/80 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secured by 2% Campus Escrow Protection
            </div>
          </div>
        </div>

        {/* Pending Escrow & Lifetime Metrics Bento */}
        <div className="flex flex-col gap-4">
          {/* Pending Escrow Card */}
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-5 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Pending in Escrow
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-full">
                Locked
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">
                {hideBalances ? '••••••' : `₦${(wallet.pendingBalance || 0).toLocaleString()}`}
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1">
                Earnings from active orders. Automatically released to Available Balance once the student confirms delivery.
              </p>
            </div>
            {wallet.pendingBalance > 0 && onNavigateToOrders && (
              <button
                onClick={onNavigateToOrders}
                className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-950 flex items-center gap-1 mt-1 underline"
              >
                Track Orders awaiting release &rarr;
              </button>
            )}
          </div>

          {/* Quick Metrics Summary */}
          <div className="bg-purple-50/40 dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Total Funded</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {hideBalances ? '••••' : `₦${(wallet.totalDeposited || 0).toLocaleString()}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Total Withdrawn</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {hideBalances ? '••••' : `₦${(wallet.totalWithdrawn || 0).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Bank Accounts Bento Section */}
      <div className="bg-white dark:bg-slate-900 border border-purple-100/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Verified Nigerian Bank Accounts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct transfer destination for your seller proceeds and withdrawals.
            </p>
          </div>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border border-purple-200/50 dark:border-purple-800/40"
          >
            <PlusCircle className="w-4 h-4" />
            Link New Bank Account
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-purple-100 dark:border-slate-800 rounded-2xl">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No bank account linked yet</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Link your GTBank, Zenith, Kuda, or OPay account to withdraw funds anytime.</p>
            <button
              onClick={() => setShowAddBankModal(true)}
              className="mt-3 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Add Bank Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl border border-purple-100 dark:border-slate-800 bg-purple-50/30 dark:bg-slate-800/40 flex items-start justify-between relative group hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200/40 dark:border-purple-800/40">
                    {(acc.bankName || 'BK').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{acc.bankName}</span>
                      {acc.verified && (
                        <span title="NIBSS Verified">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block mt-0.5 tracking-wider">
                      {acc.accountNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium mt-0.5">
                      {acc.accountName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History & Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-purple-100/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Wallet Transaction Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete immutable record of all deposits, escrow releases, and payouts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            {['all', 'deposit', 'withdrawal', 'escrow_release', 'payment', 'refund'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors capitalize cursor-pointer ${
                  filterType === type
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/30'
                    : 'bg-purple-50 dark:bg-slate-800 text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-slate-700'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-purple-100 dark:border-slate-800 rounded-2xl">
            <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No transactions recorded</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Transactions will appear here when you fund your wallet or buy/sell campus items.</p>
          </div>
        ) : (
          <div className="divide-y divide-purple-100/60 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'escrow_release' || tx.type === 'refund';
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="py-3.5 px-2 hover:bg-purple-50/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 capitalize">
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                        <span>Ref: {tx.reference}</span>
                        <span>&bull;</span>
                        <span>{new Date(tx.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm sm:text-base font-extrabold ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {tx.provider}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: DEPOSIT FUNDS --- */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-purple-100/80 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200/40 dark:border-purple-800/40">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Fund CampusCore Wallet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Direct Paystack Checkout Simulator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Amount (NGN)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[1000, 2000, 5000, 10000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setCustomAmount(amt.toString())}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          Number(customAmount) === amt
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50/50 dark:hover:bg-slate-750'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400 dark:text-slate-500">₦</span>
                    <input
                      type="number"
                      min={settings.minDepositAmount}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter custom amount"
                      className="w-full pl-8 pr-4 py-2.5 border border-purple-200/70 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Minimum deposit: ₦{settings.minDepositAmount.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-purple-50/40 dark:bg-slate-800/60 rounded-2xl border border-purple-100/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Deposit Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₦{Number(customAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway Processing Fee:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₦0.00 (Free for Students)</span>
                  </div>
                  <div className="flex justify-between border-t border-purple-100 dark:border-slate-700 pt-1.5 font-bold text-slate-900 dark:text-white">
                    <span>Total Charged:</span>
                    <span className="text-purple-600 dark:text-purple-400">₦{Number(customAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingDeposit}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingDeposit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting Secure Paystack Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay ₦{Number(customAmount || 0).toLocaleString()} Now
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: WITHDRAW FUNDS --- */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-purple-100/80 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Withdraw to Bank</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Available: ₦{wallet.availableBalance.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No bank account linked</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">You must link a Nigerian bank account before you can withdraw.</p>
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setShowAddBankModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add Bank Account Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Destination Account</label>
                    <select
                      value={selectedBankId || bankAccounts[0]?.id}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-purple-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} - {b.accountNumber} ({b.accountName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Withdrawal Amount (NGN)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400 dark:text-slate-500">₦</span>
                      <input
                        type="number"
                        min={settings.minWithdrawalAmount}
                        max={wallet.availableBalance - settings.withdrawalFeeFixed}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2.5 border border-purple-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>Min: ₦{settings.minWithdrawalAmount.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount((wallet.availableBalance - settings.withdrawalFeeFixed).toString())}
                        className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                      >
                        Max Available
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/40 dark:bg-slate-800/60 rounded-2xl border border-purple-100/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Withdrawal Amount:</span>
                      <span className="font-bold text-slate-900 dark:text-white">₦{Number(withdrawAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Fee:</span>
                      <span className="font-bold text-slate-900 dark:text-white">₦{settings.withdrawalFeeFixed}</span>
                    </div>
                    <div className="flex justify-between border-t border-purple-100 dark:border-slate-700 pt-1.5 font-bold text-slate-900 dark:text-white">
                      <span>Total Balance Deduction:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ₦{(Number(withdrawAmount || 0) + settings.withdrawalFeeFixed).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingWithdraw}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingWithdraw ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Authorizing NIP Bank Transfer...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        Confirm Withdrawal
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ADD BANK ACCOUNT --- */}
      <AnimatePresence>
        {showAddBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-purple-100/80 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200/40 dark:border-purple-800/40">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Link Bank Account</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">NUBAN automated verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddBankModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddBankSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Bank</label>
                  <select
                    value={newBankCode}
                    onChange={(e) => setNewBankCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-purple-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">10-Digit Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newAccountNumber}
                    onChange={handleAccountNumberChange}
                    placeholder="e.g. 0234567891"
                    className="w-full px-3.5 py-2.5 border border-purple-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 tracking-wider"
                    required
                  />
                  {isResolvingAccount && (
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 mt-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Verifying account holder with NIBSS...
                    </span>
                  )}
                  {resolvedAccountName && (
                    <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{resolvedAccountName}</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-1.5 bg-purple-50/40 dark:bg-slate-800/40 p-3 rounded-xl border border-purple-100/60 dark:border-slate-800">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Account name must match your UNIOSUN student identification details to prevent payout fraud.</span>
                </div>

                <button
                  type="submit"
                  disabled={newAccountNumber.length !== 10}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-purple-900/30 cursor-pointer"
                >
                  Verify & Save Bank Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: TRANSACTION RECEIPT DETAIL --- */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-purple-100/80 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Transaction Receipt</h3>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="text-center py-4 bg-purple-50/40 dark:bg-slate-800/60 rounded-2xl border border-purple-100/60 dark:border-slate-800 mb-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Amount</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₦{selectedTx.amount.toLocaleString()}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 mt-2 inline-block">
                  {selectedTx.status}
                </span>
              </div>

              <div className="space-y-3 text-xs divide-y divide-purple-100/60 dark:divide-slate-800">
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Transaction Type</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedTx.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Description</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right max-w-[220px]">{selectedTx.description}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Reference</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white">
                    <span>{selectedTx.reference}</span>
                    <button
                      onClick={() => handleCopy(selectedTx.reference, selectedTx.id)}
                      className="p-1 hover:bg-purple-100 dark:hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                    >
                      {copiedRef === selectedTx.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Channel / Provider</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedTx.provider}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Timestamp</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(selectedTx.createdAt).toLocaleString('en-NG')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-full mt-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-900/30 transition-all"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
