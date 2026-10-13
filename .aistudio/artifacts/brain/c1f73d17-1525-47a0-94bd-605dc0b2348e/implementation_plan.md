# Enterprise Blueprint Engine: Inspector Synchronization, Infrastructure Review & Animated Video Generation

Consolidate enterprise multi-cloud configuration through a real-time tabbed inspector in Step 3, establish coordinate-preserving state propagation into the Step 4 interactive topology canvas with active node highlighting, provide a comprehensive side-by-side technical implementation specification during 3D blueprint review, and introduce dual-mode animated infrastructure video generation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through interactive clarification and define the core architecture of this release:

- **Confirmed Decision 1 (Video Generation Mode)**: Dual mode consisting of real-time client-side interactive canvas animation (animated packet flows, glowing gateway pulses, live metrics replay with media recording export) plus server-side AI video synthesis integration.
- **Confirmed Decision 2 (3D Review Layout)**: Side-by-side inspection panel directly alongside the 3D blueprint preview modal, detailing bill of materials, compute/memory/storage allocations, network subnets, routing policies, and disaster recovery SLA targets.
- **Confirmed Decision 3 (Step 3 to Step 4 Synchronization)**: Live bidirectional state synchronization with interactive canvas highlighting—mutations in Step 3 immediately reflect on Step 4 nodes and links while preserving all user-customized $(x, y)$ coordinates.

---

## 1. Overview & Core Concept

### What It Does
This release enhances the **Enterprise 4K Architecture & 3D Blueprint Engine** with four interconnected capabilities:
1. **Step 3 Tabbed Configuration Inspector**: A consolidated control center organizing multi-environment parameters into three focused operational domains: **Topology & Workload Sizing**, **Networking & Subnets**, and **Disaster Recovery & Resilience**.
2. **Coordinate-Preserving State Propagation**: A unified state pipeline where changes in host counts, SKUs, storage tiers, CIDR blocks, or DR engines instantly update the Step 4 Interactive Canvas and Static 4K vector blueprints without displacing dragged canvas coordinates. Selecting or editing an environment in Step 3 visually pulses and highlights the corresponding node on the Step 4 canvas.
3. **Comprehensive Infrastructure Specification in 3D Review**: Clicking "Generate and Review 3D Blueprint" renders both the visual schematic and a side-by-side implementation dossier detailing the exact deployment BOM, compute/storage metrics, transit routing rules, firewall policies, and operational runbook steps.
4. **Dual-Mode Animated Infrastructure Video Generator**: Gives users the choice between:
   - **Static 3D Isometric Blueprint (Image)**: 4K rendering via Gemini Flash Lite Image or bundled enterprise isometric schematic.
   - **Animated Infrastructure Video**: Real-time interactive canvas motion showing packet flow animations, failover convergence simulation, and AI-synthesized architectural flythrough.

### Target Audience & Persona
Enterprise Cloud Architects, Lead Migration Specialists, and Principal Infrastructure Engineers preparing migration strategies, executive briefings, and automated engineering runbooks across Nutanix, Azure AVS, AWS VMC, and Google Cloud GCVE.

### Key Value
Eliminates disjointed state management, ensures strict coordinate preservation during iterative architectural tuning, provides executive-ready deployment specs alongside schematics, and enables compelling animated presentations for cloud migration reviews.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Step 3 Tabbed Inspector & Live Step 4 Canvas Sync
1. The architect scrolls to **Step 3: Configuration Inspector**.
2. Clicking between **Topology & Sizing**, **Network & Subnets**, or **DR & Resilience** reveals dedicated edit cards for each active environment and link.
3. When the user modifies a parameter (e.g., increasing host count from 4 to 8 or updating a CIDR block from `10.240.0.0/22` to `10.242.0.0/21`), the change is instantly reflected across:
   - Step 3 aggregate capacity metric badges (vCPU, RAM, Storage).
   - Step 4 Interactive Canvas nodes (live labels, capacity bars, and node tags).
   - Step 4 Static 4K vector blueprint canvas.
4. Focusing or hovering an environment card in Step 3 highlights the corresponding node on the Step 4 canvas with a glowing cyan focus ring and smooth center-pan cue.

