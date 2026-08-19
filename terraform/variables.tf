/**
 * # AWS Zero-Trust Air-Gapped Infrastructure-as-Code
 * # Variable Definitions (variables.tf)
 * #
 * # Organization: Cestrix Group Heavy Industries
 * # Classification: Mission-Critical-HeavyEngineering
 */

variable "aws_region" {
  type        = string
  description = "Target AWS Region for air-gapped SCADA infrastructure deployment."
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.aws_region))
    error_message = "The aws_region variable must follow standard AWS region naming conventions (e.g. us-east-1, eu-central-1)."
  }
}

variable "environment" {
  type        = string
  description = "Target workload deployment environment tier (e.g. production, staging, disaster-recovery)."
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "disaster-recovery"], var.environment)
    error_message = "The environment variable must be one of: 'production', 'staging', 'disaster-recovery'."
  }
}

variable "project_name" {
  type        = string
  description = "Unique project/workload namespace identifier for resource naming and tagging."
  default     = "scada-core"
}

variable "vpc_cidr" {
  type        = string
  description = "Top-level IPv4 CIDR block allocation for the air-gapped VPC perimeter."
  default     = "10.100.0.0/16"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr))
    error_message = "The vpc_cidr value must be a valid IPv4 CIDR block expression (e.g. 10.100.0.0/16)."
  }
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "List of isolated private subnet CIDR blocks, distributed across distinct Availability Zones."
  default     = [
    "10.100.1.0/24",
    "10.100.2.0/24",
    "10.100.3.0/24"
  ]

  validation {
    condition     = length(var.private_subnet_cidrs) >= 2
    error_message = "At least 2 isolated private subnets are required to ensure Multi-AZ fault tolerance."
  }
}

variable "enable_flow_logs" {
  type        = bool
  description = "Flag to enable high-frequency CloudWatch VPC Flow Logs for ingress/egress rejection monitoring."
  default     = true
}

variable "flow_logs_retention_days" {
  type        = number
  description = "Log retention period (in days) for VPC Flow Logs in CloudWatch."
  default     = 365

  validation {
    condition     = contains([30, 60, 90, 180, 365, 730, 1827, 3653], var.flow_logs_retention_days)
    error_message = "Retention period must match AWS CloudWatch supported retention tiers (e.g. 90, 180, 365, 730)."
  }
}

variable "enable_interface_endpoints" {
  type        = bool
  description = "Flag to provision AWS PrivateLink interface endpoints for KMS, CloudWatch Logs, and STS."
  default     = true
}

variable "enable_kms_rotation" {
  type        = bool
  description = "Enable automatic annual cryptographic key rotation for the Customer Managed Key (CMK)."
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Standard resource tags applied across all deployed air-gapped infrastructure."
  default = {
    Owner              = "DeepTech-Cloud-SecOps"
    DataClassification = "Mission-Critical-HeavyEngineering"
    AirGappedIsolation = "Strict"
    AuditCompliance    = "IEC-62443-3-3 / NIST-SP-800-82r3"
  }
}
