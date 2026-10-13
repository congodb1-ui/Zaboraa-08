# Enterprise Multi-Cloud & Nutanix Architecture Blueprint Generator
## Revised Comprehensive Implementation Plan: End-to-End Workflow Integration

---

### Executive Summary & Objective
This revised plan directly resolves the five architectural requirements established by the user review:
1. **Single Source of Truth**: Eliminates conflicting/drifting state by establishing `topologyEnvironments` as the sole canonical authority for all node compute, storage, SKUs, CIDRs, and workloads, while deriving global aggregates dynamically.
2. **Track-Aware Rendering**: Distinct, platform-accurate visual models for **all nine architecture tracks** across the interactive canvas, static vector blueprint, and 4K export (not generic categories).
3. **Preservation of User Customizations**: Guards template switching with explicit confirmation modals that detect user modifications, and protects environment deletion with cascade link warnings.
4. **Accurate & Deterministic AI Generation**: Generates the 3D architecture blueprint prompt purely from verified configuration across all 4 steps (all tiers, SKUs, CIDRs, interconnect pipes, and DR SLAs) with strict prohibition against invented or placeholder values.
5. **Comprehensive Verification**: End-to-end automated test suite verifying all 4 workflow transitions, node coordinate preservation, 4K canvas export across all 9 tracks, AI prompt determinism, and existing storage data-integrity boundaries.

---

### 1. Single Source of Truth (SSOT) Architecture

#### 1.1 Root Problem in Current Code
Currently, `DesignGeneratorPage.tsx` maintains disjoint state variables:
- `vCenterCount`, `esxiHostCount`, `clusterCount`, `vdsCount`, `totalVMCount`, `nodeSku`, `mgmtCidrInput`, `decoupledStorageTB` exist as independent React states.
- Simultaneously, `topologyEnvironments: EnvironmentNode[]` maintains its own `hostCount`, `nodeSku`, `totalVcpu`, `totalRamGB`, `storageTB`, `cidrBlock`, and `vmCount`.
- Editing a value in Step 2 does not update Step 3, and changing a field in Step 3 does not update `topologyEnvironments`. This causes data conflicts, out-of-sync canvas cards, and split-brain exports.

#### 1.2 Canonical Unified State Model
- **`topologyEnvironments: EnvironmentNode[]`** is established as the **sole authoritative data store** for all infrastructure components across all tiers:
  - Source Datacenter / Clusters
  - Transit & Security Hubs / VPCs / VNets
  - Target Cloud SDDC / NC2 / Native VPCs / Secondary Clusters
- **Derived Global Metrics** (`useMemo`):
  ```ts
  const topologyMetrics = useMemo(() => {
    const totalHosts = topologyEnvironments.reduce((acc, e) => acc + (e.hostCount || 0), 0);
    const totalVMs = topologyEnvironments.reduce((acc, e) => acc + (e.vmCount || 0), 0);
    const totalVcpu = topologyEnvironments.reduce((acc, e) => acc + (e.totalVcpu || 0), 0);
    const totalRamGB = topologyEnvironments.reduce((acc, e) => acc + (e.totalRamGB || 0), 0);
    const totalStorageTB = topologyEnvironments.reduce((acc, e) => acc + (e.storageTB || 0), 0);
    const primaryTarget = topologyEnvironments.find(e => e.tier === 'target') || topologyEnvironments[1] || topologyEnvironments[0];
    const primarySource = topologyEnvironments.find(e => e.tier === 'source') || topologyEnvironments[0];
    return { totalHosts, totalVMs, totalVcpu, totalRamGB, totalStorageTB, primaryTarget, primarySource };
  }, [topologyEnvironments]);
  ```
- **Step 3 Two-Way Synchronization**:
  - In Step 3's **Tab 1 (Topology & Sizing)**, editing any environment directly calls:
    `handleUpdateNodeSpec(envId, { hostCount, nodeSku, totalVcpu, totalRamGB, storageTB, vmCount })`
  - In Step 3's **Tab 2 (Network & Subnets)**, editing CIDR blocks updates the environment's `cidrBlock` or `vlanSubnets` in `topologyEnvironments`. Target management CIDR updates `primaryTarget.cidrBlock`.
  - Global security settings (`connectivity`, `nvaFirewall`, `wafSolution`) and resilience parameters (`drEngine`, `drRpoMinutes`, `drRtoMinutes`, `drStrategy`) are bound to global architectural metadata, automatically reflected in the interconnect matrix and resilience models.
  - Zero redundant shadow states; any change made in Step 3 is immediately visible in Step 2 and Step 4 without page reload or desynchronization.