#### Flow B: Generate and Review 3D Blueprint with Side-by-Side Implementation Dossier
1. The architect clicks **Generate and Review 3D Blueprint**.
2. A dual-column modal opens:
   - **Left Column (Visual Blueprint)**: The high-resolution 3D isometric diagram with zoom, pan, full-screen toggle, and direct download.
   - **Right Column (Implementation Specification Dossier)**: A dense, scannable technical breakdown with collapsible sections:
     - *Executive Summary & Project Scope*: Client name, lead architect, timestamp, and target architecture track.
     - *Host Cluster & Sizing BOM*: Precise node SKUs, host counts, hypervisor cores, and usable TB.
     - *Network Architecture & CIDR Plan*: Management subnets, gateway configurations, MTU specifications, and interconnect links.
     - *Disaster Recovery & Replication*: RPO/RTO SLAs, replication engine, and failover network bubbles.
     - *Estimated Cloud Cost & Resource Footprint*: High-level monthly compute/storage tier estimates.
     - *Action Bar*: Copy JSON specification, download Markdown runbook, or export BOM spreadsheet.

#### Flow C: Animated Video vs. Image Blueprint Selection
1. In the generation toolbar, the user sees a segmented dual-action toggle:
   - **3D Blueprint Image**
   - **Animated Architecture Video**
2. When **Animated Video** is selected:
   - The user can configure animation parameters (e.g., packet speed, active failover simulation, flow intensity).
   - Clicking **Generate Animated Video** opens the interactive player displaying dynamic particle streams along interconnect paths, pulsing firewall gateways, and live telemetry ticker overlays.
   - The user can play/pause, scrub through time, trigger simulated site failovers, and record/download an animated `.webm` / `.mp4` clip.

### Visual Identity & Layout Ergonomics (SaaS Dashboard Standard)
- **Palette**: Dark slate substrate (`#020617` and `#0b0f19`) with cyan (`#06b6d4`), emerald (`#10b981`), and royal cobalt (`#38bdf8`) accents.
- **Typography**: Display titles in `Plus Jakarta Sans` with numeric metrics, CIDR blocks, and capacity counters in tabular monospace (`JetBrains Mono`, `tabular-nums`).
- **Metadata Discipline**: Clean, unboxed text separators (`·`, `/`) without gratuitous pill tags.
- **Layout Rhythm**: Clear borders (`border-slate-800`), $16\text{px}$ inner container paddings, responsive grids that adapt gracefully from $1280\text{px}$ down to mobile viewports.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Single Canonical Topology State as Single Source of Truth (SSOT)
- **Chosen Approach**: All environments and interconnects reside in `topologyEnvironments` and `interconnectLinks`. Step 2 (Environment Builder), Step 3 (Tabbed Inspector), and Step 4 (Interactive Canvas) read from and write to this single state.
- **Why**: Eliminates stale copies or drift between upstream inputs and downstream canvases. Edits in Step 3 propagate immediately to Step 4 without requiring manual save or sync actions.
- **Alternatives Considered**: Staging changes in a local Step 3 buffer with a manual "Apply to Canvas" button. Rejected based on user confirmation for real-time live synchronization.

### Decision 2: Coordinate-Preserving Node Updates
- **Chosen Approach**: The updater function `handleUpdateNodeSpec(envId, partial)` merges property patches while strictly keeping the existing `x` and `y` coordinates of each environment node.
- **Why**: When users manually drag nodes in Step 4 to arrange custom topologies, editing a SKU or host count in Step 3 must never reset or recalculate their layout positions.

### Decision 3: Side-by-Side Review Modal with Responsive Split
- **Chosen Approach**: In viewports $\ge 1024\text{px}$, the review modal renders as a 50/50 split (left: interactive schematic viewport; right: scrollable implementation dossier). On smaller screens, it smoothly folds into stacked tabs.
- **Why**: Maximizes situational awareness by allowing engineers to inspect technical parameters while directly examining visual connectivity.

### Decision 4: Dual-Engine Animated Video Pipeline
- **Chosen Approach**: Combine a high-performance client-side HTML5 Canvas animation engine (with MediaRecorder export for instant 60fps WebM/MP4 downloads) alongside a server-side AI video generation endpoint wired to the `@google/genai` Veo video model.
- **Why**: Guarantees instant, zero-latency animated playback and downloads in any sandbox or preview environment, while enabling advanced cloud-rendered architectural flythroughs when an API key is available.

