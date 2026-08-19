import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock, 
  Network, 
  KeyRound, 
  FileCheck, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Cpu
} from 'lucide-react';
import { InfraConfig } from '../types';

interface ReadmeViewerProps {
  config: InfraConfig;
}

export const ReadmeViewer: React.FC<ReadmeViewerProps> = ({ config }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div id="readme-viewer-container" className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-10 text-slate-200 max-w-4xl mx-auto shadow-xl space-y-8">
      {/* Title & Badges */}
      <div className="border-b border-slate-800 pb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              aws-zero-trust-infra
            </h1>
            <p className="text-sm text-slate-400 font-mono">
              Cestrix Group Heavy Industries · Industrial Cloud Security Architecture
            </p>
          </div>
        </div>

        {/* Badges Bar */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 bg-purple-950/80 text-purple-300 border border-purple-800 text-xs px-2.5 py-1 rounded font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Terraform &gt;= 1.5.0
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            AWS Provider &gt;= 5.0.0
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security: Air-Gapped Zero-Trust
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-950/80 text-blue-300 border border-blue-800 text-xs px-2.5 py-1 rounded font-mono font-medium">
            IEC 62443-3-3 &amp; NIST SP 800-82r3
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 text-xs px-2.5 py-1 rounded font-mono">
            MIT License
          </span>
        </div>

        {/* Lead Callout */}
        <div className="bg-slate-950/80 border-l-4 border-emerald-500 p-4 rounded-r-lg text-slate-300 text-sm leading-relaxed">
          <p className="font-medium text-emerald-400 mb-1 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Enterprise Mission Statement
          </p>
          This Infrastructure-as-Code (IaC) repository provides production-grade templates for provisioning mathematically isolated, zero-trust cloud environments for heavy engineering SCADA systems, industrial robotics telemetry, and high-assurance compute perimeters—completely removing public internet ingress and egress vectors.
        </div>
      </div>

      {/* Executive Overview Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Executive Overview
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Traditional cloud landing zones rely on Internet Gateways (IGWs) and NAT Gateways with egress proxies for outbound package updates and public telemetry feeds. In mission-critical industrial environments (such as power generation, petrochemical automation, and high-precision manufacturing), any direct route to the public internet violates <strong>IEC 62443</strong> zone and conduit boundaries.
        </p>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          The <code>aws-zero-trust-infra</code> blueprint deployed by <strong>Cestrix Group</strong> guarantees that:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <li className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>No Internet Gateway:</strong> No 0.0.0.0/0 route exists at the subnet routing table layer.</span>
          </li>
          <li className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>Zero-Trust VPC Endpoints:</strong> All S3, DynamoDB, KMS, Logs, and STS calls use AWS PrivateLink.</span>
          </li>
          <li className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>Default SG Neutralization:</strong> Default security group revokes all inbound and outbound rules.</span>
          </li>
          <li className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>KMS CMK Envelope Encryption:</strong> Automated annual key rotation with strict IAM boundaries.</span>
          </li>
        </ul>
      </section>

      {/* Architecture Highlights Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Architecture Highlights
        </h2>

        {/* ASCII Topology Diagram */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto text-emerald-400 shadow-inner">
          <pre className="leading-tight">
{`+-----------------------------------------------------------------------------------+
|                            AWS REGION: ${config.awsRegion.toUpperCase()}                            |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |  STRICTLY AIR-GAPPED VPC (${config.vpcCidr})                                      |   |
|   |  * NO Internet Gateway (IGW)         * NO NAT Gateway                     |   |
|   |  * NO Egress-Only IGW                * Zero Ingress Default Security Group|   |
|   |                                                                           |   |
|   |   +-----------------------+  +-----------------------+  +-------------+   |   |
|   |   | Isolated Subnet A     |  | Isolated Subnet B     |  | Subnet C    |   |   |
|   |   | ${config.subnetCidrs[0]}       |  | ${config.subnetCidrs[1] || '10.100.2.0/24'}       |  | ...         |   |   |
|   |   |   [Serverless SCADA]  |  |   [Serverless SCADA]  |  | [Compute]   |   |   |
|   |   |   Worker Execution    |  |   Telemetry Worker    |  |             |   |   |
|   |   +-----------+-----------+  +-----------+-----------+  +------+------+   |   |
|   |               |                          |                     |          |   |
|   |               +--------------------------+---------------------+          |   |
|   |                                          |                                |   |
|   |                       Private Routing / PrivateLink Only                  |   |
|   |                                          |                                |   |
|   |        +---------------------------------+------------------------+       |   |
|   |        |                                                          |       |   |
|   |   +----+--------------------+                    +----------------+---+   |   |
|   |   | Gateway VPC Endpoints   |                    | Interface VPC      |   |   |
|   |   | - Amazon S3 (Buckets)   |                    | Endpoints (PL)     |   |   |
|   |   | - Amazon DynamoDB       |                    | - AWS KMS (CMK)    |   |   |
|   |   |   (Encrypted Tables)    |                    | - CloudWatch Logs  |   |   |
|   |   |                         |                    | - AWS STS          |   |   |
|   |   +-------------------------+                    +--------------------+   |   |
|   +---------------------------------------------------------------------------+   |
|                                                                                   |
|   [AWS KMS Customer Managed Key (CMK)] <---> 100% Enforced Encryption at Rest    |
|   [CloudWatch Flow Logs (Active)]      <---> Comprehensive Reject/Accept Audit   |
+-----------------------------------------------------------------------------------+`}
          </pre>
        </div>

        {/* 4 Feature Deep Dives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              <Network className="w-4 h-4" />
              1. VPC Endpoints (PrivateLink)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides dedicated ENIs inside private subnets for KMS, CloudWatch Logs, and STS, alongside Gateway endpoints for S3 and DynamoDB. Traffic never traverses public internet infrastructure.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              2. KMS Customer Managed Keys (CMK)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated envelope cryptographic keys with automated annual key rotation and least-privilege key policies enforcing strict caller account IDs and service principals.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              3. Neutralized Default Security Group
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The VPC's default security group is managed with empty ingress and egress arrays to prevent unassigned or rogue compute nodes from communicating by default.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              4. High-Resolution Flow Logs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              1-minute aggregation interval logging of ALL packet attempts delivered directly to an encrypted CloudWatch Log Group for continuous threat detection and SIEM audit streaming.
            </p>
          </div>
        </div>
      </section>

      {/* Usage Instructions Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          Usage Instructions
        </h2>

        {/* Step 1 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-200">Step 1: Initialize Terraform &amp; Providers</h3>
          <div className="relative bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-xs flex items-center justify-between">
            <code className="text-cyan-300">terraform init</code>
            <button
              onClick={() => copySnippet('terraform init', 'init')}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              {copiedSection === 'init' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-200">Step 2: Generate Dry-Run Plan</h3>
          <div className="relative bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-xs flex items-center justify-between">
            <code className="text-cyan-300">terraform plan -out=scada-zerotrust.tfplan</code>
            <button
              onClick={() => copySnippet('terraform plan -out=scada-zerotrust.tfplan', 'plan')}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              {copiedSection === 'plan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-200">Step 3: Apply Air-Gapped Infrastructure</h3>
          <div className="relative bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-xs flex items-center justify-between">
            <code className="text-emerald-400">terraform apply "scada-zerotrust.tfplan"</code>
            <button
              onClick={() => copySnippet('terraform apply "scada-zerotrust.tfplan"', 'apply')}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              {copiedSection === 'apply' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Compliance Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          Compliance &amp; Industrial Standards Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-slate-300 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Standard / Framework</th>
                <th className="p-3">Requirement Clause</th>
                <th className="p-3">Implementation Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-sans">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-mono text-emerald-400 font-semibold">IEC 62443-3-3</td>
                <td className="p-3 text-slate-300">SR 5.1 / 5.2 Network Segmentation</td>
                <td className="p-3 text-slate-400">Isolated private subnets, absence of IGW/NAT, strict SG boundaries</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-mono text-cyan-400 font-semibold">NIST SP 800-82r3</td>
                <td className="p-3 text-slate-300">ICS Boundary Protection</td>
                <td className="p-3 text-slate-400">Air-gapped VPC architecture, AWS PrivateLink micro-segmentation</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-mono text-purple-400 font-semibold">CIS AWS v3.0</td>
                <td className="p-3 text-slate-300">4.1 Hardened Default SG</td>
                <td className="p-3 text-slate-400">Zero ingress and zero egress rules on default security group</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-mono text-amber-400 font-semibold">CIS AWS v3.0</td>
                <td className="p-3 text-slate-300">2.8 KMS Key Rotation</td>
                <td className="p-3 text-slate-400">Enabled automated annual rotation on Customer Managed Key</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <span>Distributed under the <strong>MIT License</strong></span>
        <span className="font-mono text-emerald-400">Maintained by Cestrix Group Cloud SecOps</span>
      </div>
    </div>
  );
};
