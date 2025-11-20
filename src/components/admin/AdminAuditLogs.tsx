'use client';

import { useState, useEffect } from 'react';
import { Shield, Filter, Clock, User, FileText } from 'lucide-react';
import { NeuralButton } from '@/components/ui/neural-button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  details: any;
  created_at: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetTypeFilter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (targetTypeFilter !== 'all') params.append('target_type', targetTypeFilter);

      const response = await fetch(`/api/admin/audit-logs?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      role_change: 'bg-blue-100 text-blue-800 border-blue-200',
      status_change: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      deleted_user: 'bg-red-100 text-red-800 border-red-200',
      approved_faculty: 'bg-green-100 text-green-800 border-green-200',
      declined_faculty: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return variants[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTargetTypeBadge = (targetType: string | null) => {
    if (!targetType) return 'bg-gray-100 text-gray-800 border-gray-200';
    const variants: Record<string, string> = {
      user: 'bg-purple-100 text-purple-800 border-purple-200',
      course: 'bg-blue-100 text-blue-800 border-blue-200',
      module: 'bg-green-100 text-green-800 border-green-200',
    };
    return variants[targetType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 mt-2">Track all administrative actions and system changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-4 border border-synapse-500/20">
          <div className="text-gray-400 text-sm mb-1">Total Actions</div>
          <div className="text-2xl font-bold text-white">{totalCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setActionFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-neural-900/50 border-synapse-500/30 text-white">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="role_change">Role Change</SelectItem>
              <SelectItem value="status_change">Status Change</SelectItem>
              <SelectItem value="deleted_user">User Deleted</SelectItem>
              <SelectItem value="approved_faculty">Faculty Approved</SelectItem>
              <SelectItem value="declined_faculty">Faculty Declined</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={targetTypeFilter}
            onValueChange={(value) => {
              setTargetTypeFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-neural-900/50 border-synapse-500/30 text-white">
              <SelectValue placeholder="Filter by target type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="module">Module</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl border border-synapse-500/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No audit logs found</div>
        ) : (
          <>
            <div className="divide-y divide-synapse-500/10">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-neural-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-synapse-500/10 rounded-lg">
                        <Shield className="w-5 h-5 text-synapse-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActionBadge(log.action)}>{log.action}</Badge>
                          {log.target_type && (
                            <Badge className={getTargetTypeBadge(log.target_type)}>
                              {log.target_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{log.admin.name}</span>
                          <span className="text-gray-600">•</span>
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(log.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {log.reason && (
                    <div className="ml-14 mb-3">
                      <div className="text-gray-400 text-sm mb-1">Reason:</div>
                      <div className="text-gray-300 text-sm">{log.reason}</div>
                    </div>
                  )}

                  {log.details && (
                    <div className="ml-14">
                      <details className="group">
                        <summary className="flex items-center space-x-2 text-synapse-400 text-sm cursor-pointer hover:text-synapse-300 transition-colors">
                          <FileText className="w-4 h-4" />
                          <span>View Details</span>
                        </summary>
                        <pre className="mt-2 p-3 bg-neural-900/50 rounded-lg text-xs text-gray-300 overflow-x-auto border border-synapse-500/10">
                          {formatDetails(log.details)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-synapse-500/20">
                <div className="text-gray-400 text-sm">
                  Page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <NeuralButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </NeuralButton>
                  <NeuralButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </NeuralButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