---

### 2. Track-Aware Rendering for All Nine Architecture Tracks

Mode 2 (Static Vector Blueprint) and `draw4KCanvas` (4K Export) will feature dedicated, platform-authentic rendering engines tailored specifically to each of the 9 tracks:

| # | Track ID | Track Name | Source Tier Representation | Transit & Security Tier | Target Tier Representation |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | `nutanix-onprem` | Nutanix On-Premises Private Cloud | Nutanix AOS Cluster (NX / Cisco / HPE nodes), Prism Central, AHV Hypervisor | L2/L3 ToR Leaf-Spine Switch Mesh, Flow Virtual Networking, Flow Microsegmentation | Secondary Nutanix AHV Cluster, Nutanix Files & Objects, Nutanix Mine Backup |
| **2** | `nutanix-to-nc2` | Nutanix On-Prem to NC2 on Azure | On-Prem Nutanix Cluster (AOS/AHV) managed by Prism Central | Azure ExpressRoute FastPath (10G), Azure Virtual WAN Hub, Flow Security Gateway | Nutanix Cloud Clusters (NC2) on Azure BareMetal (AN36P), Prism Central Federation, Azure Blob/NetApp |
| **3** | `vmware-to-nc2` | VMware to Nutanix NC2 Migration | Legacy VMware vSphere Datacenter (vCenter, ESXi, SAN/NAS LUNs) | Dedicated Migration Transport, Nutanix Move Appliance Pipe, Flow Virtual Networking | Nutanix Cloud Clusters (NC2), AHV Clustered Compute, Nutanix Volumes Storage |
| **4** | `avs` | Azure VMware Solution SDDC | VMware vSphere SDDC (vCenter, ESXi, SAN, HCX Connector) | Azure ExpressRoute FastPath, Azure vWAN Hub, NVA Firewall (Palo Alto/Fortinet/Azure FW), Azure WAF | Azure VMware Solution (AV36P/AV64), NSX-T Tier-0/1 ECMP, Azure NetApp Files (ANF) Datastores |
| **5** | `vmc-aws` | VMware Cloud on AWS | On-Prem VMware Datacenter (vCenter, ESXi, HCX Fleet) | AWS Direct Connect Gateway (10G), AWS Transit Gateway, Connected VPC ENI Interconnect | VMware Cloud on AWS (i4i.metal/i3en.metal), NSX-T SDDC, Amazon FSx for NetApp ONTAP |
| **6** | `gcve` | Google Cloud VMware Engine | On-Prem VMware SDDC (vCenter, ESXi, HCX Connector) | Google Cloud Dedicated Interconnect (10G), Cloud Router, Cloud Armor WAF | Google Cloud VMware Engine (ve1/ve2-standard), NSX-T Tier-0, Google Cloud NetApp Volumes |
| **7** | `aws-native` | AWS Native Multi-VPC Architecture | On-Prem Enterprise Datacenter / Branch Offices | AWS Direct Connect / Site-to-Site VPN, AWS Transit Gateway, AWS Network Firewall | Production AWS VPC (EKS/EC2 across 3 AZs), Shared Services VPC, S3 Glacier DR Replica |
| **8** | `gcp-native` | Google Cloud Shared VPC Architecture | Corporate Datacenter / Edge Locations | Google Cloud Partner Interconnect, Cloud Interconnect VLAN Attachment, Cloud IDS/IPS | GCP Shared VPC (Service Projects, Google Kubernetes Engine GKE, Cloud SQL HA, Cloud Storage Multi-Region) |
| **9** | `multi-cloud` | Multi-Cloud Nutanix & Hyperscaler Mesh | On-Prem Nutanix AOS/AHV Datacenter with Prism Element | Multi-Cloud Interconnect Backbone (Equinix / Megaport / Cloud Router mesh), Cloudflare Magic Transit WAF | Distributed Multi-Cloud Targets (Azure NC2 BareMetal + AWS Native VPC + S3/Blob Unified Storage Fabric) |

