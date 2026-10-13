# Milestone 2 — Interactive Multi-Cloud Architecture Canvas & Data Integrity Plan (Revised)

## Executive Summary
Milestone 2 evolves the **Enterprise Multi-Cloud & Nutanix Architecture Blueprint Generator** into an **Interactive Multi-Cloud Architecture Canvas** with multi-tier grid dragging, interactive click-to-connect interconnect drawing, expanded 9-track architecture templates, and bulletproof environment validation.

This revised plan strictly addresses the three requested corrections:
1. **Audit Before Fixing**: The implementation agent must inspect actual repository code and report line-by-line evidence before treating any defect as confirmed. If repository access is unavailable, findings must be marked unverified. No invented audit results. Only the smallest necessary fixes are permitted.
2. **Resolve Legacy-Sync Triggers**: Legacy `localStorage` synchronization is strictly permitted **only** on explicit **Save Blueprint** and **Export Blueprint / BOM** actions. 4K PNG/JPEG exports and AI 3D Blueprint generation must remain functional without unintended storage writes. No writes on page load or tab switches. Auditing Save and Export individually; requiring explicit user approval before adding any additional action as a legacy-sync trigger.
3. **Three Distinct, Non-Overlapping Phases**:
   - **Phase 1**: Real-repo code audit and data-integrity fixes. Run automated tests and report verified results before touching canvas code.
   - **Phase 2**: Interactive multi-cloud canvas and validation improvements (Add Environment form validation, Step 1 track expansion, interactive canvas nodes and click-to-connect drawing, explicit sync).
   - **Phase 3**: Verification, regression testing, and sign-off report. Verify that existing SVG, 4K Canvas, AI 3D modal, BOM export, authentication, storage, and protected files (`vite.config.ts`, `package.json`, etc.) remain intact. No code pushes or deployments without explicit approval.

---

## 1. Mandatory Audit-Before-Fixing Protocol & Verified Evidence

> **AGENT DIRECTIVE**: The implementation agent must independently inspect actual source code and produce line-by-line evidence before implementing any fix. If repository access is unavailable or files cannot be read, findings must be marked **UNVERIFIED**. No assumptions or synthetic results are permitted. Only apply the smallest safe change necessary.

### Finding 1: RVTools VM Count Recalculation (CONFIRMED IN CODE)
- **File**: `src/types/multiCloudBlueprint.ts`
- **Lines**: 647, 661, 675
- **Verified Code Evidence**:
  ```ts
  totalVMs: Math.round((env0?.totalVcpu || 760) / 2.5)
  ```
- **Analysis**:
  In `writebackLegacyStorage()`, `totalVMs` is recalculated using an assumed 2.5 vCPU-per-VM divisor. When an RVTools inventory with non-standard ratios (e.g., 500 VMs with 800 vCPUs) is imported, saving overwrites `totalVMs` to 320 instead of preserving 500.
- **Smallest Necessary Fix**:
  1. Add optional `vmCount?: number` to `EnvironmentNode`.
  2. In `hydrateLegacyStorageState()`, populate `vmCount: resolvedVMs`.
  3. In `writebackLegacyStorage()`, prioritize `env0?.vmCount ?? rawBlueprintState?.totalVMs ?? rawSizingExport?.vms ?? rawDrExport?.vms` before falling back to any ratio estimate.

### Finding 2: Destructive Legacy Storage Writeback & Unknown Field Loss (CONFIRMED IN CODE)
- **Files**: `src/types/multiCloudBlueprint.ts` (lines 641–681) & `src/pages/tools/DesignGeneratorPage.tsx` (line 235)
- **Verified Code Evidence**:
  - In `DesignGeneratorPage.tsx` L235: `handlePersistLegacyState` passes `importedLegacyContext: {}`.
  - In `multiCloudBlueprint.ts` L641–681: `writebackLegacyStorage()` constructs brand-new objects and serializes them without re-reading existing `localStorage` contents. Any additional or custom attributes present in `zaboraa_4k_blueprint_state`, `zaboraa_dr_export`, or `zaboraa_sizing_export` (e.g. `vlans`, `limitingDriver`, `storagePolicy`, custom metadata) are erased on writeback.
