import React from 'react';
import { 
  ShieldCheck, 
  Download, 
  Terminal, 
  GitFork, 
  Star, 
  Sparkles, 
  Sliders, 
  Layers, 
  FileText, 
  Code2, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ActiveTab, RepoFile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDownloadZip: () => void;
  onOpenCliModal: () => void;
  selectedFile: RepoFile;
  onCopyContent: () => void;
  copied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  onOpenCliModal,
  selectedFile,
  onCopyContent,
  copied
}) => {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Notice / Enterprise Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 px-4 py-1.5 text-xs text-emerald-300 border-b border-emerald-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-medium text-[11px] border border-emerald-500/30">
            <Lock className="w-3 h-3 text-emerald-400" />
            AIR-GAPPED VERIFIED
          </span>
          <span className="hidden sm:inline text-slate-300 font-normal">
            Cestrix Group Heavy Industries · Mission-Critical SCADA Infrastructure Boilerplate
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Zero Ingress / Zero Egress
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">IEC 62443-3-3 Compliant</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Repo Title and Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400 font-medium">cestrix-group</span>
              <span className="text-slate-600">/</span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                aws-zero-trust-infra
                <span className="text-[11px] font-sans font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Public
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              Strictly air-gapped AWS Terraform templates for mission-critical industrial serverless environments
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-cli-guide"
            onClick={onOpenCliModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="View CLI Deployment Commands"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>CLI Quickstart</span>
          </button>

          <button
            id="btn-copy-active-file"
            onClick={onCopyContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title={`Copy content of ${selectedFile.name}`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy {selectedFile.name}</span>
              </>
            )}
          </button>

          <button
            id="btn-download-zip"
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Download full repository as ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-1">
        <button
          id="tab-btn-editor"
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'editor'
              ? 'border-emerald-500 text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Code Explorer ({selectedFile.name})</span>
        </button>

        <button
          id="tab-btn-preview"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'preview'
              ? 'border-emerald-500 text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>README Live Preview</span>
        </button>

        <button
          id="tab-btn-diagram"
          onClick={() => setActiveTab('diagram')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'diagram'
              ? 'border-emerald-500 text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Air-Gapped Architecture Diagram</span>
        </button>

        <button
          id="tab-btn-configurator"
          onClick={() => setActiveTab('configurator')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'configurator'
              ? 'border-emerald-500 text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Interactive Variable Generator</span>
        </button>

        <button
          id="tab-btn-compliance"
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-emerald-500 text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>IEC / CIS Security Audit (7/7 Passed)</span>
        </button>
      </div>
    </header>
  );
};
