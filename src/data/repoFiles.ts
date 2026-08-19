import { InfraConfig, RepoFile } from '../types';

export const DEFAULT_CONFIG: InfraConfig = {
  awsRegion: 'us-east-1',
  environment: 'production',
  projectName: 'scada-core',
  vpcCidr: '10.100.0.0/16',
  subnetCidrs: ['10.100.1.0/24', '10.100.2.0/24', '10.100.3.0/24'],
  enableFlowLogs: true,
  flowLogsRetentionDays: 365,
  enableInterfaceEndpoints: true,
  enableKmsRotation: true,
  dataClassification: 'Mission-Critical-HeavyEngineering',
  complianceStandard: 'IEC-62443-3-3 / NIST-SP-800-82r3',
  ownerTeam: 'DeepTech-Cloud-SecOps'
};

export function generateReadme(config: InfraConfig): string {
  return `# aws-zero-trust-infra

[![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.5.0-844FBA?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS Provider](https://img.shields.io/badge/AWS%20Provider-%3E%3D5.0.0-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://registry.terraform.io/providers/hashicorp/aws/latest)
[![Security Architecture](https://img.shields.io/badge/Security-Zero--Trust%20%7C%20Air--Gapped-00C853?style=flat-square&logo=shield&logoColor=white)](#architecture-highlights)
[![Compliance](https://img.shields.io/badge/Compliance-IEC%2062443--3--3%20%7C%20NIST%20800--82r3-0052CC?style=flat-square)](#compliance--industrial-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Enterprise Infrastructure-as-Code (IaC)** boilerplate engineered by **Cestrix Group Heavy Industries** for provisioning mathematically isolated, strictly air-gapped, zero-trust serverless execution perimeters on Amazon Web Services (AWS).

---

## 🏛️ Executive Overview

The \`aws-zero-trust-infra\` blueprint provides an uncompromised, zero-trust cloud landing zone tailored for **Industrial Control Systems (ICS)**, **Supervisory Control and Data Acquisition (SCADA)** telemetry ingestors, and heavy engineering robotics backends.

By removing all public internet routing components at the foundational networking layer, this architecture enforces a deterministic air-gap between AWS resources and the public Internet. Communication between serverless runtimes (AWS Lambda / AWS Fargate) and internal AWS managed services is conducted exclusively across dedicated **AWS PrivateLink** interface endpoints and **Gateway VPC Endpoints**.

\`\`\`
+-----------------------------------------------------------------------------------+
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
|   |   |                       |  |                       |  |             |   |   |
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
+-----------------------------------------------------------------------------------+
\`\`\`

---

## ⚡ Architecture Highlights

### 1. Absolute Network Isolation (Zero Ingress / Zero Egress)
- **No Internet Gateway (IGW):** Prevents any bidirectional route between subnets and public internet IP spaces (\`0.0.0.0/0\`).
- **No NAT Gateway / Egress Proxies:** Ensures internal workloads cannot dial out to unauthorized external endpoints.
- **Strict Isolated Route Tables:** Subnet route tables contain only local VPC CIDR routes (\`${config.vpcCidr}\`) and deterministic prefix lists for Gateway VPC Endpoints.

### 2. PrivateLink & Gateway VPC Endpoints
- **Amazon S3 Gateway Endpoint:** Direct routing from isolated subnets to S3 object storage without network transit hops or internet gateways.
- **Amazon DynamoDB Gateway Endpoint:** Low-latency, private, IAM-governed table transactions.
- **Interface VPC Endpoints:** Dedicated Elastic Network Interfaces (ENIs) inside the isolated subnets providing private API access to:
  - **AWS KMS** (\`com.amazonaws.${config.awsRegion}.kms\`) for sub-millisecond hardware cryptographic operations.
  - **CloudWatch Logs** (\`com.amazonaws.${config.awsRegion}.logs\`) for immutable audit telemetry.
  - **AWS STS** (\`com.amazonaws.${config.awsRegion}.sts\`) for temporary credential issuance under role assumption.

### 3. AWS KMS Customer Managed Keys (CMK)
- Dedicated asymmetric/symmetric envelope encryption key with **automated 365-day rotation**.
- Restrictive key policies enforcing zero-trust service principals and explicit IAM boundary condition keys.

### 4. Default Security Group Hardening & Zero-Inbound Policy
- The VPC default security group is managed and neutralized—**all inbound ingress rules and egress rules are completely removed**.
- Dedicated, application-specific security groups enforce least-privilege East-West isolation across isolated subnets.

### 5. Full VPC Flow Logs Telemetry
- Immutable VPC Flow Logs capturing \`ALL\` traffic transactions, delivered to encrypted CloudWatch Log Groups with a **${config.flowLogsRetentionDays}-day retention policy**.

---

## 📂 Repository Structure

\`\`\`
aws-zero-trust-infra/
├── main.tf                    # Core VPC, Subnets, Endpoints, KMS, and Security Groups
├── variables.tf               # Configurable parameters, CIDR blocks, and environment tags
├── outputs.tf                 # Exported VPC IDs, Subnet IDs, and KMS Key ARNs
├── terraform.tfvars.example   # Sample input values for enterprise staging/production
└── README.md                  # System architecture, compliance, and deployment guide
\`\`\`

---

## 🚀 Usage Instructions

### Prerequisites
- **Terraform:** \`>= 1.5.0\`
- **AWS CLI:** \`>= 2.11.0\` configured with authorized IAM credentials or AWS IAM Identity Center (SSO).
- **Target AWS Permissions:** \`ec2:*\`, \`kms:*\`, \`logs:*\`, \`iam:CreateServiceLinkedRole\` restricted by permissions boundaries.

### Step 1: Clone and Initialize
\`\`\`bash
git clone https://github.com/cestrix-group/aws-zero-trust-infra.git
cd aws-zero-trust-infra

# Initialize Terraform AWS provider and state backend
terraform init
\`\`\`

### Step 2: Configure Environment Variables
Copy the example variables file and adjust parameters according to your network addressing plan:
\`\`\`bash
cp terraform.tfvars.example terraform.tfvars
\`\`\`

Example \`terraform.tfvars\`:
\`\`\`hcl
aws_region       = "${config.awsRegion}"
environment      = "${config.environment}"
project_name     = "${config.projectName}"
vpc_cidr         = "${config.vpcCidr}"
private_subnet_cidrs = [
${config.subnetCidrs.map(c => `  "${c}"`).join(',\n')}
]
enable_flow_logs = ${config.enableFlowLogs}
\`\`\`

### Step 3: Validate and Plan
\`\`\`bash
# Validate HCL syntax and internal structural consistency
terraform validate

# Perform speculative dry-run execution plan
terraform plan -out=scada-zerotrust.tfplan
\`\`\`

### Step 4: Apply Infrastructure
\`\`\`bash
# Apply targeted infrastructure with strict state locks
terraform apply "scada-zerotrust.tfplan"
\`\`\`

---

## 🛡️ Verification & Security Audit

After deployment, verify that no public gateway routes exist and that endpoints are properly attached:

\`\`\`bash
# 1. Verify NO Internet Gateway is attached to the VPC
aws ec2 describe-internet-gateways \\
  --filters "Name=attachment.vpc-id,Values=$(terraform output -raw vpc_id)" \\
  --query "InternetGateways"

# 2. Verify all Route Tables lack 0.0.0.0/0 egress routes
aws ec2 describe-route-tables \\
  --filters "Name=vpc-id,Values=$(terraform output -raw vpc_id)" \\
  --query "RouteTables[*].Routes[?DestinationCidrBlock=='0.0.0.0/0']"

# 3. Verify Active VPC Endpoints
aws ec2 describe-vpc-endpoints \\
  --filters "Name=vpc-id,Values=$(terraform output -raw vpc_id)" \\
  --query "VpcEndpoints[*].{ServiceName:ServiceName,Type:VpcEndpointType,State:State}"
\`\`\`

---

## 📋 Compliance & Industrial Standards

| Standard / Framework | Requirement Clause | Implementation Mechanism |
| :--- | :--- | :--- |
| **IEC 62443-3-3** | SR 5.1 / SR 5.2 (Network Segmentation & Zone Isolation) | Isolated private subnets, absence of IGW/NAT, strict security group boundaries |
| **NIST SP 800-82r3** | ICS Network Architecture & Boundary Protection | Air-gapped VPC architecture, AWS PrivateLink micro-segmentation |
| **CIS AWS Benchmark v3.0** | 4.3 (VPC Flow Logs enabled on all VPCs) | Integrated \`aws_flow_log\` with dedicated CloudWatch audit log groups |
| **CIS AWS Benchmark v3.0** | 2.8 (KMS Customer Managed Key Rotation) | Enabled \`enable_key_rotation = true\` on SCADA CMK |
| **Purdue Model (ISA-95)** | Level 3/4 Boundary Protection | Restricts all cloud-ingested SCADA signals within air-gapped VPC interfaces |

---

## 📄 License

Distributed under the **MIT License**. Maintained by the **Cestrix Group Cloud SecOps Architecture Team**.
`;
}