- **Smallest Necessary Fix**:
  1. Maintain `importedLegacyContext` in component state populated during initial hydration.
  2. In `writebackLegacyStorage()`, read and parse existing `localStorage` keys directly and perform a non-destructive object merge (`{ ...existingLegacyObject, ...updatedFields }`) that guarantees unknown legacy fields are fully preserved.

### Finding 3: Zero-Value & Synchronous SLA Overwrite (CONFIRMED IN CODE)
- **File**: `src/types/multiCloudBlueprint.ts` (lines 520–527, 570–576)
- **Verified Code Evidence**:
  - `decoupledStorageTB: legacySizing.storageTB || 120` — falsy check replaces valid `0` with `120`.
  - `rpoMin: legacyDr.rpoMin || 15` — falsy check replaces synchronous DR (`0` min) with `15`.
- **Smallest Necessary Fix**:
  - Replace falsy checks with explicit numeric checks: `(typeof val === 'number' && !isNaN(val) && val >= 0) ? val : fallback`.

### Finding 4: Automated Test Runner Gap (CONFIRMED IN CODE)
- **Verified Evidence**: `package.json` contains no unit test script (only `tsc --noEmit` via `lint`).
- **Smallest Necessary Fix**:
  - Implement a dedicated test script `scripts/verify-data-integrity.ts` executed via `npx tsx scripts/verify-data-integrity.ts`.
  - Do NOT modify `package.json`.

---

## 2. Strict Legacy Storage Synchronization Boundaries

Per explicit user requirement:
1. **Permitted Legacy-Sync Triggers (Strictly Limited To Two Actions)**:
   - User explicitly clicks **Save Blueprint** (`handleSaveBlueprintState`)
   - User explicitly clicks **Export Blueprint (JSON)** or **Export Bill of Materials (Excel)**
2. **Prohibited From Triggering Legacy Sync**:
   - Initial page mount / hydration (`useEffect`)
   - Tab switching or design track selection
   - Interactive canvas node dragging, panning, or zooming
   - Interconnect link creation, editing, or deletion
   - Add Environment or Edit Environment form typing and submission
   - **Export 4K PNG / JPEG**: Canvas capture must download high-resolution graphics with zero `localStorage` writes
   - **Generate 3D Architecture Blueprint**: AI 3D modal must generate and display visualizations with zero `localStorage` writes
3. **Strict Approval Protocol for Additional Triggers**:
   - Save and Export actions must be audited individually.
   - Any addition of a new legacy storage sync trigger requires explicit written authorization from the user. No automatic or silent expansion is permitted.

---

## 3. Scope of Proposed Code Modifications & Protected Files

### Files Proposed for Modification
1. `src/types/multiCloudBlueprint.ts`:
   - Add `vmCount?: number`, `tier?: 'source' | 'transit' | 'target' | 'edge'`, `x?: number`, `y?: number` to `EnvironmentNode`.
   - Define `InterconnectLink` interface (`id`, `sourceId`, `targetId`, `protocol`, `bandwidthGbps`, `status`, `notes`).
   - Implement non-destructive `hydrateLegacyStorageState()` and `writebackLegacyStorage()` with direct `localStorage` deep-merge and zero-value guards.
2. `scripts/verify-data-integrity.ts` *(New verification script)*:
   - Self-contained test runner verifying VM count preservation, zero-value retention, unknown legacy key preservation, malformed JSON handling, and repeated load-save-load idempotence.
3. `src/pages/tools/DesignGeneratorPage.tsx`:
   - **Step 1 Architecture Tracks**: Expand to 9 selectable tracks with category filter tabs (`All Tracks`, `Nutanix & Hybrid`, `Hyperscaler SDDC`, `Cloud Native`, `Migration`), vendor badge accents, and initial node pre-population.
   - **Step 2 Custom Environment Validation**: Trimmed name requirement, case-insensitive duplicate check, CIDR notation validation, positive integer checks, inline error hints, and disabled button state until valid.
   - **Step 4 Interactive Multi-Cloud Canvas**: Multi-tier grid auto-alignment, interactive node dragging, interactive click-to-connect interconnect drawing and protocol modal, node spec inspector drawer, and preserved static 4K vector view.
   - **Sync Boundary Wiring**: Wire `writebackLegacyStorage()` strictly and exclusively to explicit **Save Blueprint** and **Export Blueprint / BOM** actions.

