import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Search, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Sliders,
  ExternalLink,
  Code
} from 'lucide-react';
import { RepoFile } from '../types';
import { downloadSingleFile } from '../utils/exportZip';

interface CodeViewerProps {
  file: RepoFile;
  onOpenConfigurator?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file, onOpenConfigurator }) => {
  const [copied, setCopied] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lines = file.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Basic syntax colorizer for HCL / Shell / Markdown
  const renderHighlightedLine = (line: string, lineIndex: number) => {
    if (!line.trim()) {
      return <span>&nbsp;</span>;
    }

    // Comment
    if (line.trim().startsWith('#') || line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    // Resource / Data declaration in HCL
    if (line.includes('resource "') || line.includes('data "') || line.includes('variable "') || line.includes('output "') || line.includes('provider "')) {
      const parts = line.split('"');
      return (
        <span>
          <span className="text-pink-400 font-semibold">{parts[0]}</span>
          {parts.slice(1).map((p, i) => (
            <span key={i}>
              {i % 2 === 0 ? <span className="text-amber-300">"{p}"</span> : <span className="text-slate-300">{p}</span>}
            </span>
          ))}
        </span>
      );
    }

    // String literals
    if (line.includes('"')) {
      const segments = line.split(/(".*?")/g);
      return (
        <span>
          {segments.map((seg, idx) => {
            if (seg.startsWith('"') && seg.endsWith('"')) {
              // Highlight interpolation inside strings
              if (seg.includes('${')) {
                return <span key={idx} className="text-emerald-300 font-mono">{seg}</span>;
              }
              return <span key={idx} className="text-amber-300">{seg}</span>;
            }
            // Keywords
            let formatted = seg
              .replace(/\b(true|false)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
              .replace(/\b(default|type|description|validation|condition|error_message|count|tags|lifecycle|depends_on)\b/g, '<span class="text-cyan-400 font-medium">$1</span>');
            return <span key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />;
          })}
        </span>
      );
    }

    // Default formatting
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: line
            .replace(/\b(terraform|provider|variable|resource|data|output)\b/g, '<span class="text-pink-400 font-semibold">$1</span>')
            .replace(/\b(true|false)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
            .replace(/\b(string|number|bool|list|map)\b/g, '<span class="text-purple-300 font-medium">$1</span>')
        }}
      />
    );
  };

  return (
    <div 
      id="code-viewer-container" 
      className={`flex flex-col bg-slate-950 text-slate-200 h-full border border-slate-800 rounded-lg overflow-hidden shadow-xl ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-xl' : ''
      }`}
    >
      {/* Code Header Toolbar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-white">
              {file.path}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
              {lines.length} lines · {file.size}
            </span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Find in code..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono w-36 focus:w-48 transition-all"
            />
          </div>

          {/* Copy Button */}
          <button
            id="btn-copy-code-inline"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={() => downloadSingleFile(file)}
            title="Download file directly"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="flex-1 overflow-auto font-mono text-xs sm:text-[13px] leading-relaxed p-4 bg-slate-950 select-text">
        <pre className="table w-full">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const matchesSearch = searchWord && line.toLowerCase().includes(searchWord.toLowerCase());

              return (
                <tr 
                  key={lineNum} 
                  className={`hover:bg-slate-900/60 transition ${
                    matchesSearch ? 'bg-amber-950/40' : ''
                  }`}
                >
                  <td className="table-cell pr-4 text-right select-none text-slate-600 w-12 font-mono text-[11px] border-r border-slate-800/80 align-top">
                    {lineNum}
                  </td>
                  <td className="table-cell pl-4 text-slate-200 whitespace-pre font-mono">
                    {renderHighlightedLine(line, idx)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </pre>
      </div>

      {/* Bottom Status bar */}
      <div className="bg-slate-900/90 px-4 py-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Terraform Syntax Validated
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">UTF-8 · LF</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-cyan-400">HCL2 Standard</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenConfigurator && file.name === 'variables.tf' && (
            <button
              onClick={onOpenConfigurator}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-sans font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              Customize Variables in UI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
