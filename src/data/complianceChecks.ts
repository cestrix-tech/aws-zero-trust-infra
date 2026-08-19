import { ComplianceCheck } from '../types';

export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: 'AIRGAP-01',
    framework: 'IEC 62443-3-3',
    title: 'Physical & Logical Network Air-Gap (No IGW / No NAT)',
    status: 'passed',
    category: 'Network Air-Gap',
    description: 'System completely omits aws_internet_gateway, aws_nat_gateway, and 0.0.0.0/0 route definitions, guaranteeing zero internet-reachable ingress/egress vectors.',
    remediation: 'Verified: No IGW attached. Subnet route tables contain only local VPC CIDRs.',
    hclReference: 'main.tf (lines 35-90)'
  },
  {
    id: 'CIS-AWS-4.1',
    framework: 'CIS AWS v3.0',
    title: 'Neutralize Default VPC Security Group',
    status: 'passed',
    category: 'IAM & Access Control',
    description: 'The default security group for the VPC must restrict all incoming and outgoing traffic to prevent accidental exposure by unassigned resources.',
    remediation: 'Configured aws_default_security_group with empty ingress = [] and egress = [].',
    hclReference: 'main.tf (resource "aws_default_security_group")'
  },
  {
    id: 'PLINK-02',
    framework: 'Cestrix Enterprise SecOps',
    title: 'VPC Gateway Endpoints for S3 & DynamoDB',
    status: 'passed',
    category: 'Network Air-Gap',
    description: 'Direct routing to object storage and NoSQL state stores via VPC Gateway endpoints with strict account-level condition filters.',
    remediation: 'Configured aws_vpc_endpoint for S3 and DynamoDB with aws:PrincipalAccount lock.',
    hclReference: 'main.tf (resource "aws_vpc_endpoint" "s3" & "dynamodb")'
  },
  {
    id: 'PLINK-03',
    framework: 'NIST SP 800-82r3',
    title: 'AWS PrivateLink Interface Endpoints (KMS, Logs, STS)',
    status: 'passed',
    category: 'Network Air-Gap',
    description: 'Hardware cryptography, logging, and security token issuance routed across dedicated ENIs without internet transits.',
    remediation: 'Configured Interface endpoints for KMS, CloudWatch Logs, and STS with private DNS enabled.',
    hclReference: 'main.tf (Section 7)'
  },
  {
    id: 'KMS-01',
    framework: 'CIS AWS v3.0',
    title: 'Customer Managed Key (CMK) Automated Rotation',
    status: 'passed',
    category: 'Encryption & KMS',
    description: 'CMKs must have automated annual cryptographic rotation enabled to protect stored industrial telemetry against historical key compromise.',
    remediation: 'aws_kms_key.scada_cmk has enable_key_rotation = true.',
    hclReference: 'main.tf (resource "aws_kms_key" "scada_cmk")'
  },
  {
    id: 'FLOW-01',
    framework: 'CIS AWS v3.0',
    title: 'VPC Flow Logs Enabled for All Traffic and Rejections',
    status: 'passed',
    category: 'Telemetry & Audit',
    description: 'VPC Flow Logs capture all network packets with a 60-second aggregation interval and deliver directly to a KMS-encrypted CloudWatch Log Group.',
    remediation: 'Configured aws_flow_log with traffic_type = "ALL" and dedicated KMS CMK encryption.',
    hclReference: 'main.tf (resource "aws_flow_log")'
  },
  {
    id: 'MULTI-AZ-01',
    framework: 'IEC 62443-3-3',
    title: 'Multi-AZ Resilience for Critical SCADA Infrastructure',
    status: 'passed',
    category: 'Network Air-Gap',
    description: 'Isolated private subnets are dynamically distributed across at least 2 or 3 distinct physical Availability Zones.',
    remediation: 'dynamic count with data.aws_availability_zones.available.',
    hclReference: 'main.tf (resource "aws_subnet" "isolated_private")'
  }
];