### Protected Files Confirmed Untouched
The following production files, server endpoints, and services will **NEVER** be modified:
- `package.json`
- `vite.config.ts`
- `vercel.json`
- `api/generate-blueprint.js`
- `src/services/firebaseAuth.ts`
- `src/services/storageService.ts`
- `src/context/AuthContext.tsx`
- 4K Canvas rendering pipeline (`draw4KCanvas`)
- BOM Excel generation logic (`handleExportBOMExcel`)

---

## 4. Three-Phase Implementation Workflow

```
[PLAN REVIEW & USER APPROVAL]
       │
       ▼ (Upon User Sign-Off)
[PHASE 1: Real-Repo Code Audit & Data-Integrity Fixes]
       │  • Implement minimal writeback and hydration fixes
       │  • Create scripts/verify-data-integrity.ts
       │  • Run: npx tsx scripts/verify-data-integrity.ts
       │  • Report actual pass/fail test output BEFORE touching canvas
       ▼
[PHASE 2: Interactive Multi-Cloud Canvas & Validation Improvements]
       │  • Step 1 Track Expansion (9 tracks, category tabs, vendor styling)
       │  • Add Environment Form Validation (name uniqueness, CIDR, integer hosts)
       │  • Multi-Tier Grid Auto-Alignment & Interactive Node Dragging
       │  • Interactive Click-to-Connect Drawing & Link Modal
       │  • Explicit Sync Wiring (Save Blueprint & Export Blueprint/BOM ONLY)
       ▼
[PHASE 3: Verification, Regression Testing, & Sign-Off Report]
       │  • Run full regression test suite (data integrity, build, lint)
       │  • Verify 4K Canvas, SVG export, AI 3D modal, BOM, Auth, Storage intact
       │  • Verify protected files unchanged
       │  • Present exact code diffs and test logs
       │  • STOP and wait for User Approval (NO push, NO deploy)
```

### Detailed Phase Breakdown

### Phase 1: Real-Repo Code Audit & Data-Integrity Fixes
- **Goal**: Resolve all confirmed data-integrity defects with the smallest possible change footprint and prove correctness with automated tests before touching any UI or canvas code.
- **Step 1.1**: Update `src/types/multiCloudBlueprint.ts`:
  - Preserve `resolvedVMs` in `EnvironmentNode.vmCount`.
  - In `writebackLegacyStorage()`, read existing `localStorage` keys directly and merge non-destructively to retain all unknown legacy fields and custom metadata.
  - Guard numeric zero values (`storageTB: 0`, `decoupledStorageTB: 0`, `rpoMin: 0`).
- **Step 1.2**: Implement `scripts/verify-data-integrity.ts` with 5 automated test cases:
  - **Test 1 (VM Count)**: Asserts that an RVTools inventory with non-standard ratio (e.g. 500 VMs, 800 vCPUs) retains `500` across repeated hydration and writeback cycles without recalculation.
  - **Test 2 (Zero Values)**: Asserts that valid zeros (`storageTB: 0`, `rpoMin: 0`) are preserved and not replaced by default numbers.
  - **Test 3 (Unknown Fields)**: Asserts that custom/extra legacy properties (e.g. `vlans`, `limitingDriver`, `customTags`) in legacy keys survive repeated writeback untouched.
  - **Test 4 (Malformed Data)**: Asserts that malformed or partial JSON in `localStorage` is handled gracefully without crashing.
  - **Test 5 (Conflict Resolution)**: Asserts that precedence order (RVTools > Sizing > DR) is strictly respected during multi-source hydration.
- **Step 1.3**: Execute `npx tsx scripts/verify-data-integrity.ts` and document actual terminal output.
- **Checkpoint**: Present test results to the user. Do not proceed to Phase 2 until Phase 1 tests pass cleanly.