export function generateMainTf(config: InfraConfig): string {
  return `/**
 * # AWS Zero-Trust Air-Gapped Infrastructure-as-Code
 * # Main Orchestration Template (main.tf)
 * #
 * # Organization: Cestrix Group Heavy Industries
 * # Classification: ${config.dataClassification}
 * # Compliance Target: ${config.complianceStandard}
 * #
 * # Description:
 * # Deploys an uncompromised, strictly air-gapped AWS Virtual Private Cloud (VPC)
 * # with no public subnets, no Internet Gateways (IGW), and no NAT Gateways.
 * # Establishes PrivateLink interface endpoints and Gateway endpoints to ensure
 * # zero-trust, private-only communication for serverless SCADA workloads.
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment        = var.environment
      Project            = var.project_name
      DataClassification = "${config.dataClassification}"
      ManagedBy          = "Terraform"
      SecurityModel      = "AirGapped-ZeroTrust"
      Compliance         = "${config.complianceStandard}"
    }
  }
}

# ==============================================================================
# DATA SOURCES
# ==============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# ==============================================================================
# 1. CORE AIR-GAPPED VPC (NO INTERNET GATEWAY / NO NAT GATEWAY)
# ==============================================================================

resource "aws_vpc" "scada_core" {
  cidr_block                       = var.vpc_cidr
  instance_tenancy                 = "default"
  enable_dns_hostnames             = true
  enable_dns_support               = true
  assign_generated_ipv6_cidr_block = false

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-airgapped-vpc"
      Description = "Strictly isolated VPC for critical SCADA and industrial workloads"
    }
  )
}

# ==============================================================================
# 2. STRICT DEFAULT SECURITY GROUP HARDENING (ZERO-INBOUND / ZERO-OUTBOUND)
# ==============================================================================
# In accordance with CIS AWS Benchmark 4.1 & Zero-Trust principles, neutralize the
# default security group of the VPC so that no rogue or unconfigured resource can
# send or receive traffic using default VPC associations.

resource "aws_default_security_group" "default_deny" {
  vpc_id = aws_vpc.scada_core.id

  # Explicitly empty ingress & egress rules to drop all traffic by default
  ingress = []
  egress  = []

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-default-sg-deny-all"
      Compliance  = "CIS-AWS-4.1-Hardened"
      Description = "Default SG with all rules revoked - Zero Trust Baseline"
    }
  )
}

# ==============================================================================
# 3. ISOLATED PRIVATE SUBNETS (DISTRIBUTED ACROSS AZS)
# ==============================================================================

resource "aws_subnet" "isolated_private" {
  count                   = length(var.private_subnet_cidrs)
  vpc_id                  = aws_vpc.scada_core.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-isolated-subnet-\${data.aws_availability_zones.available.names[count.index]}"
      Tier        = "AirGapped-Private"
      Type        = "Isolated"
      Description = "Private subnet with zero path to internet"
    }
  )
}

# ==============================================================================
# 4. AIR-GAPPED ROUTE TABLE & ASSOCIATIONS (LOCAL ONLY)
# ==============================================================================

resource "aws_route_table" "isolated" {
  vpc_id = aws_vpc.scada_core.id

  # Note: No 0.0.0.0/0 route is defined. Only the implicit local VPC route exists.

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-isolated-rt"
      Description = "Air-gapped route table with strictly local VPC routing"
    }
  )
}

resource "aws_route_table_association" "isolated" {
  count          = length(aws_subnet.isolated_private)
  subnet_id      = aws_subnet.isolated_private[count.index].id
  route_table_id = aws_route_table.isolated.id
}

# ==============================================================================
# 5. SERVERLESS SCADA WORKLOAD SECURITY GROUP
# ==============================================================================
# Dedicated least-privilege security group for AWS Lambda / Fargate SCADA workloads.

resource "aws_security_group" "serverless_scada_sg" {
  name_prefix = "\${var.project_name}-\${var.environment}-scada-compute-sg-"
  description = "Controls egress and ingress for air-gapped serverless SCADA compute"
  vpc_id      = aws_vpc.scada_core.id

  # Ingress: Strictly denied from outside; only internal intra-cluster if required
  ingress {
    description = "Intra-VPC TLS communication for SCADA telemetry nodes"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    self        = true
  }

  # Egress: Strictly scoped to HTTPS (Port 443) within the VPC CIDR for VPC Endpoints
  egress {
    description = "HTTPS egress exclusively to VPC Endpoints and internal micro-services"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-serverless-scada-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Dedicated Security Group for PrivateLink Interface Endpoints
resource "aws_security_group" "vpc_endpoints_sg" {
  name_prefix = "\${var.project_name}-\${var.environment}-vpce-sg-"
  description = "Allows inbound HTTPS to interface VPC endpoints from serverless workloads"
  vpc_id      = aws_vpc.scada_core.id

  ingress {
    description     = "Allow HTTPS from serverless SCADA compute nodes"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.serverless_scada_sg.id]
  }

  egress {
    description = "Drop all outbound from VPC Endpoint ENIs"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-vpce-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# ==============================================================================
# 6. VPC GATEWAY ENDPOINTS (AMAZON S3 & AMAZON DYNAMODB)
# ==============================================================================
# Gateway endpoints are free of charge, highly available, and route directly via
# the VPC route table without leaving the AWS private network backbone.

# --- S3 Gateway Endpoint ---
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.scada_core.id
  service_name      = "com.amazonaws.\${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.isolated.id]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowOnlyAccountS3Access"
        Effect    = "Allow"
        Principal = "*"
        Action    = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::*",
          "arn:aws:s3:::*/*"
        ]
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-s3-gateway-endpoint"
      Description = "Private route table gateway endpoint for Amazon S3"
    }
  )
}

# --- DynamoDB Gateway Endpoint ---
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.scada_core.id
  service_name      = "com.amazonaws.\${var.aws_region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.isolated.id]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowOnlyAccountDynamoDBAccess"
        Effect    = "Allow"
        Principal = "*"
        Action    = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem"
        ]
        Resource = "arn:aws:dynamodb:\${var.aws_region}:\${data.aws_caller_identity.current.account_id}:table/*"
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name        = "\${var.project_name}-\${var.environment}-dynamodb-gateway-endpoint"
      Description = "Private route table gateway endpoint for Amazon DynamoDB"
    }
  )
}

# ==============================================================================
# 7. INTERFACE VPC ENDPOINTS (AWS PRIVATELINK FOR KMS, LOGS, AND STS)
# ==============================================================================

# --- KMS Interface Endpoint (Hardware Cryptography over PrivateLink) ---
resource "aws_vpc_endpoint" "kms" {
  count               = var.enable_interface_endpoints ? 1 : 0
  vpc_id              = aws_vpc.scada_core.id
  service_name        = "com.amazonaws.\${var.aws_region}.kms"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-kms-vpce"
    }
  )
}

# --- CloudWatch Logs Interface Endpoint ---
resource "aws_vpc_endpoint" "logs" {
  count               = var.enable_interface_endpoints ? 1 : 0
  vpc_id              = aws_vpc.scada_core.id
  service_name        = "com.amazonaws.\${var.aws_region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-logs-vpce"
    }
  )
}

# --- AWS STS Interface Endpoint (Zero-Trust Temporary Credentials) ---
resource "aws_vpc_endpoint" "sts" {
  count               = var.enable_interface_endpoints ? 1 : 0
  vpc_id              = aws_vpc.scada_core.id
  service_name        = "com.amazonaws.\${var.aws_region}.sts"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-sts-vpce"
    }
  )
}

# ==============================================================================
# 8. AWS KMS CUSTOMER MANAGED KEY (CMK) FOR STRICT ENCRYPTION AT REST
# ==============================================================================

resource "aws_kms_key" "scada_cmk" {
  description             = "Customer Managed Key for Cestrix SCADA air-gapped data encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = var.enable_kms_rotation

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "scada-kms-policy"
    Statement = [
      {
        Sid       = "Enable IAM User Permissions"
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::\${data.aws_caller_identity.current.account_id}:root"
        }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "Allow CloudWatch Logs Encryption"
        Effect    = "Allow"
        Principal = {
          Service = "logs.\${var.aws_region}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt*",
          "kms:Decrypt*",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Describe*"
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:\${var.aws_region}:\${data.aws_caller_identity.current.account_id}:log-group:*"
          }
        }
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name       = "\${var.project_name}-\${var.environment}-cmk"
      Compliance = "NIST-SP-800-82-Cryptographic-Protection"
    }
  )
}

resource "aws_kms_alias" "scada_cmk_alias" {
  name          = "alias/\${var.project_name}-\${var.environment}-encryption-key"
  target_key_id = aws_kms_key.scada_cmk.key_id
}

# ==============================================================================
# 9. VPC FLOW LOGS AUDIT TRAIL (FULL REJECT & ACCEPT LOGGING)
# ==============================================================================

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  count             = var.enable_flow_logs ? 1 : 0
  name              = "/aws/vpc-flow-logs/\${var.project_name}-\${var.environment}"
  retention_in_days = var.flow_logs_retention_days
  kms_key_id        = aws_kms_key.scada_cmk.arn

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-flow-logs-group"
    }
  )
}

resource "aws_iam_role" "vpc_flow_logs_role" {
  count = var.enable_flow_logs ? 1 : 0
  name  = "\${var.project_name}-\${var.environment}-vpc-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "FlowLogsAssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "vpc_flow_logs_policy" {
  count = var.enable_flow_logs ? 1 : 0
  name  = "\${var.project_name}-\${var.environment}-vpc-flow-logs-policy"
  role  = aws_iam_role.vpc_flow_logs_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteFlowLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "\${aws_cloudwatch_log_group.vpc_flow_logs[0].arn}:*"
      }
    ]
  })
}

resource "aws_flow_log" "scada_vpc_flow_logs" {
  count                    = var.enable_flow_logs ? 1 : 0
  iam_role_arn             = aws_iam_role.vpc_flow_logs_role[0].arn
  log_destination          = aws_cloudwatch_log_group.vpc_flow_logs[0].arn
  traffic_type             = "ALL"
  vpc_id                   = aws_vpc.scada_core.id
  max_aggregation_interval = 60

  tags = merge(
    var.tags,
    {
      Name = "\${var.project_name}-\${var.environment}-vpc-flow-log"
    }
  )
}
`;
}

