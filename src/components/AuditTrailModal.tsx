import React, { useEffect, useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Lock, 
  RefreshCw,
  User,
  CheckCircle2
} from 'lucide-react';
import { fetchUserAuditLogs, AuditLogItem } from '../firebase';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchUserAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Enterprise Security & Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Firestore-persisted tamper-evident log of operational changes & access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Querying Firestore auditLogs collection...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit logs recorded in this session yet. Perform pipeline steps or log in to generate entries.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      by {log.userEmail}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {log.details}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by Firestore Security Rules (Immutable & Append-Only)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
