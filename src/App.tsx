import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';
import { ReadmeViewer } from './components/ReadmeViewer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { Configurator } from './components/Configurator';
import { ComplianceAuditor } from './components/ComplianceAuditor';
import { CliQuickStartModal } from './components/CliQuickStartModal';
import { ActiveTab, FileKey, InfraConfig } from './types';
import { DEFAULT_CONFIG, getRepoFiles } from './data/repoFiles';
import { exportRepoAsZip } from './utils/exportZip';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [selectedFileId, setSelectedFileId] = useState<FileKey>('main.tf');
  const [config, setConfig] = useState<InfraConfig>(DEFAULT_CONFIG);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [copiedActive, setCopiedActive] = useState(false);

  // Generate dynamic repository files whenever config changes
  const repoFiles = useMemo(() => getRepoFiles(config), [config]);

  const selectedFile = useMemo(() => {
    return repoFiles.find(f => f.id === selectedFileId) || repoFiles[0];
  }, [repoFiles, selectedFileId]);

  const handleDownloadZip = () => {
    exportRepoAsZip(repoFiles, 'aws-zero-trust-infra');
  };

  const handleCopyActiveContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedActive(true);
    setTimeout(() => setCopiedActive(false), 2000);
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        onOpenCliModal={() => setIsCliModalOpen(true)}
        selectedFile={selectedFile}
        onCopyContent={handleCopyActiveContent}
        copied={copiedActive}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-105px)] overflow-hidden">
            <FileExplorer
              files={repoFiles}
              selectedFileId={selectedFileId}
              onSelectFile={(id) => {
                setSelectedFileId(id);
                if (id === 'README.md') {
                  // Keep on editor or let user choose preview
                }
              }}
            />
            <div className="flex-1 p-3 sm:p-4 overflow-hidden h-full">
              <CodeViewer
                file={selectedFile}
                onOpenConfigurator={() => setActiveTab('configurator')}
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-105px)]">
            <ReadmeViewer config={config} />
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-105px)]">
            <ArchitectureDiagram config={config} />
          </div>
        )}

        {activeTab === 'configurator' && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-105px)]">
            <Configurator
              config={config}
              onChangeConfig={setConfig}
              onResetDefault={handleResetConfig}
              onViewGeneratedCode={() => setActiveTab('editor')}
            />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-105px)]">
            <ComplianceAuditor />
          </div>
        )}
      </main>

      {/* CLI Quickstart Modal */}
      <CliQuickStartModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        config={config}
      />
    </div>
  );
}
