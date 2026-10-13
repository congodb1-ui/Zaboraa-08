import React, { useState } from 'react';
import {
  Server,
  Layers,
  HardDrive,
  Network,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { EnvironmentNode, InterconnectLink } from '../types/multiCloudBlueprint';

interface InfrastructureImplementationDossierProps {
  customerName: string;
  architectName: string;
  projectDate: string;
  activeTemplate: string;
  cloudPlatform: string;
  nodeSku: string;
  calculatedCloudNodes: number;
  totalVMCount: number;
  decoupledStorageTB: number;
  externalStorageName: string;
  connectivity: string;
  landingZone: string;
  nvaFirewall: string;
  wafSolution: string;
  drEngine: string;
  drRpoMinutes: number;
  drRtoMinutes: number;
  drStrategy: string;
  topologyEnvironments: EnvironmentNode[];
  interconnectLinks: InterconnectLink[];
  onExportBOMExcel?: () => void;
}

export const InfrastructureImplementationDossier: React.FC<InfrastructureImplementationDossierProps> = ({
  customerName,
  architectName,
  projectDate,
  activeTemplate,
  cloudPlatform,
  nodeSku,
  calculatedCloudNodes,
  totalVMCount,
  decoupledStorageTB,
  externalStorageName,
  connectivity,
  landingZone,
  nvaFirewall,
  wafSolution,
  drEngine,
  drRpoMinutes,
  drRtoMinutes,
  drStrategy,
  topologyEnvironments,
  interconnectLinks,
  onExportBOMExcel
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    compute: true,
    storage: true,
    networking: true,
    dr: true,
    rollout: true
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalVcpu = topologyEnvironments.reduce((acc, e) => acc + (e.totalVcpu || 0), 0);
  const totalRamGB = topologyEnvironments.reduce((acc, e) => acc + (e.totalRamGB || 0), 0);
  const totalStorageTB = topologyEnvironments.reduce((acc, e) => acc + (e.storageTB || 0), 0);
  const totalHosts = topologyEnvironments.reduce((acc, e) => acc + (e.hostCount || 0), 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const generateMarkdownDossier = () => {
    return `# Enterprise Cloud Architecture Implementation Dossier
**Customer**: ${customerName}  
**Lead Architect**: ${architectName}  
**Target Architecture Track**: ${activeTemplate.toUpperCase()}  
**Date**: ${projectDate}  

---

## 1. Executive Summary & Workload Scope
- **Total Workload VMs**: ${totalVMCount} Virtual Machines
- **Total Physical/BareMetal Hypervisor Nodes**: ${totalHosts} Nodes
- **Aggregate Compute**: ${totalVcpu} vCPUs, ${totalRamGB} GiB Memory
- **Total Usable Storage**: ${totalStorageTB} TiB (Primary vSAN + ${decoupledStorageTB} TiB ${externalStorageName})

## 2. Infrastructure Cluster Sizing (BOM)
${topologyEnvironments.map((env, i) => `### ${i + 1}. ${env.name} (${env.role})
- **Platform**: ${env.platform}
- **Region**: ${env.region}
- **Node SKU**: ${env.nodeSku} (${env.hostCount} Hosts)
- **Cores & Memory**: ${env.totalVcpu} Cores / ${env.totalRamGB} GiB RAM
- **Storage Allocation**: ${env.storageTB} TiB
- **Subnet CIDR**: ${env.cidrBlock}
`).join('\n')}

## 3. Storage Architecture
- **Hyper-Converged Primary Tier**: All-Flash NVMe vSAN ESA / Nutanix DSF
- **Decoupled External Tier**: ${decoupledStorageTB} TiB on ${externalStorageName}
- **Storage Redundancy Policy**: RAID-6 / FTT=2 with dual erasure coding

## 4. Networking & Security Topology
- **Transit Backbone**: ${connectivity}
- **Landing Zone Structure**: ${landingZone}
- **Next-Gen NVA Firewall**: ${nvaFirewall} (Active-Active ECMP)
- **Web Application Firewall (WAF)**: ${wafSolution}
- **Interconnect Circuits**:
${interconnectLinks.map(l => `  - From ${topologyEnvironments.find(e => e.id === l.sourceId)?.name || l.sourceId} to ${topologyEnvironments.find(e => e.id === l.targetId)?.name || l.targetId}: ${l.bandwidthGbps} Gbps via ${l.protocol} (${l.redundant ? 'Dual Redundant' : 'Single Path'})`).join('\n')}

## 5. Disaster Recovery & Business Continuity (BCDR)
- **Replication Engine**: ${drEngine}
- **Target Recovery Point Objective (RPO)**: ${drRpoMinutes} Minutes
- **Target Recovery Time Objective (RTO)**: ${drRtoMinutes} Minutes
- **Standby Posture**: ${drStrategy}
- **Isolated Testing Bubble**: 192.168.254.0/24 (Zero-Impact Test Failover)

## 6. Implementation Rollout Milestones
1. **Day 1**: Landing Zone & Management VPC / vNet CIDR Provisioning
2. **Day 2**: Dedicated Interconnect circuits termination, BGP peering & Gateway routes
3. **Day 3**: Management hypervisors, HCX / Nutanix Move deployment & service mesh pairing
4. **Day 4**: Non-production pilot migration wave & automated DR bubble failover validation
5. **Day 5**: Production wave cutover with live DNS traffic shift
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownDossier();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customerName.replace(/\s+/g, '_')}_Implementation_Dossier.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-xs font-sans text-slate-200">
      {/* Dossier Header & Copy Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
            Technical Implementation Specification
          </span>
          <h3 className="text-sm font-bold text-white">{customerName} — Deployment Dossier</h3>
        </div>

        <div className="flex items-center gap-2">
          {onExportBOMExcel && (
            <button
              type="button"
              onClick={onExportBOMExcel}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition shadow"
              title="Export Bill of Materials to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>BOM (.xlsx)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition shadow"
            title="Download complete implementation runbook in Markdown"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dossier (.md)</span>
          </button>

          <button
            type="button"
            onClick={() => copyToClipboard(generateMarkdownDossier(), 'dossier')}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition shadow"
          >
            {copiedSection === 'dossier' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Capacity Rollup Metric Strip */}
      <div className="grid grid-cols-4 gap-2 font-mono text-[11px] text-center">
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Hosts</span>
          <span className="font-bold text-white text-xs">{totalHosts} Nodes</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">vCPU</span>
          <span className="font-bold text-cyan-300 text-xs">{totalVcpu} Cores</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Memory</span>
          <span className="font-bold text-emerald-300 text-xs">{totalRamGB} GiB</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Storage</span>
          <span className="font-bold text-indigo-300 text-xs">{totalStorageTB} TiB</span>
        </div>
      </div>

      {/* Accordion 1: Compute & Cluster BOM */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => toggleSection('compute')}
          className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>1. Compute Clusters & Node Hardware BOM ({topologyEnvironments.length} Environments)</span>
          </div>
          {openSections.compute ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.compute && (
          <div className="p-3 space-y-2.5 divide-y divide-slate-800/80">
            {topologyEnvironments.map((env, idx) => (
              <div key={env.id} className={idx > 0 ? 'pt-2.5 space-y-1' : 'space-y-1'}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{env.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({env.role})</span>
                  </span>
                  <span className="font-mono text-cyan-300 text-[10px]">{env.region}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg">
                  <div>SKU: <strong className="text-slate-200">{env.nodeSku}</strong></div>
                  <div>Hosts: <strong className="text-white">{env.hostCount}</strong></div>
                  <div>vCPU/RAM: <strong className="text-cyan-300">{env.totalVcpu}C / {env.totalRamGB}G</strong></div>
                  <div>Subnet: <strong className="text-emerald-300">{env.cidrBlock}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 2: Storage Architecture */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => toggleSection('storage')}
          className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>2. Storage Fabric & Decoupled NFS Datastores</span>
          </div>
          {openSections.storage ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.storage && (
          <div className="p-3 space-y-2 text-[11px]">
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 uppercase block">Hypervisor Local vSAN ESA</span>
                <span className="font-bold text-white text-[11px]">All-NVMe Tier ({totalStorageTB} TB Aggregate)</span>
                <span className="text-slate-400 block text-[9px]">RAID-6 (FTT=2), Deduplication & Compression</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 uppercase block">Decoupled External NFS</span>
                <span className="font-bold text-cyan-300 text-[11px]">{decoupledStorageTB} TB on {externalStorageName}</span>
                <span className="text-slate-400 block text-[9px]">Elastic throughput up to 1,280 MB/s line-rate</span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px]">
              Independent storage scaling allows compute and database clusters to grow without purchasing unwanted hypervisor CPU licenses.
            </p>
          </div>
        )}
      </div>

      {/* Accordion 3: Networking & Interconnect Circuits */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => toggleSection('networking')}
          className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <Network className="w-4 h-4 text-sky-400" />
            <span>3. Network Architecture & Interconnect Circuits ({interconnectLinks.length} Links)</span>
          </div>
          {openSections.networking ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.networking && (
          <div className="p-3 space-y-2.5 text-[11px]">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">CARRIER</span>
                <span className="text-white font-bold">{connectivity}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">LANDING ZONE</span>
                <span className="text-cyan-300 font-bold">{landingZone}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">FIREWALL NVA</span>
                <span className="text-purple-300 font-bold">{nvaFirewall}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">WAF DEFENSE</span>
                <span className="text-emerald-300 font-bold">{wafSolution}</span>
              </div>
            </div>

            {interconnectLinks.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Active Interconnect Circuits:</span>
                <div className="space-y-1">
                  {interconnectLinks.map(l => {
                    const src = topologyEnvironments.find(e => e.id === l.sourceId)?.name || l.sourceId;
                    const tgt = topologyEnvironments.find(e => e.id === l.targetId)?.name || l.targetId;
                    return (
                      <div key={l.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white font-bold">{src} &rarr; {tgt}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-300">{l.bandwidthGbps} Gbps</span>
                          <span className="text-slate-400">({l.protocol})</span>
                          {l.redundant && <span className="text-emerald-400 font-bold">Dual Path</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion 4: Disaster Recovery & BCDR Runbook */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => toggleSection('dr')}
          className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>4. Disaster Recovery SLA & Failover Runbook</span>
          </div>
          {openSections.dr ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.dr && (
          <div className="p-3 space-y-2 text-[11px] font-mono">
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-500 block">RPO TARGET</span>
                <span className="font-bold text-amber-300 text-xs">{drRpoMinutes} Minutes</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-500 block">RTO TARGET</span>
                <span className="font-bold text-amber-300 text-xs">{drRtoMinutes} Minutes</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-500 block">STRATEGY</span>
                <span className="font-bold text-emerald-400 text-[10px]">{drStrategy.split(' ')[0]}</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1 text-[10px]">
              <div className="text-slate-300 font-bold">Engine: {drEngine}</div>
              <div className="text-slate-400">Isolated Test Network Bubble: <strong className="text-cyan-300">192.168.254.0/24</strong></div>
              <div className="text-slate-400">DNS Traffic Manager automated failover policy: <strong className="text-emerald-300">Fast Sub-Minute Health Check</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 5: Rollout Timeline & Implementation Phases */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => toggleSection('rollout')}
          className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>5. Implementation Sequence & Milestone Plan</span>
          </div>
          {openSections.rollout ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.rollout && (
          <div className="p-3 space-y-2 text-[10px]">
            {[
              { phase: 'Phase 1: Foundation', desc: 'Deploy cloud subscription landing zone, management subnets & IAM access controls.' },
              { phase: 'Phase 2: Interconnect', desc: 'Terminate dedicated ExpressRoute/DirectConnect and configure BGP active-active routing.' },
              { phase: 'Phase 3: Appliances', desc: 'Deploy HCX Service Mesh or Nutanix Move clusters; initiate background disk seeding.' },
              { phase: 'Phase 4: Pilot Test', desc: 'Execute zero-impact test failover in isolated bubble network to prove RTO/RPO SLAs.' },
              { phase: 'Phase 5: Cutover', desc: 'Execute final delta sync, perform low-downtime cutover wave, and shift production DNS.' }
            ].map((step, sIdx) => (
              <div key={sIdx} className="flex items-start gap-2 p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono flex items-center justify-center shrink-0">
                  {sIdx + 1}
                </span>
                <div>
                  <strong className="text-white block">{step.phase}</strong>
                  <span className="text-slate-400">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
