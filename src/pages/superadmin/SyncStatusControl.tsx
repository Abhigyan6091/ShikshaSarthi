import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, CloudOff, CloudCog, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface AwsSyncStatus {
  enabled?: boolean;
  configured?: boolean;
  inProgress?: boolean;
  missingEnv?: string[];
  scope?: string;
  schoolId?: string;
  controlApiUrl?: string | null;
  pendingRecords?: number | null;
  lastRunAt?: string | null;
  lastSuccessAt?: string | null;
  lastError?: string | null;
  lastMerge?: {
    pendingRecords?: number;
    acceptedRecords?: number;
    downloadedRecords?: number;
    appliedInserted?: number;
    appliedUpdated?: number;
  } | null;
}

const fmt = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

// Superadmin-only panel to see whether cross-instance cloud sync (question bank,
// credentials, deletions) is actually working, and to trigger it on demand.
const SyncStatusControl: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<AwsSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sync/aws-status`);
      const data = await res.json();
      setStatus(data);
    } catch (_error) {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const timer = setInterval(loadStatus, 15000);
    return () => clearInterval(timer);
  }, [loadStatus]);

  const runSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/sync/aws-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const data = await res.json();
      if (data.ok) {
        const s = data.sync?.summary || {};
        toast({
          title: 'Sync completed',
          description: `Uploaded ${s.acceptedRecords ?? 0}, downloaded ${s.downloadedRecords ?? 0} (inserted ${s.appliedInserted ?? 0}, updated ${s.appliedUpdated ?? 0}).`,
        });
      } else {
        toast({
          title: 'Sync did not complete',
          description: data.reason || data.error || 'Cloud sync is disabled or unreachable.',
          variant: 'destructive',
        });
      }
      await loadStatus();
    } catch (error: any) {
      toast({ title: 'Sync failed', description: error?.message || 'Network error', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const enabled = Boolean(status?.enabled);
  const configured = Boolean(status?.configured);
  const healthy = enabled && configured;
  const pending = status?.pendingRecords ?? null;

  let statusIcon = <CloudOff className="h-5 w-5 text-gray-400" />;
  let statusText = 'Cloud sync disabled';
  let statusColor = 'text-gray-500';
  if (healthy) {
    statusIcon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
    statusText = 'Cloud sync active';
    statusColor = 'text-green-600';
  } else if (enabled && !configured) {
    statusIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
    statusText = 'Enabled but not configured';
    statusColor = 'text-amber-600';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CloudCog className="h-6 w-6 text-blue-600" />
            <CardTitle>Cloud Sync</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={runSyncNow} disabled={syncing || !healthy}>
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
        </div>
        <CardDescription>
          Question bank, credentials and deletions replicate across schools through AWS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading ? (
          <p className="text-gray-500">Loading sync status…</p>
        ) : (
          <>
            <div className="flex items-center gap-2 font-medium">
              {statusIcon}
              <span className={statusColor}>{statusText}</span>
              {status?.inProgress && <span className="text-xs text-blue-500">(running…)</span>}
            </div>

            {enabled && !configured && status?.missingEnv?.length ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-amber-700 text-xs">
                Missing configuration: <strong>{status.missingEnv.join(', ')}</strong>. Set these in the
                school server environment for sync to work.
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
              <span>Scope</span><span className="text-gray-900">{status?.scope || '—'}</span>
              <span>School ID</span><span className="text-gray-900">{status?.schoolId || '—'}</span>
              <span>Pending upload</span>
              <span className={pending && pending > 0 ? 'text-amber-600 font-medium' : 'text-gray-900'}>
                {pending == null ? '—' : pending}
              </span>
              <span>Last run</span><span className="text-gray-900">{fmt(status?.lastRunAt)}</span>
              <span>Last success</span><span className="text-gray-900">{fmt(status?.lastSuccessAt)}</span>
            </div>

            {status?.lastError ? (
              <div className="rounded-md bg-red-50 border border-red-200 p-2 text-red-700 text-xs break-words">
                Last error: {status.lastError}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncStatusControl;
