import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { InfraConfig } from '../types';

interface CliQuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InfraConfig;
}

export const CliQuickStartModal: React.FC<CliQuickStartModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullWorkflowScript = `# 1. Clone repository
git clone https://github.com/cestrix-group/aws-zero-trust-infra.git
cd aws-zero-trust-infra

# 2. Initialize Terraform and AWS provider plugin
terraform init

# 3. Verify format and validate HCL syntax
terraform fmt -check
terraform validate

# 4. Generate speculative dry-run execution plan
terraform plan \\
  -var="aws_region=${config.awsRegion}" \\
  -var="environment=${config.environment}" \\
  -var="vpc_cidr=${config.vpcCidr}" \\
  -out="scada-zerotrust.tfplan"

# 5. Apply strictly air-gapped infrastructure
terraform apply "scada-zerotrust.tfplan"

# 6. Run automated verification script
chmod +x scripts/security-audit.sh
./scripts/security-audit.sh`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                CLI Quickstart &amp; Air-Gap Verification
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cestrix Group SecOps standard deployment pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Script Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>Terminal Commands</span>
            <button
              onClick={() => copyText(fullWorkflowScript, 'full')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              {copiedId === 'full' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Script</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-80 select-text leading-relaxed">
            <pre>{fullWorkflowScript}</pre>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-start gap-2.5 text-xs text-emerald-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Air-Gap Guarantee:</strong> This plan creates 0 Internet Gateways, 0 NAT Gateways, and restricts route tables exclusively to the VPC local CIDR.
          </span>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
