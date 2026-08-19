# aws-zero-trust-infra

[![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.5.0-844FBA?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS Provider](https://img.shields.io/badge/AWS%20Provider-%3E%3D5.0.0-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://registry.terraform.io/providers/hashicorp/aws/latest)
[![Security Architecture](https://img.shields.io/badge/Security-Zero--Trust%20%7C%20Air--Gapped-00C853?style=flat-square&logo=shield&logoColor=white)](#architecture-highlights)
[![Compliance](https://img.shields.io/badge/Compliance-IEC%2062443--3--3%20%7C%20NIST%20800--82r3-0052CC?style=flat-square)](#compliance--industrial-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Enterprise Infrastructure-as-Code (IaC)** boilerplate engineered by **Cestrix Group Heavy Industries** for provisioning mathematically isolated, strictly air-gapped, zero-trust serverless execution perimeters on Amazon Web Services (AWS).

---

## 🏛️ Executive Overview

The `aws-zero-trust-infra` blueprint provides an uncompromised, zero-trust cloud landing zone tailored for **Industrial Control Systems (ICS)**, **Supervisory Control and Data Acquisition (SCADA)** telemetry ingestors, and heavy engineering robotics backends.

By removing all public internet routing components at the foundational networking layer, this architecture enforces a deterministic air-gap between AWS resources and the public Internet. Communication between serverless runtimes (AWS Lambda / AWS Fargate) and internal AWS managed services is conducted exclusively across dedicated **AWS PrivateLink** interface endpoints and **Gateway VPC Endpoints**.

```
+-----------------------------------------------------------------------------------+
|                            AWS REGION: US-EAST-1                                  |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |  STRICTLY AIR-GAPPED VPC (10.100.0.0/16)                                  |   |
|   |  * NO Internet Gateway (IGW)         * NO NAT Gateway                     |   |
|   |  * NO Egress-Only IGW                * Zero Ingress Default Security Group|   |
|   |                                                                           |   |
|   |   +-----------------------+  +-----------------------+  +-------------+   |   |
|   |   | Isolated Subnet A     |  | Isolated Subnet B     |  | Subnet C    |   |   |
|   |   | 10.100.1.0/24         |  | 10.100.2.0/24         |  | ...         |   |   |
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
```

---

## ⚡ Architecture Highlights

### 1. Absolute Network Isolation (Zero Ingress / Zero Egress)
- **No Internet Gateway (IGW):** Prevents any bidirectional route between subnets and public internet IP spaces (`0.0.0.0/0`).
- **No NAT Gateway / Egress Proxies:** Ensures internal workloads cannot dial out to unauthorized external endpoints.
- **Strict Isolated Route Tables:** Subnet route tables contain only local VPC CIDR routes (`10.100.0.0/16`) and deterministic prefix lists for Gateway VPC Endpoints.

### 2. PrivateLink & Gateway VPC Endpoints
- **Amazon S3 Gateway Endpoint:** Direct routing from isolated subnets to S3 object storage without network transit hops or internet gateways.
- **Amazon DynamoDB Gateway Endpoint:** Low-latency, private, IAM-governed table transactions.
- **Interface VPC Endpoints:** Dedicated Elastic Network Interfaces (ENIs) inside the isolated subnets providing private API access to:
  - **AWS KMS** (`com.amazonaws.us-east-1.kms`) for sub-millisecond hardware cryptographic operations.
  - **CloudWatch Logs** (`com.amazonaws.us-east-1.logs`) for immutable audit telemetry.
  - **AWS STS** (`com.amazonaws.us-east-1.sts`) for temporary credential issuance under role assumption.

### 3. AWS KMS Customer Managed Keys (CMK)
- Dedicated asymmetric/symmetric envelope encryption key with **automated 365-day rotation**.
- Restrictive key policies enforcing zero-trust service principals and explicit IAM boundary condition keys.

### 4. Default Security Group Hardening & Zero-Inbound Policy
- The VPC default security group is managed and neutralized—**all inbound ingress rules and egress rules are completely removed**.
- Dedicated, application-specific security groups enforce least-privilege East-West isolation across isolated subnets.

### 5. Full VPC Flow Logs Telemetry
- Immutable VPC Flow Logs capturing `ALL` traffic transactions, delivered to encrypted CloudWatch Log Groups with a **365-day retention policy**.

---

## 📂 Repository Structure

```
aws-zero-trust-infra/
├── main.tf                    # Core VPC, Subnets, Endpoints, KMS, and Security Groups
├── variables.tf               # Configurable parameters, CIDR blocks, and environment tags
├── outputs.tf                 # Exported VPC IDs, Subnet IDs, and KMS Key ARNs
├── terraform.tfvars.example   # Sample input values for enterprise staging/production
└── README.md                  # System architecture, compliance, and deployment guide
```

---

## 🚀 Usage Instructions

### Prerequisites
- **Terraform:** `>= 1.5.0`
- **AWS CLI:** `>= 2.11.0` configured with authorized IAM credentials or AWS IAM Identity Center (SSO).
- **Target AWS Permissions:** `ec2:*`, `kms:*`, `logs:*`, `iam:CreateServiceLinkedRole` restricted by permissions boundaries.

### Step 1: Clone and Initialize
```bash
git clone https://github.com/cestrix-group/aws-zero-trust-infra.git
cd aws-zero-trust-infra

# Initialize Terraform AWS provider and state backend
terraform init
```

### Step 2: Configure Environment Variables
Copy the example variables file and adjust parameters according to your network addressing plan:
```bash
cp terraform.tfvars.example terraform.tfvars
```

Example `terraform.tfvars`:
```hcl
aws_region   = "us-east-1"
environment  = "production"
project_name = "scada-core"
vpc_cidr     = "10.100.0.0/16"
private_subnet_cidrs = [
  "10.100.1.0/24",
  "10.100.2.0/24",
  "10.100.3.0/24"
]
enable_flow_logs = true
```

### Step 3: Validate and Plan
```bash
# Validate HCL syntax and internal structural consistency
terraform validate

# Perform speculative dry-run execution plan
terraform plan -out=scada-zerotrust.tfplan
```

### Step 4: Apply Infrastructure
```bash
# Apply targeted infrastructure with strict state locks
terraform apply "scada-zerotrust.tfplan"
```

---

## 🛡️ Verification & Security Audit

After deployment, verify that no public gateway routes exist and that endpoints are properly attached:

```bash
# 1. Verify NO Internet Gateway is attached to the VPC
aws ec2 describe-internet-gateways \
  --filters "Name=attachment.vpc-id,Values=$(terraform output -raw vpc_id)" \
  --query "InternetGateways"

# 2. Verify all Route Tables lack 0.0.0.0/0 egress routes
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=$(terraform output -raw vpc_id)" \
  --query "RouteTables[*].Routes[?DestinationCidrBlock=='0.0.0.0/0']"

# 3. Verify Active VPC Endpoints
aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=$(terraform output -raw vpc_id)" \
  --query "VpcEndpoints[*].{ServiceName:ServiceName,Type:VpcEndpointType,State:State}"
```

---

## 📋 Compliance & Industrial Standards

| Standard / Framework | Requirement Clause | Implementation Mechanism |
| :--- | :--- | :--- |
| **IEC 62443-3-3** | SR 5.1 / SR 5.2 (Network Segmentation & Zone Isolation) | Isolated private subnets, absence of IGW/NAT, strict security group boundaries |
| **NIST SP 800-82r3** | ICS Network Architecture & Boundary Protection | Air-gapped VPC architecture, AWS PrivateLink micro-segmentation |
| **CIS AWS Benchmark v3.0** | 4.3 (VPC Flow Logs enabled on all VPCs) | Integrated `aws_flow_log` with dedicated CloudWatch audit log groups |
| **CIS AWS Benchmark v3.0** | 2.8 (KMS Customer Managed Key Rotation) | Enabled `enable_key_rotation = true` on SCADA CMK |
| **Purdue Model (ISA-95)** | Level 3/4 Boundary Protection | Restricts all cloud-ingested SCADA signals within air-gapped VPC interfaces |

---

## 📄 License

Distributed under the **MIT License**. Maintained by the **Cestrix Group Cloud SecOps Architecture Team**.