---

## 4. Technical Architecture & Data Strategy

### System Component & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DesignGeneratorPage                             │
│                     (Canonical Topology State)                         │
│                                                                        │
│  • activeTemplate: ArchitectureTemplateId                              │
│  • topologyEnvironments: EnvironmentNode[] (incl. x, y coordinates)     │
│  • interconnectLinks: InterconnectLink[]                               │
│  • highlightedNodeId: string | null                                    │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
        Bidirectional Updates              Read / Highlight Event
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│     Step 3: Tabbed Inspector        │  │   Step 4: Topology Canvas    │
│                                      │  │                              │
│  [Tab 1: Topology & Sizing]          │  │  • Interactive Canvas (SVG)  │
│    • Host Count, SKU, Storage, VMs   │  │  • Preserved (x,y) Positions │
│  [Tab 2: Network & Subnets]          │  │  • Dynamic Node Spec Cards   │
│    • CIDR Blocks, Gateways, MTU      │  │  • Active Highlight Ring     │
│  [Tab 3: DR & Resilience]            │  │  • Interconnect Data Flows   │
│    • RPO/RTO, Engines, Standby Mode  │  │  • 4K Static Vector Canvas   │
└──────────────────────────────────────┘  └──────────────────────────────┘
                    │                               ▲
                    └───────────────┬───────────────┘
                                    │
                   "Generate & Review 3D Blueprint"
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Blueprint3DReviewModal                             │
│                                                                        │
│ ┌──────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │  Visual Schematic / Video View   │ │ Implementation Dossier Panel  │ │
│ │                                  │ │                               │ │
│ │  • 3D Isometric Image Blueprint  │ │  • Cluster & Compute BOM      │ │
│ │  • Animated Video Canvas Stream  │ │  • Network & Routing Scheme   │ │
│ │  • Particle Flow Animation       │ │  • Disaster Recovery SLA      │ │
│ │  • MediaRecorder MP4/WebM Export │ │  • JSON & Markdown Export     │ │
│ └──────────────────────────────────┘ └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### State Propagation Contract
```typescript
interface EnvironmentNode {
  id: string;
  name: string;
  platform: CloudPlatformType;
  role: EnvironmentRole;
  region: string;
  hostCount: number;
  nodeSku: string;
  totalVcpu: number;
  totalRamGB: number;
  storageTB: number;
  cidrBlock: string;
  connectedEnvironmentIds: string[];
  tier: 'source' | 'transit' | 'target';
  x: number; // MUST BE PRESERVED ON ALL SPEC MUTATIONS
  y: number; // MUST BE PRESERVED ON ALL SPEC MUTATIONS
  notes?: string;
  vmCount?: number;
}
```

- When editing any property in Step 3 via `handleUpdateNodeSpec(id, partial)`:
  1. The array `topologyEnvironments` is mapped to replace the matching item with `{ ...existing, ...partial }`.
  2. `x` and `y` are untouched.
  3. If `hostCount` or `nodeSku` changes, `totalVcpu` and `totalRamGB` automatically recalculate using platform-specific hardware ratios.
  4. Setting `highlightedNodeId` during input focus in Step 3 triggers an animated pulse ring on the corresponding Step 4 node.

### Implementation Checklist
- [ ] Refactor Step 3 tabbed inspector into modular tabs (**Topology**, **Networking**, **DR**) with rich inline field controls and validation.
- [ ] Connect `onFocus` and `onHover` in Step 3 to `setHighlightedNodeId` with synchronized CSS pulse styling on Step 4 canvas nodes.
- [ ] Verify that coordinate positions `(x, y)` in `handleUpdateNodeSpec` remain strictly preserved across all edits.
- [ ] Expand the 3D Blueprint Review modal into a side-by-side split container featuring the detailed infrastructure implementation breakdown.
- [ ] Implement the dual-mode video generator:
  - Interactive canvas simulation engine with particle flows, speed controls, and `MediaRecorder` video export (`.webm`/`.mp4`).
  - Server-side AI video synthesis trigger integration (`/api/generate-blueprint` or `/api/generate-video`).
- [ ] Run automated compile and lint verification to guarantee error-free execution.