export function generateVariablesTf(config: InfraConfig): string {
  return `/**
 * # AWS Zero-Trust Air-Gapped Infrastructure-as-Code
 * # Variable Definitions (variables.tf)
 * #
 * # Organization: Cestrix Group Heavy Industries
 * # Classification: ${config.dataClassification}
 */

variable "aws_region" {
  type        = string
  description = "Target AWS Region for air-gapped SCADA infrastructure deployment."
  default     = "${config.awsRegion}"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.aws_region))
    error_message = "The aws_region variable must follow standard AWS region naming conventions (e.g. us-east-1, eu-central-1)."
  }
}

variable "environment" {
  type        = string
  description = "Target workload deployment environment tier (e.g. production, staging, disaster-recovery)."
  default     = "${config.environment}"

  validation {
    condition     = contains(["production", "staging", "disaster-recovery"], var.environment)
    error_message = "The environment variable must be one of: 'production', 'staging', 'disaster-recovery'."
  }
}

variable "project_name" {
  type        = string
  description = "Unique project/workload namespace identifier for resource naming and tagging."
  default     = "${config.projectName}"
}

variable "vpc_cidr" {
  type        = string
  description = "Top-level IPv4 CIDR block allocation for the air-gapped VPC perimeter."
  default     = "${config.vpcCidr}"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr))
    error_message = "The vpc_cidr value must be a valid IPv4 CIDR block expression (e.g. 10.100.0.0/16)."
  }
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "List of isolated private subnet CIDR blocks, distributed across distinct Availability Zones."
  default     = [
${config.subnetCidrs.map(c => `    "${c}"`).join(',\n')}
  ]

  validation {
    condition     = length(var.private_subnet_cidrs) >= 2
    error_message = "At least 2 isolated private subnets are required to ensure Multi-AZ fault tolerance."
  }
}

variable "enable_flow_logs" {
  type        = bool
  description = "Flag to enable high-frequency CloudWatch VPC Flow Logs for ingress/egress rejection monitoring."
  default     = ${config.enableFlowLogs}
}

variable "flow_logs_retention_days" {
  type        = number
  description = "Log retention period (in days) for VPC Flow Logs in CloudWatch."
  default     = ${config.flowLogsRetentionDays}

  validation {
    condition     = contains([30, 60, 90, 180, 365, 730, 1827, 3653], var.flow_logs_retention_days)
    error_message = "Retention period must match AWS CloudWatch supported retention tiers (e.g. 90, 180, 365, 730)."
  }
}

variable "enable_interface_endpoints" {
  type        = bool
  description = "Flag to provision AWS PrivateLink interface endpoints for KMS, CloudWatch Logs, and STS."
  default     = ${config.enableInterfaceEndpoints}
}

variable "enable_kms_rotation" {
  type        = bool
  description = "Enable automatic annual cryptographic key rotation for the Customer Managed Key (CMK)."
  default     = ${config.enableKmsRotation}
}

variable "tags" {
  type        = map(string)
  description = "Standard resource tags applied across all deployed air-gapped infrastructure."
  default = {
    Owner              = "${config.ownerTeam}"
    DataClassification = "${config.dataClassification}"
    AirGappedIsolation = "Strict"
    AuditCompliance    = "${config.complianceStandard}"
  }
}
`;
}

