import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '@/lib/api';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Zap,
  Server,
  Layers,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface AwsIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AwsIntegrationModal({ open, onOpenChange }: AwsIntegrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  const fetchStatusAndRecords = async () => {
    setLoading(true);
    try {
      const [st, rec] = await Promise.all([
        api.getAwsStatus(),
        api.getAwsRecords(),
      ]);
      setStatus(st);
      if (rec?.records) {
        setRecords(rec.records);
      }
    } catch (e) {
      console.warn('Failed to fetch AWS status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatusAndRecords();
    }
  }, [open]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testAwsConnection();
      setTestResult(res);
      fetchStatusAndRecords();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.syncAwsData();
      setSyncResult(res);
      fetchStatusAndRecords();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Sync failed',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-950/40 shrink-0">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-lg sm:text-xl font-bold text-white">
                  Amazon DynamoDB
                </h3>
                <Badge variant="teal" className="text-[10px] uppercase font-bold py-0.5">
                  Always-Free Tier
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AWS NoSQL Database Integration for Shiksha Mitra AI
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Free Tier Service</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              25 GB Storage · 25 WCU/RCU Free Forever
            </span>
          </div>
        </div>

        {/* Why this matches hackathon requirements card */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Why Amazon DynamoDB is the Perfect Free AWS Database for this Hackathon:
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Unlike AWS RDS (which expires after 12 months and incurs charges), <strong>Amazon DynamoDB has an Always-Free Tier</strong> with 25 GB storage and 200 million requests/month. It stores student profiles, mock exam attempts, and Socratic chat histories with ultra-fast millisecond latency.
            </p>
          </div>
        </div>

        {/* Status & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              AWS Engine Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white truncate">
                {status?.mode || 'Active (Free Tier)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              AWS Region
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {status?.region || 'us-east-1'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Table Name
            </span>
            <span className="text-xs font-bold text-cyan-300 font-mono truncate block">
              {status?.tableName || 'ShikshaMitra-Records'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Stored Items
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {records.length} Documents
            </span>
          </div>
        </div>

        {/* Actions: Live Test & Sync */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-left w-full sm:w-auto">
            <h4 className="text-xs font-bold text-slate-200">
              Live AWS Operations & Verification
            </h4>
            <p className="text-[11px] text-slate-400">
              Test roundtrip latency or sync current session data to DynamoDB.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="text-xs gap-1.5"
            >
              <Activity className={`w-3.5 h-3.5 text-cyan-400 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Read/Write'}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              glow
              onClick={handleSyncAll}
              disabled={syncing}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Student Data'}</span>
            </Button>
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in-0 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testResult.message}</span>
            </div>
            {testResult.latencyMs !== undefined && (
              <span className="font-mono text-[11px] font-bold text-emerald-400 shrink-0">
                {testResult.latencyMs} ms latency
              </span>
            )}
          </div>
        )}

        {syncResult && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between gap-3">
            <span>{syncResult.message}</span>
            <span className="font-mono text-[11px] font-bold text-cyan-400">
              {syncResult.syncedCount} items saved
            </span>
          </div>
        )}

        {/* Live DynamoDB Documents Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Live DynamoDB Document Store</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Partition Key (PK) & Sort Key (SK) Schema
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {records.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-amber-500/30 transition-all font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{rec.PK}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-cyan-300 font-medium">{rec.SK}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md font-sans">
                    {JSON.stringify(rec.data).slice(0, 85)}...
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] py-0 px-2 uppercase">
                    {rec.recordType || 'Record'}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    {new Date(rec.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials Setup Info for Hackathon submission */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              To connect your own AWS account, simply define <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code> in <code>.env</code>.
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase shrink-0">
            Ready for Submission
          </span>
        </div>
      </div>
    </Dialog>
  );
}
