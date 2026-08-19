import React from 'react';
import { 
  Sliders, 
  RefreshCw, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Info,
  Sparkles,
  Lock
} from 'lucide-react';
import { InfraConfig } from '../types';

interface ConfiguratorProps {
  config: InfraConfig;
  onChangeConfig: (newConfig: InfraConfig) => void;
  onResetDefault: () => void;
  onViewGeneratedCode: () => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({
  config,
  onChangeConfig,
  onResetDefault,
  onViewGeneratedCode
}) => {
  const regions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
  ];

  const updateField = <K extends keyof InfraConfig>(field: K, value: InfraConfig[K]) => {
    onChangeConfig({
      ...config,
      [field]: value
    });
  };

  const handleCidrChange = (newVpcCidr: string) => {
    // Automatically recalculate subnets if standard 10.x or 172.x CIDR
    let newSubnets = config.subnetCidrs;
    if (newVpcCidr === '10.100.0.0/16') {
      newSubnets = ['10.100.1.0/24', '10.100.2.0/24', '10.100.3.0/24'];
    } else if (newVpcCidr === '10.0.0.0/16') {
      newSubnets = ['10.0.1.0/24', '10.0.2.0/24', '10.0.3.0/24'];
    } else if (newVpcCidr === '172.28.0.0/16') {
      newSubnets = ['172.28.1.0/24', '172.28.2.0/24', '172.28.3.0/24'];
    }
    onChangeConfig({
      ...config,
      vpcCidr: newVpcCidr,
      subnetCidrs: newSubnets
    });
  };

  return (
    <div id="configurator-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono flex items-center gap-2 text-white">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Zero-Trust Variable Customizer &amp; Generator
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Modify network addressing and security parameters. All 3 repository files regenerate instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Cestrix Baseline</span>
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* AWS Region */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <label className="font-semibold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Target AWS Region (<code>aws_region</code>)
          </label>
          <select
            value={config.awsRegion}
            onChange={(e) => updateField('awsRegion', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value} ({r.label})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Sets endpoint service naming patterns (e.g. <code>com.amazonaws.{config.awsRegion}.kms</code>).
          </p>
        </div>

        {/* Deployment Environment */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <label className="font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Workload Environment Tier (<code>environment</code>)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['production', 'staging', 'disaster-recovery'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => updateField('environment', tier)}
                className={`py-2 px-2 rounded-md font-mono text-center transition cursor-pointer ${
                  config.environment === tier
                    ? 'bg-emerald-600 text-white font-bold border border-emerald-400'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Tagged onto resources, KMS aliases, and log group namespaces.
          </p>
        </div>

        {/* Project Name */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <label className="font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            Project / System Identifier (<code>project_name</code>)
          </label>
          <input
            type="text"
            value={config.projectName}
            onChange={(e) => updateField('projectName', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-slate-500">
            Prefix for all isolated VPCs, subnets, and security groups.
          </p>
        </div>

        {/* Top-Level VPC CIDR */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <label className="font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Top-Level VPC CIDR (<code>vpc_cidr</code>)
          </label>
          <select
            value={config.vpcCidr}
            onChange={(e) => handleCidrChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="10.100.0.0/16">10.100.0.0/16 (Cestrix SCADA Standard)</option>
            <option value="10.0.0.0/16">10.0.0.0/16 (Standard Private)</option>
            <option value="172.28.0.0/16">172.28.0.0/16 (Industrial OT Subnet)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Isolated address space with zero public routing overlap.
          </p>
        </div>

        {/* Interface Endpoints Toggle */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              AWS PrivateLink Endpoints (<code>enable_interface_endpoints</code>)
            </label>
            <input
              type="checkbox"
              checked={config.enableInterfaceEndpoints}
              onChange={(e) => updateField('enableInterfaceEndpoints', e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Provisions Interface VPC Endpoints for <strong>AWS KMS</strong>, <strong>CloudWatch Logs</strong>, and <strong>AWS STS</strong> with private DNS.
          </p>
        </div>

        {/* KMS Key Rotation */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              KMS Auto-Rotation (<code>enable_kms_rotation</code>)
            </label>
            <input
              type="checkbox"
              checked={config.enableKmsRotation}
              onChange={(e) => updateField('enableKmsRotation', e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Required by CIS AWS Benchmark 2.8 and NIST SP 800-82 for mission-critical industrial workloads.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>All Terraform code dynamically synchronized with these variables.</span>
        </div>

        <button
          onClick={onViewGeneratedCode}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer"
        >
          View Generated Code in Editor &rarr;
        </button>
      </div>
    </div>
  );
};