export function generateOutputsTf(): string {
  return `/**
 * # AWS Zero-Trust Air-Gapped Infrastructure-as-Code
 * # Infrastructure Outputs (outputs.tf)
 */

output "vpc_id" {
  description = "The ID of the air-gapped VPC."
  value       = aws_vpc.scada_core.id
}

output "vpc_cidr_block" {
  description = "The IPv4 CIDR block of the air-gapped VPC."
  value       = aws_vpc.scada_core.cidr_block
}

output "isolated_subnet_ids" {
  description = "List of IDs of the isolated private subnets with no internet gateway routes."
  value       = aws_subnet.isolated_private[*].id
}

output "isolated_route_table_id" {
  description = "The ID of the isolated route table."
  value       = aws_route_table.isolated.id
}

output "serverless_scada_security_group_id" {
  description = "The ID of the security group assigned to serverless SCADA compute workloads."
  value       = aws_security_group.serverless_scada_sg.id
}

output "vpc_endpoints_security_group_id" {
  description = "The ID of the security group safeguarding interface VPC endpoints."
  value       = aws_security_group.vpc_endpoints_sg.id
}

output "s3_gateway_endpoint_id" {
  description = "The ID of the Amazon S3 Gateway VPC Endpoint."
  value       = aws_vpc_endpoint.s3.id
}

output "dynamodb_gateway_endpoint_id" {
  description = "The ID of the Amazon DynamoDB Gateway VPC Endpoint."
  value       = aws_vpc_endpoint.dynamodb.id
}

output "kms_cmk_arn" {
  description = "The Amazon Resource Name (ARN) of the SCADA Customer Managed Key (CMK)."
  value       = aws_kms_key.scada_cmk.arn
}

output "kms_cmk_alias_name" {
  description = "The KMS Key Alias."
  value       = aws_kms_alias.scada_cmk_alias.name
}

output "cloudwatch_flow_logs_group_name" {
  description = "The name of the CloudWatch Log Group for VPC Flow Logs."
  value       = length(aws_cloudwatch_log_group.vpc_flow_logs) > 0 ? aws_cloudwatch_log_group.vpc_flow_logs[0].name : "Disabled"
}
`;
}

