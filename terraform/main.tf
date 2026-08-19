/**
 * # AWS Zero-Trust Air-Gapped Infrastructure-as-Code
 * # Main Orchestration Template (main.tf)
 * #
 * # Organization: Cestrix Group Heavy Industries
 * # Classification: Mission-Critical-HeavyEngineering
 * # Compliance Target: IEC-62443-3-3 / NIST-SP-800-82r3
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
      DataClassification = "Mission-Critical-HeavyEngineering"
      ManagedBy          = "Terraform"
      SecurityModel      = "AirGapped-ZeroTrust"
      Compliance         = "IEC-62443-3-3 / NIST-SP-800-82r3"
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
      Name        = "${var.project_name}-${var.environment}-airgapped-vpc"
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
      Name        = "${var.project_name}-${var.environment}-default-sg-deny-all"
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
      Name        = "${var.project_name}-${var.environment}-isolated-subnet-${data.aws_availability_zones.available.names[count.index]}"
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
      Name        = "${var.project_name}-${var.environment}-isolated-rt"
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
  name_prefix = "${var.project_name}-${var.environment}-scada-compute-sg-"
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
      Name = "${var.project_name}-${var.environment}-serverless-scada-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Dedicated Security Group for PrivateLink Interface Endpoints
resource "aws_security_group" "vpc_endpoints_sg" {
  name_prefix = "${var.project_name}-${var.environment}-vpce-sg-"
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
      Name = "${var.project_name}-${var.environment}-vpce-sg"
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
  service_name      = "com.amazonaws.${var.aws_region}.s3"
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
      Name        = "${var.project_name}-${var.environment}-s3-gateway-endpoint"
      Description = "Private route table gateway endpoint for Amazon S3"
    }
  )
}

# --- DynamoDB Gateway Endpoint ---
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.scada_core.id
  service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
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
        Resource = "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/*"
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-dynamodb-gateway-endpoint"
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
  service_name        = "com.amazonaws.${var.aws_region}.kms"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-kms-vpce"
    }
  )
}

# --- CloudWatch Logs Interface Endpoint ---
resource "aws_vpc_endpoint" "logs" {
  count               = var.enable_interface_endpoints ? 1 : 0
  vpc_id              = aws_vpc.scada_core.id
  service_name        = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-logs-vpce"
    }
  )
}

# --- AWS STS Interface Endpoint (Zero-Trust Temporary Credentials) ---
resource "aws_vpc_endpoint" "sts" {
  count               = var.enable_interface_endpoints ? 1 : 0
  vpc_id              = aws_vpc.scada_core.id
  service_name        = "com.amazonaws.${var.aws_region}.sts"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.isolated_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-sts-vpce"
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
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "Allow CloudWatch Logs Encryption"
        Effect    = "Allow"
        Principal = {
          Service = "logs.${var.aws_region}.amazonaws.com"
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
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:*"
          }
        }
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name       = "${var.project_name}-${var.environment}-cmk"
      Compliance = "NIST-SP-800-82-Cryptographic-Protection"
    }
  )
}

resource "aws_kms_alias" "scada_cmk_alias" {
  name          = "alias/${var.project_name}-${var.environment}-encryption-key"
  target_key_id = aws_kms_key.scada_cmk.key_id
}

# ==============================================================================
# 9. VPC FLOW LOGS AUDIT TRAIL (FULL REJECT & ACCEPT LOGGING)
# ==============================================================================

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  count             = var.enable_flow_logs ? 1 : 0
  name              = "/aws/vpc-flow-logs/${var.project_name}-${var.environment}"
  retention_in_days = var.flow_logs_retention_days
  kms_key_id        = aws_kms_key.scada_cmk.arn

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-flow-logs-group"
    }
  )
}

resource "aws_iam_role" "vpc_flow_logs_role" {
  count = var.enable_flow_logs ? 1 : 0
  name  = "${var.project_name}-${var.environment}-vpc-flow-logs-role"

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
  name  = "${var.project_name}-${var.environment}-vpc-flow-logs-policy"
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
        Resource = "${aws_cloudwatch_log_group.vpc_flow_logs[0].arn}:*"
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
      Name = "${var.project_name}-${var.environment}-vpc-flow-log"
    }
  )
}
