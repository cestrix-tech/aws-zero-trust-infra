import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  FileCode, 
  Award,
  Lock,
  Search
} from 'lucide-react';
import { COMPLIANCE_CHECKS } from '../data/complianceChecks';
import { ComplianceCheck } from '../types';

export const ComplianceAuditor: React.FC = () => {
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const frameworks = ['all', 'IEC 62443-3-3', 'NIST SP 800-82r3', 'CIS AWS v3.0', 'Cestrix Enterprise SecOps'];

  const filtered = COMPLIANCE_CHECKS.filter((item) => {
    const matchesFw = filterFramework === 'all' || item.framework === filterFramework;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFw && matchesSearch;
  });

  return (
    <div id="compliance-auditor-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-5xl mx-auto space-y-6 text-white">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 p-6 rounded-xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-mono text-white">
                Zero-Trust Compliance Score
              </h2>
              <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                100% AIR-GAPPED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Automated validation against Industrial Security (IEC 62443) and Cloud Security (CIS Benchmark v3.0)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-center shrink-0">
          <div>
            <div className="text-2xl font-bold text-emerald-400">7 / 7</div>
            <div className="text-[10px] uppercase text-slate-400">Passed Controls</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">0</div>
            <div className="text-[10px] uppercase text-slate-400">Internet Vectors</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-2xl font-bold text-amber-400">A+</div>
            <div className="text-[10px] uppercase text-slate-400">SecOps Rating</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {frameworks.map((fw) => (
            <button
              key={fw}
              onClick={() => setFilterFramework(fw)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                filterFramework === fw
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {fw === 'all' ? 'All Frameworks (7)' : fw}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search security controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Compliance Controls List */}
      <div className="space-y-3">
        {filtered.map((check) => (
          <div
            key={check.id}
            className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2.5 hover:border-slate-700 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-1 rounded">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {check.title}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                  {check.framework}
                </span>
                <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                  {check.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pl-7">
              {check.description}
            </p>

            <div className="pl-7 pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono border-t border-slate-800/60 mt-2">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{check.remediation}</span>
              </div>
              <div className="text-slate-500 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Reference: <code>{check.hclReference}</code></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
