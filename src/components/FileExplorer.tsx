import React, { useState } from 'react';
import { 
  FileText, 
  Box, 
  Sliders, 
  ArrowUpRight, 
  FileCode, 
  ShieldCheck, 
  Search, 
  Download, 
  Copy, 
  Check, 
  FolderTree,
  FileCheck2,
  Lock
} from 'lucide-react';
import { RepoFile, FileKey } from '../types';
import { downloadSingleFile } from '../utils/exportZip';

interface FileExplorerProps {
  files: RepoFile[];
  selectedFileId: FileKey;
  onSelectFile: (fileId: FileKey) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFileId,
  onSelectFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'file-text':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'box':
        return <Box className="w-4 h-4 text-emerald-400" />;
      case 'sliders':
        return <Sliders className="w-4 h-4 text-indigo-400" />;
      case 'arrow-up-right':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case 'file-code':
        return <FileCode className="w-4 h-4 text-slate-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (e: React.MouseEvent, file: RepoFile) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.content);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (e: React.MouseEvent, file: RepoFile) => {
    e.stopPropagation();
    downloadSingleFile(file);
  };

  return (
    <div id="file-explorer-panel" className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>REPOSITORY FILES</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">
            {files.length}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
          <Lock className="w-2.5 h-2.5" />
          Zero-Trust
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            id="search-repo-files"
            type="text"
            placeholder="Filter files (e.g. main.tf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
          />
        </div>
      </div>

      {/* Primary Files Section Notice */}
      <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
        <span>Core Infrastructure Files</span>
        <span className="text-emerald-400">3 Requested</span>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredFiles.map((file) => {
          const isSelected = selectedFileId === file.id;
          const isCore = ['README.md', 'main.tf', 'variables.tf'].includes(file.name);

          return (
            <div
              key={file.id}
              id={`file-item-${file.id.replace('.', '-')}`}
              onClick={() => onSelectFile(file.id)}
              className={`group flex flex-col p-2.5 rounded-lg border transition text-left cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/80 text-white shadow-sm'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getIcon(file.icon)}
                  <span className="font-mono text-xs font-medium truncate">
                    {file.name}
                  </span>
                  {isCore && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded border border-emerald-500/30 shrink-0">
                      CORE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => handleCopy(e, file)}
                    title={`Copy ${file.name}`}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDownload(e, file)}
                    title={`Download ${file.name}`}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {file.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1.5 border-t border-slate-800/50">
                <span className="uppercase">{file.language}</span>
                <span>{file.size}</span>
              </div>
            </div>
          );
        })}

        {filteredFiles.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No files matched "{searchQuery}"
          </div>
        )}
      </div>

      {/* Footer / Architecture Spec Badge */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>Target Standard:</span>
          <span className="text-emerald-400">IEC 62443 / NIST</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Public Gateways:</span>
          <span className="text-red-400 font-bold">0 (Blocked)</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>PrivateLink Endpoints:</span>
          <span className="text-cyan-400 font-bold">5 Active</span>
        </div>
      </div>
    </div>
  );
};