### Phase 2: Interactive Multi-Cloud Canvas & Validation Improvements
- **Goal**: Implement Step 1 track expansion, robust environment validation, multi-tier interactive canvas, and strict explicit synchronization.
- **Step 2.1: Step 1 Architecture Track Expansion**:
  - Expand from 5 to 9 enterprise architecture tracks:
    1. Nutanix On-Premises (AOS / AHV) — *Primary Datacenter*
    2. Nutanix Cloud Clusters on Azure (NC2) — *Hybrid Cloud*
    3. VMware to NC2 Migration Assessment — *Migration*
    4. Azure VMware Solution (AVS SDDC) — *Hyperscaler SDDC*
    5. VMware Cloud on AWS (VMC SDDC) — *Hyperscaler SDDC*
    6. Google Cloud VMware Engine (GCVE SDDC) — *Hyperscaler SDDC*
    7. AWS Native Enterprise VPC Hub — *Cloud Native*
    8. Google Cloud Native Hub — *Cloud Native*
    9. Multi-Cloud Enterprise Mesh — *Hybrid Cloud / Mesh*
  - Category filter tabs: `All Tracks`, `Nutanix & Hybrid`, `Hyperscaler SDDC`, `Cloud Native`, `Migration`.
  - Vendor-aligned accent borders and badges: Emerald (Nutanix), Sky (Azure), Amber (AWS), Blue (GCP), Indigo (Mesh).
  - Pre-populate initial production and transit interconnect nodes upon track selection.
- **Step 2.2: Add Environment Form Validation Improvements**:
  - Name: Required, trimmed, case-insensitive duplicate check against existing environments.
  - CIDR: Valid IPv4 CIDR notation (`^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$`).
  - Hosts: Required positive integer (or >= 0 for cloud hubs).
  - Storage TB: Required positive number.
  - Clear inline error messages and disabled button state until all rules are satisfied.
  - Initialize new environments with `connectedEnvironmentIds: []` as unlinked zones.
- **Step 2.3: Interactive Multi-Tier Canvas**:
  - Arrange environments into auto-aligned functional tiers: Tier 1 (Source / On-Prem), Tier 2 (Transit Hubs / Interconnects), Tier 3 (Cloud SDDC / Native / DR).
  - Smooth interactive mouse dragging with coordinate boundary limits.
  - Click-to-connect interconnect drawing between nodes with link configuration modal:
    - Protocols: ExpressRoute FastPath, AWS Direct Connect, Google Cloud Interconnect, IPsec VPN, VMware HCX L2 Extension, Nutanix Move, Nutanix Protection Domain / Leap.
    - Bandwidth: 1 Gbps, 10 Gbps, 100 Gbps, redundancy mode, notes.
    - Interactive bezier connection lines with animated directional flows.
    - Click existing link to edit properties or delete.
  - Node spec inspector drawer displaying compute, storage, networking, and connected links with inline editing.
  - Dual-mode viewport toggle: **Interactive Multi-Tier Canvas** vs. **Static 4K Vector Blueprint Viewport**.
- **Step 2.4: Explicit Legacy-Sync Boundaries**:
  - Wire `writebackLegacyStorage()` strictly to:
    - User clicks **Save Blueprint** (`handleSaveBlueprintState`)
    - User clicks **Export Blueprint (JSON)** or **Export Bill of Materials (Excel)**
  - Ensure Export 4K PNG/JPEG and Generate 3D Blueprint operate with zero `localStorage` writes.
  - Ensure page load, tab switches, and canvas dragging perform zero `localStorage` writes.

### Phase 3: Verification, Regression Testing, & Sign-Off Report
- **Goal**: Full verification of all subsystems, non-regression confirmation, and presentation of exact diffs.
- **Step 3.1**: Run regression test suite: `npx tsx scripts/verify-data-integrity.ts`.
- **Step 3.2**: Run TypeScript type check: `npm run lint` (`tsc --noEmit`).
- **Step 3.3**: Run Vite build: `npm run build`.
- **Step 3.4**: Non-Regression Verification:
  - Verify static SVG export produces valid scalable vector markup.
  - Verify 4K Canvas generator (`draw4KCanvas`) produces high-resolution 3840x2160 PNG/JPEG without errors.
  - Verify AI 3D Isometric Blueprint modal opens, submits prompts to server, and renders generated images.
  - Verify BOM Excel calculation and export functions without regression.
  - Verify Firebase Authentication and Firestore storage services are intact.
  - Verify `package.json`, `vite.config.ts`, and `vercel.json` have zero diffs against initial repository state.
- **Step 3.5: Final Review & Sign-Off Presentation**:
  - Present exact file diffs for all modified files.
  - Present actual test logs from the data integrity runner, compiler, and build system.
  - Confirm protected file status.
  - **STOP and wait for user review and approval**.
  - No code pushes, deployments, or production changes will occur without separate user approval.
