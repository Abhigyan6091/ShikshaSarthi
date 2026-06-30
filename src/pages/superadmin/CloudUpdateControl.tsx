import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Cloud, Download, RefreshCw, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL;

const CloudUpdateControl: React.FC = () => {
  const { toast } = useToast();
  const [cloudStatus, setCloudStatus] = useState<any>(null);
  const [versionStatus, setVersionStatus] = useState<any>(null);
  const [updateState, setUpdateState] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchCloudStatus = async () => {
    try {
      setBusy('status');
      const response = await axios.get(`${API_URL}/api/aws/status`);
      setCloudStatus(response.data);
    } catch (error: any) {
      setCloudStatus({ enabled: false, reachable: false, lastError: error.message });
    } finally {
      setBusy(null);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/aws/sync/status`);
      setSyncStatus(response.data);
    } catch (error: any) {
      setSyncStatus({ enabled: false, lastError: error.message });
    }
  };

  const syncNow = async () => {
    try {
      setBusy('sync-run');
      const response = await axios.post(`${API_URL}/api/aws/sync/run`, { trigger: 'dashboard' });
      const merge = response.data?.sync?.summary;
      toast({
        title: response.data?.ok ? 'Sync complete' : 'Sync finished',
        description: merge
          ? `Uploaded ${merge.acceptedRecords ?? 0}, downloaded ${merge.downloadedRecords ?? 0} records.`
          : response.data?.error || 'Sync cycle ran.',
        variant: response.data?.ok === false ? 'destructive' : undefined,
      });
      await fetchSyncStatus();
    } catch (error: any) {
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const downloadAndInstall = async () => {
    try {
      setBusy('install');
      toast({ title: 'Downloading update…', description: 'Fetching the latest installer. Please wait.' });
      const download = await axios.post(`${API_URL}/api/update/download-installer`);
      if (!download.data?.ok || !download.data?.filePath) {
        toast({ title: 'Download failed', description: download.data?.error || 'Could not download the installer.', variant: 'destructive' });
        return;
      }
      const install = await axios.post(`${API_URL}/api/update/install-now`, { filePath: download.data.filePath });
      toast({
        title: install.data?.launched ? 'Installer started' : 'Installer ready',
        description: install.data?.message || 'Follow the installer to finish updating. Your data is preserved.',
      });
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const fetchUpdateStatus = async () => {
    try {
      setBusy('version');
      const [checkResponse, stateResponse] = await Promise.all([
        axios.get(`${API_URL}/api/update/check`),
        axios.get(`${API_URL}/api/update/state`),
      ]);
      setVersionStatus(checkResponse.data);
      setUpdateState(stateResponse.data);
    } catch (error: any) {
      setVersionStatus({ updateAvailable: false, lastError: error.message });
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    fetchCloudStatus();
    fetchUpdateStatus();
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const postAction = async (key: string, url: string, success: string) => {
    try {
      setBusy(key);
      const response = await axios.post(url);
      toast({
        title: response.data?.ok || response.data?.uploaded || response.data?.verified ? success : 'Request completed',
        description: response.data?.backup?.fileName || response.data?.filePath || response.data?.lastError || response.data?.message || 'Cloud request finished.',
      });
      await fetchCloudStatus();
      await fetchUpdateStatus();
    } catch (error: any) {
      toast({ title: 'Cloud action failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="mb-8 border-sky-200">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-600" />
              Cloud & Update Control
            </CardTitle>
            <CardDescription>AWS control plane status for this local school server</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={fetchCloudStatus} disabled={busy === 'status'}>
              <RefreshCw className="h-4 w-4 mr-2" /> Check AWS Status
            </Button>
            <Button size="sm" variant="outline" onClick={() => postAction('heartbeat', `${API_URL}/api/aws/heartbeat`, 'Heartbeat sent')} disabled={busy === 'heartbeat'}>
              <Activity className="h-4 w-4 mr-2" /> Send Heartbeat
            </Button>
            <Button size="sm" variant="outline" onClick={fetchUpdateStatus} disabled={busy === 'version'}>
              <RefreshCw className="h-4 w-4 mr-2" /> Check Latest Version
            </Button>
            <Button size="sm" variant="outline" onClick={() => postAction('backup', `${API_URL}/api/aws/backup/upload-latest`, 'Backup uploaded')} disabled={busy === 'backup'}>
              <Upload className="h-4 w-4 mr-2" /> Upload Latest Backup
            </Button>
            <Button size="sm" variant="outline" onClick={syncNow} disabled={busy === 'sync-run'}>
              <RefreshCw className={`h-4 w-4 mr-2 ${busy === 'sync-run' || syncStatus?.inProgress ? 'animate-spin' : ''}`} /> Sync Now
            </Button>
            <Button size="sm" variant="outline" onClick={() => postAction('sync', `${API_URL}/api/aws/sync/manual`, 'Manual sync uploaded')} disabled={busy === 'sync'}>
              <Upload className="h-4 w-4 mr-2" /> Manual Sync
            </Button>
            <Button size="sm" onClick={downloadAndInstall} disabled={busy === 'install'}>
              <Download className="h-4 w-4 mr-2" /> {busy === 'install' ? 'Updating…' : 'Download & Install Update'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => postAction('rollback', `${API_URL}/api/update/rollback`, 'Rollback checked')} disabled={busy === 'rollback'}>
              <RotateCcw className="h-4 w-4 mr-2" /> Rollback
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">AWS Status</p>
            <p className={`mt-1 text-lg font-bold ${cloudStatus?.enabled ? 'text-sky-700' : 'text-gray-500'}`}>
              {cloudStatus?.enabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className={`text-sm ${cloudStatus?.reachable ? 'text-green-600' : 'text-amber-600'}`}>
              {cloudStatus?.reachable ? 'Reachable' : 'Unreachable or offline'}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">School ID</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{cloudStatus?.schoolId || 'SCHOOL001'}</p>
            <p className="text-sm text-gray-500">
              Last check: {cloudStatus?.lastCheckedAt ? new Date(cloudStatus.lastCheckedAt).toLocaleString() : 'Not checked'}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">Current Version</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{versionStatus?.currentVersion || '1.0.0'}</p>
            <p className="text-sm text-gray-600">Latest: {versionStatus?.latestVersion || 'Unknown'}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">Update</p>
            <p className={`mt-1 text-lg font-bold ${versionStatus?.updateAvailable ? 'text-amber-600' : 'text-green-600'}`}>
              {versionStatus?.updateAvailable ? 'Available' : 'Current'}
            </p>
            <p className="text-sm text-gray-500">{updateState?.install?.status || (versionStatus?.mandatory ? 'Mandatory update' : 'Optional when available')}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">Data Sync</p>
            <p className={`mt-1 text-lg font-bold ${syncStatus?.inProgress ? 'text-amber-600' : syncStatus?.enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {syncStatus?.inProgress ? 'Syncing…' : syncStatus?.enabled ? 'Idle' : 'Disabled'}
            </p>
            <p className="text-sm text-gray-500">Auto every {Math.round((syncStatus?.intervalMs || 60000) / 1000)}s</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">Last Successful Sync</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {syncStatus?.lastSuccessAt ? new Date(syncStatus.lastSuccessAt).toLocaleString() : 'Never'}
            </p>
            <p className="text-sm text-gray-500">
              {syncStatus?.lastError ? <span className="text-amber-600">{syncStatus.lastError}</span> : 'Up to date'}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">Records Synced</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              ↑ {syncStatus?.lastMerge?.acceptedRecords ?? 0} &nbsp; ↓ {syncStatus?.lastMerge?.downloadedRecords ?? 0}
            </p>
            <p className="text-sm text-gray-500">
              Applied: {(syncStatus?.lastMerge?.appliedInserted ?? 0) + (syncStatus?.lastMerge?.appliedUpdated ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500 font-medium">School / Node</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{syncStatus?.schoolId || cloudStatus?.schoolId || 'SCHOOL001'}</p>
            <p className="text-sm text-gray-500">{syncStatus?.nodeId || '—'}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-gray-50 p-3">Backup sync: <strong>{cloudStatus?.features?.backupSync ? 'Enabled' : 'Disabled'}</strong></div>
          <div className="rounded-md bg-gray-50 p-3">Video sync: <strong>{cloudStatus?.features?.videoSync ? 'Enabled' : 'Disabled'}</strong></div>
          <div className="rounded-md bg-gray-50 p-3">Update check: <strong>{cloudStatus?.features?.updateCheck ? 'Enabled' : 'Disabled'}</strong></div>
        </div>
        {(cloudStatus?.lastError || versionStatus?.lastError) && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
            {cloudStatus?.lastError || versionStatus?.lastError}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CloudUpdateControl;
