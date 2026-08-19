export type ActiveTab = 'editor' | 'preview' | 'diagram' | 'configurator' | 'compliance';

export type FileKey = 'README.md' | 'main.tf' | 'variables.tf' | 'outputs.tf' | 'terraform.tfvars.example' | 'security-audit.sh';

export interface RepoFile {
  id: FileKey;
  name: string;
  language: 'markdown' | 'hcl' | 'shell';
  path: string;
  description: string;
  size: string;
  icon: string;
  content: string;
}

export interface InfraConfig {
  awsRegion: string;
  environment: 'production' | 'staging' | 'disaster-recovery';
  projectName: string;
  vpcCidr: string;
  subnetCidrs: string[];
  enableFlowLogs: boolean;
  flowLogsRetentionDays: number;
  enableInterfaceEndpoints: boolean;
  enableKmsRotation: boolean;
  dataClassification: string;
  complianceStandard: string;
  ownerTeam: string;
}

export interface ComplianceCheck {
  id: string;
  framework: 'CIS AWS v3.0' | 'IEC 62443-3-3' | 'NIST SP 800-82r3' | 'Cestrix Enterprise SecOps';
  title: string;
  status: 'passed' | 'warning' | 'info';
  category: 'Network Air-Gap' | 'Encryption & KMS' | 'IAM & Access Control' | 'Telemetry & Audit';
  description: string;
  remediation: string;
  hclReference: string;
}
