import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Ban, 
  Lock, 
  Network, 
  Database, 
  HardDrive, 
  KeyRound, 
  FileText, 
  Cpu, 
  Sparkles, 
  Play, 
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Server
} from 'lucide-react';
import { InfraConfig } from '../types';

interface ArchitectureDiagramProps {
  config: InfraConfig;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ config }) => {
  const [simulationState, setSimulationState] = useState<'idle' | 'encrypting' | 'routing' | 'persisting' | 'completed'>('idle');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const startSimulation = () => {
    setSimulationState('encrypting');
    setTimeout(() => {
      setSimulationState('routing');
      setTimeout(() => {
        setSimulationState('persisting');
        setTimeout(() => {
          setSimulationState('completed');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const resetSimulation = () => {
    setSimulationState('idle');
  };

  return (
    <div id="architecture-diagram-view" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 max-w-5xl mx-auto text-white">
      {/* Top Controls & Simulation Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono flex items-center gap-2 text-white">
            <Network className="w-5 h-5 text-emerald-400" />
            Air-Gapped Zero-Trust Network Topology
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            VPC CIDR: {config.vpcCidr} · Region: {config.awsRegion} · Standard: {config.complianceStandard}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulationState === 'idle' || simulationState === 'completed' ? (
            <button
              id="btn-simulate-scada-flow"
              onClick={startSimulation}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate SCADA Telemetry Stream</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulation Banner */}
      {simulationState !== 'idle' && (
        <div className="bg-slate-950 border border-emerald-500/50 p-3 rounded-lg flex items-center justify-between gap-4 font-mono text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">
              {simulationState === 'encrypting' && 'Stage 1: SCADA sensor event received -> Authenticating via STS & Encrypting payload with KMS CMK...'}
              {simulationState === 'routing' && 'Stage 2: Transmitting encrypted frame across AWS PrivateLink (Zero Internet Exposure)...'}
              {simulationState === 'persisting' && 'Stage 3: Persisting immutable audit event in DynamoDB & S3 via Gateway VPC Endpoints...'}
              {simulationState === 'completed' && 'Telemetry ingestion complete! Zero packet exposure to public internet.'}
            </span>
          </div>
          <span className="text-emerald-400 font-bold uppercase text-[11px] shrink-0">
            {simulationState}
          </span>
        </div>
      )}

      {/* Outer AWS Boundary Canvas */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-xl p-6 overflow-hidden">
        {/* Region Watermark */}
        <div className="absolute top-3 left-4 text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>AWS Region: {config.awsRegion}</span>
        </div>

        {/* Public Internet Blocked Boundary (Top Right) */}
        <div className="absolute top-3 right-4 bg-red-950/80 border border-red-800/80 text-red-300 px-3 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 shadow-md">
          <Ban className="w-3.5 h-3.5 text-red-400" />
          <span>Internet Gateway: OMITTED (0.0.0.0/0 Blocked)</span>
        </div>

        {/* Main VPC Boundary Box */}
        <div className="mt-8 border-2 border-dashed border-emerald-500/40 rounded-xl p-6 bg-slate-900/40 relative">
          <div className="absolute -top-3.5 left-6 bg-slate-900 px-3 py-0.5 border border-emerald-500/60 rounded text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Air-Gapped SCADA VPC ({config.vpcCidr})</span>
          </div>

          {/* Subnets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {config.subnetCidrs.map((cidr, idx) => {
              const azLetter = String.fromCharCode(97 + idx);
              const isSimActive = simulationState === 'encrypting' && idx === 0;

              return (
                <div
                  key={cidr}
                  onClick={() => setSelectedNode(`subnet-${idx}`)}
                  className={`border rounded-lg p-3 transition cursor-pointer relative ${
                    isSimActive
                      ? 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-900/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                    <span className="text-emerald-300 font-semibold">AZ: {config.awsRegion}{azLetter}</span>
                    <span className="bg-slate-800 text-slate-400 px-1 rounded text-[10px]">{cidr}</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Serverless SCADA Compute</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Isolated Lambda / Fargate runtime. SG: <code>scada-compute-sg</code> (Zero Public Inbound)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Endpoints & PrivateLink Layer */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gateway VPC Endpoints */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  Gateway VPC Endpoints (Route Table Injected)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Free Tier</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded border transition ${simulationState === 'persisting' ? 'bg-amber-950/60 border-amber-400' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    Amazon S3
                  </div>
                  <span className="text-[10px] text-slate-400">Immutable SCADA raw telemetry</span>
                </div>

                <div className={`p-2 rounded border transition ${simulationState === 'persisting' ? 'bg-amber-950/60 border-amber-400' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    DynamoDB
                  </div>
                  <span className="text-[10px] text-slate-400">High-throughput sensor states</span>
                </div>
              </div>
            </div>

            {/* Interface VPC Endpoints (PrivateLink) */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Interface VPC Endpoints (AWS PrivateLink ENIs)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Private DNS Active</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`p-2 rounded border transition ${simulationState === 'encrypting' ? 'bg-cyan-950/60 border-cyan-400' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-cyan-400" />
                    AWS KMS
                  </div>
                  <span className="text-[9px] text-slate-400">CMK Keys</span>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    CW Logs
                  </div>
                  <span className="text-[9px] text-slate-400">Audit Trail</span>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    AWS STS
                  </div>
                  <span className="text-[9px] text-slate-400">Zero-Trust Tokens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KMS Customer Managed Key (CMK) Hardware Anchor */}
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-2">
                AWS KMS Customer Managed Key (CMK)
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                  365-Day Auto-Rotation
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Enforces AES-256 GCM cryptographic envelope isolation for all SCADA telemetry &amp; flow logs
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-right shrink-0">
            <span>Alias: <code>alias/{config.projectName}-{config.environment}-key</code></span>
          </div>
        </div>
      </div>

      {/* Architecture Spec Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Route Tables: 0.0.0.0/0 route completely omitted</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Default SG: Ingress = [] and Egress = []</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>VPC Flow Logs: 100% Reject/Accept Auditing</span>
        </div>
      </div>
    </div>
  );
};
