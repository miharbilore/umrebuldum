'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  CheckCircle, XCircle, Clock, RefreshCw, Search, Filter,
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type TestStatus = 'SUCCESS' | 'FAIL' | 'PENDING' | 'ALL';

interface TestLog {
  id: string;
  scenarioName: string;
  status: string;
  errorMessage: string | null;
  testerName: string;
  duration: number | null;
  metadata: any;
  createdAt: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  SUCCESS: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Başarılı' },
  FAIL: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Başarısız' },
  PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Bekliyor' },
};

export default function TestManagementPanel() {
  const [statusFilter, setStatusFilter] = useState<TestStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const url = `/api/admin/test-logs?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
  const { data, error, isLoading, mutate } = useSWR<{ logs: TestLog[]; stats: { total: number; success: number; fail: number; pending: number } }>(url, fetcher, {
    refreshInterval: 15000,
  });

  const logs = data?.logs ?? [];
  const stats = data?.stats ?? { total: 0, success: 0, fail: 0, pending: 0 };

  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Toplam Test</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-emerald-400 uppercase tracking-wider">Başarılı</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.success}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-red-400 uppercase tracking-wider">Başarısız</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.fail}</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-xs text-yellow-400 uppercase tracking-wider">Başarı Oranı</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{successRate}%</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Senaryo adı veya tester ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TestStatus)}
              className="pl-10 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Tümü</option>
              <option value="SUCCESS">Başarılı</option>
              <option value="FAIL">Başarısız</option>
              <option value="PENDING">Bekliyor</option>
            </select>
          </div>
          <button
            onClick={() => mutate()}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-3 py-12 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Veriler yüklenirken hata oluştu</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300">Henüz test kaydı yok</h3>
          <p className="text-gray-500 mt-2">Test çalıştırıldığında sonuçlar burada görünecek.</p>
        </div>
      ) : (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Senaryo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Tester</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Süre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => {
                const config = statusConfig[log.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                const isExpanded = expandedRow === log.id;

                return (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-200 font-medium">{log.scenarioName}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-400">{log.testerName}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-400">
                          {log.duration ? `${log.duration}ms` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString('tr-TR', { 
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={6} className="px-6 py-4 bg-gray-800/20">
                          <div className="space-y-2">
                            {log.errorMessage && (
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                                <p className="text-xs text-red-400 font-medium mb-1">Hata Mesajı:</p>
                                <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{log.errorMessage}</pre>
                              </div>
                            )}
                            {log.metadata && (
                              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                                <p className="text-xs text-gray-400 font-medium mb-1">Metadata:</p>
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>ID: {log.id}</span>
                              <span>Tester: {log.testerName}</span>
                              {log.duration && <span>Süre: {log.duration}ms</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