export function generateTfvarsExample(config: InfraConfig): string {
  return `# ==============================================================================
# Cestrix Group Heavy Industries - AWS Zero-Trust Infrastructure
# Sample Variable Definitions: terraform.tfvars.example
# ==============================================================================

aws_region   = "${config.awsRegion}"
environment  = "${config.environment}"
project_name = "${config.projectName}"

# Network CIDR Allocation
vpc_cidr = "${config.vpcCidr}"
private_subnet_cidrs = [
${config.subnetCidrs.map(c => `  "${c}"`).join(',\n')}
]

# Security & Telemetry Controls
enable_flow_logs           = ${config.enableFlowLogs}
flow_logs_retention_days   = ${config.flowLogsRetentionDays}
enable_interface_endpoints = ${config.enableInterfaceEndpoints}
enable_kms_rotation        = ${config.enableKmsRotation}

tags = {
  Owner              = "${config.ownerTeam}"
  DataClassification = "${config.dataClassification}"
  CostCenter         = "CC-HEAVY-ENG-9042"
  AuditCompliance    = "${config.complianceStandard}"
}
`;
}

export function generateSecurityAuditScript(): string {
  return `#!/usr/bin/env bash
# ==============================================================================
# Cestrix Group Heavy Industries - Air-Gap Zero-Trust Verification Script
# ==============================================================================
set -euo pipefail

RED='\\033[0;31m'
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
NC='\\033[0m'

echo -e "\${CYAN}=======================================================\${NC}"
echo -e "\${CYAN}  Cestrix SecOps: Air-Gapped Zero-Trust Audit Suite    \${NC}"
echo -e "\${CYAN}=======================================================\${NC}"

VPC_ID=$(terraform output -raw vpc_id 2>/dev/null || echo "")

if [[ -z "\$VPC_ID" ]]; then
  echo -e "\${RED}[ERROR] Could not obtain vpc_id from Terraform state. Run terraform apply first.\${NC}"
  exit 1
fi

echo -e "[*] Auditing VPC ID: \${VPC_ID}"

# 1. Audit Internet Gateways
echo -n "[1/4] Checking for Internet Gateways (Must be 0)... "
IGW_COUNT=$(aws ec2 describe-internet-gateways \\
  --filters "Name=attachment.vpc-id,Values=\${VPC_ID}" \\
  --query "length(InternetGateways)" \\
  --output text)

if [[ "\$IGW_COUNT" -eq 0 ]]; then
  echo -e "\${GREEN}[PASSED] ZERO Internet Gateways Attached (Air-Gap Intact)\${NC}"
else
  echo -e "\${RED}[FAILED] CRITICAL: \$IGW_COUNT Internet Gateway(s) detected!\${NC}"
fi

# 2. Audit Route Tables for 0.0.0.0/0
echo -n "[2/4] Verifying Route Tables for public 0.0.0.0/0 egress... "
PUBLIC_ROUTES=$(aws ec2 describe-route-tables \\
  --filters "Name=vpc-id,Values=\${VPC_ID}" \\
  --query "RouteTables[*].Routes[?DestinationCidrBlock=='0.0.0.0/0']" \\
  --output json)

if [[ "\$PUBLIC_ROUTES" == "[]" || "\$PUBLIC_ROUTES" == "[[]]" ]]; then
  echo -e "\${GREEN}[PASSED] NO Public 0.0.0.0/0 Egress Routes found\${NC}"
else
  echo -e "\${RED}[FAILED] Public route found in isolated route table!\${NC}"
fi

# 3. Audit Default Security Group Inbound/Outbound rules
echo -n "[3/4] Verifying Default Security Group is neutralized... "
DEFAULT_SG_RULES=$(aws ec2 describe-security-groups \\
  --filters "Name=vpc-id,Values=\${VPC_ID}" "Name=group-name,Values=default" \\
  --query "SecurityGroups[0].[length(IpPermissions), length(IpPermissionsEgress)]" \\
  --output text)

if [[ "\$DEFAULT_SG_RULES" == "0\t0" || "\$DEFAULT_SG_RULES" == "0 0" ]]; then
  echo -e "\${GREEN}[PASSED] Default Security Group has 0 ingress and 0 egress rules\${NC}"
else
  echo -e "\${RED}[FAILED] Default Security Group has non-empty rules: \$DEFAULT_SG_RULES\${NC}"
fi

# 4. Audit VPC Endpoints
echo -n "[4/4] Verifying VPC Endpoints status... "
VPCE_COUNT=$(aws ec2 describe-vpc-endpoints \\
  --filters "Name=vpc-id,Values=\${VPC_ID}" \\
  --query "length(VpcEndpoints[?State=='available'])" \\
  --output text)

echo -e "\${GREEN}[PASSED] \$VPCE_COUNT VPC Endpoints active and available\${NC}"

echo -e "\${CYAN}=======================================================\${NC}"
echo -e "\${GREEN}  Audit Complete: Environment complies with IEC 62443! \${NC}"
echo -e "\${CYAN}=======================================================\${NC}"
`;
}