Each track will render genuine vendor nomenclature, hypervisor types, cluster management tiers, interconnect protocols, and storage fabrics rather than falling back to generic VMware abstractions.

---

### 3. Preserving User Customizations & Safe Workflow Transitions

#### 3.1 Template Switching Guardrail
- When the user selects a different track in Step 1:
  - System checks `hasUserCustomizations`:
    - Have environment node counts, SKUs, names, or CIDRs been altered from template defaults?
    - Have custom environments been added or deleted?
    - Have custom interconnect links been established?
  - If customizations exist, the app intercepts the switch and displays a **Template Switch Confirmation Modal**:
    - *"You have customized the current architecture topology (X environments, Y connections). Switching to [New Track] will reconfigure your canvas to the template default. Would you like to proceed or keep your customized architecture?"*
    - **Options**: `Keep My Customizations` (Cancel) or `Apply New Template Defaults` (Proceed).

#### 3.2 Environment Deletion & Cascade Protection
- In Step 2 and Step 4, when the user clicks to delete an environment node:
  - System checks for connected links in `interconnectLinks`.
  - If links exist, displays a **Delete Confirmation Modal**:
    - *"Removing [Environment Name] will sever X active interconnect link(s): [Link 1, Link 2]. Are you sure you want to delete this environment tier?"*
  - On confirmation, cascade deletion removes the node AND its associated `interconnectLinks` cleanly, preventing orphaned links or invalid Bézier curves.
  - Prevents accidental deletion of the last remaining environment tier (minimum of 1 environment always enforced).

#### 3.3 Coordinate Preservation During Step 3 Adjustments
- Node coordinates `(x, y)` on the interactive canvas are strictly preserved when the user edits parameters, node counts, SKUs, or CIDRs in Step 3.
- Canvas layout state maintains positions independently of sizing metrics, ensuring the architect's custom spatial arrangement is never rearranged when tweaking capacity.

---

### 4. Accurate, Deterministic AI Prompt Synthesis (Zero Invented Values)

The AI prompt generation engine (`buildIsometricDiagramPrompt`) will be completely rebuilt to enforce 100% technical accuracy with zero hallucinations or filler text:

#### 4.1 Strict Grounding Rules
- **Header**: Customer Organization (`customerName`), Lead Architect (`architectName`), Active Track ID and Name (`activeTemplate`).
- **Environment Tiers**: Every tier present in `topologyEnvironments` is listed with its:
  - Tier Classification (`Source`, `Transit`, `Target`, `Edge`)
  - Platform & Hypervisor (e.g., Nutanix AOS 6.5 / AHV, Azure VMware Solution ESXi 8.0, AWS Native EKS/VPC)
  - Region & Location
  - Node Count and Exact Hardware SKU (e.g., `4x Nutanix NX-8170-G9`, `6x Azure AV36P Bare-Metal`)
  - Workload Capacity: Total vCPUs, Total RAM GiB, Usable Storage TB, Allocated VM Count
  - Exact Subnet & Management CIDR Block (e.g., `10.240.0.0/22`)
- **Interconnect Mesh**: Every link in `interconnectLinks` is explicitly transcribed:
  - Source Node Name -> Target Node Name
  - Protocol (e.g. `10 Gbps Azure ExpressRoute FastPath`, `Nutanix Move Migration Stream`, `AWS Direct Connect 10G`, `VMware HCX L2 Network Extension`)
  - Redundancy mode (`Dual Redundant Active-Active` or `Single Uplink`)
- **Perimeter & Security Edge**:
  - Next-Gen Firewall (NVA): Exact selected model (`Palo Alto Networks VM-Series`, `Azure Firewall Premium`, `Fortinet FortiGate-VM`, etc.)
  - Perimeter WAF: Exact selected solution (`Azure WAF on App Gateway`, `Cloudflare Magic Transit`, `AWS WAF`, etc.)
  - Physical Transit Type (`Hybrid Direct Circuits`, `IPsec VPN Mesh`, `Dedicated Interconnect`)