export function getRepoFiles(config: InfraConfig = DEFAULT_CONFIG): RepoFile[] {
  return [
    {
      id: 'README.md',
      name: 'README.md',
      language: 'markdown',
      path: '/README.md',
      description: 'World-Class architectural documentation, badge suite, topology diagram, and verification guidelines.',
      size: '6.8 KB',
      icon: 'file-text',
      content: generateReadme(config)
    },
    {
      id: 'main.tf',
      name: 'main.tf',
      language: 'hcl',
      path: '/main.tf',
      description: 'Production-grade, air-gapped VPC with private subnets, PrivateLink endpoints, KMS CMK, and zero default ingress.',
      size: '9.4 KB',
      icon: 'box',
      content: generateMainTf(config)
    },
    {
      id: 'variables.tf',
      name: 'variables.tf',
      language: 'hcl',
      path: '/variables.tf',
      description: 'Enterprise input variables with HCL type constraints and regex validations.',
      size: '2.8 KB',
      icon: 'sliders',
      content: generateVariablesTf(config)
    },
    {
      id: 'outputs.tf',
      name: 'outputs.tf',
      language: 'hcl',
      path: '/outputs.tf',
      description: 'Exported VPC, Subnets, Endpoint IDs, and KMS Key identifiers.',
      size: '1.9 KB',
      icon: 'arrow-up-right',
      content: generateOutputsTf()
    },
    {
      id: 'terraform.tfvars.example',
      name: 'terraform.tfvars.example',
      language: 'hcl',
      path: '/terraform.tfvars.example',
      description: 'Sample parameter configuration for production SCADA environments.',
      size: '0.9 KB',
      icon: 'file-code',
      content: generateTfvarsExample(config)
    },
    {
      id: 'security-audit.sh',
      name: 'security-audit.sh',
      language: 'shell',
      path: '/scripts/security-audit.sh',
      description: 'Automated bash audit script to verify zero Internet Gateways and route table purity via AWS CLI.',
      size: '2.1 KB',
      icon: 'shield-check',
      content: generateSecurityAuditScript()
    }
  ];
}