- **Disaster Recovery & SLA Specification**:
  - Replication Engine: Exact engine (`Nutanix Protection Domains / NearSync`, `Nutanix Move`, `VMware SRM`, `VMware HCX`, `AWS DMS`)
  - Target RPO: Exact RPO minutes (e.g. `0-minute Synchronous Zero Data Loss` if 0, or `${drRpoMinutes}-minute RPO`)
  - Target RTO: Exact RTO minutes (e.g. `${drRtoMinutes}-minute RTO`)
  - DR Topology & Failover Orchestration: (`Warm Standby with Automated Orchestrated Runbook`)
- **Zero Hallucination Rule**: If a field is not configured (e.g., decoupled storage = 0 TB), the prompt outputs `No external decoupled storage configured (100% all-flash local NVMe)`, never inventing phantom SAN/NAS arrays.

---

### 5. Implementation Sequence & File Modifications

#### 5.1 `src/types/multiCloudBlueprint.ts`
- Enhance `ARCHITECTURE_TEMPLATES` with complete track-specific defaults for all 9 tracks (including dedicated Nutanix NX SKUs, NC2 BareMetal SKUs, AWS metal SKUs, and GCP ve SKUs).
- Add track-aware helper functions to format platform components, hypervisors, and storage types.

#### 5.2 `src/pages/tools/DesignGeneratorPage.tsx`
- **Single Source of Truth**: Replace independent SDDC inputs with `useMemo` aggregates and direct two-way bindings into `topologyEnvironments`.
- **Step 1 Template Switching**: Add `hasUserCustomizations` detection and confirmation modal.
- **Step 2 & 4 Deletion**: Add cascade deletion confirmation modal for environments with active interconnect links.
- **Step 3 Tabbed Inspector**:
  - Tab 1: Topology & Sizing (per-environment live node counts, hardware SKUs, compute, storage, and VM workload allocation).
  - Tab 2: Network & Subnets (management CIDR, environment CIDRs, interconnect links table, NVA firewall, WAF, VLAN subsegments).
  - Tab 3: DR & Resilience (track-aware DR replication engine, RPO slider, RTO slider, failover mode).
- **Step 4 Track-Aware Visual Engines**:
  - Mode 1 Canvas: auto-syncs cards with live node metrics and platform badges while preserving `(x, y)` coordinates.
  - Mode 2 Vector Blueprint: 9 dedicated layout branches rendering platform-specific components for all 9 tracks.
  - `draw4KCanvas`: 9 dedicated canvas drawing routines rendering true platform components for high-resolution PNG/JPEG exports.
  - `buildIsometricDiagramPrompt`: 100% deterministic prompt generator synthesizing all verified configuration parameters.
- **Storage Boundaries**: Retain strict isolation—zero `localStorage` writes on page loads, tab switches, node dragging, 4K canvas export, or AI diagram generation.

#### 5.3 Automated Verification Suite (`scripts/verify-workflow-integration.ts`)
- Build an end-to-end automated validation runner testing:
  1. All four workflow transitions (Step 1 -> 2 -> 3 -> 4 -> 1).
  2. Single source of truth consistency between Step 3 edits and Step 4 canvas.
  3. Node coordinate preservation during Step 3 parameter modifications.
  4. Template switch customization protection and cascade link deletion safety.
  5. Deterministic AI prompt synthesis verifying zero invented values across all 9 tracks.
  6. 4K canvas generation across all 9 tracks.
  7. Regression testing of all existing data integrity test cases (18/18).

---

### 6. Verification & Safety Protocol

1. **Compilation & Static Checks**: Run `compile_applet` and `lint_applet` to confirm 0 compilation errors and 0 lint warnings.
2. **Automated Integration Runner**: Execute `npx tsx scripts/verify-workflow-integration.ts` and `npx tsx scripts/verify-data-integrity.ts`.
3. **Protected Files**: No edits to `package.json`, `vite.config.ts`, `server.js`, `api/generate-blueprint.js`, or Firebase configs.
