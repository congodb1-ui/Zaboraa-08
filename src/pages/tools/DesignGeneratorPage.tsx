import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Layers,
  HardDrive,
  Cpu,
  ShieldCheck,
  Download,
  Calendar,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  RefreshCw,
  Server,
  Network,
  Shield,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
  Eye,
  X,
  Zap,
  Clock,
  ArrowRight,
  Save,
  FileDown,
  Link2,
  Unlink,
  GripVertical,
  Activity,
  Settings2
} from 'lucide-react';
import { useCustomization } from '../../context/CustomizationContext';
import { GOOGLE_DRIVE_CONFIG } from '../../data/mediaAssets';
import {
  ArchitectureTemplateId,
  CloudPlatformType,
  EnvironmentNode,
  EnvironmentRole,
  DynamicTopologyModel,
  InterconnectLink,
  ImportedLegacyContext,
  getDefaultEnvironmentsForTemplate,
  getDefaultInterconnectLinksForTemplate,
  hydrateFromLegacyStorage,
  writebackLegacyStorage
} from '../../types/multiCloudBlueprint';
import {
  VendorTextFallback,
  AzureVirtualDesktopIcon,
  AzureNetAppFilesIcon,
  AzureFirewallIcon,
  AzureExpressRouteIcon,
  AzureVirtualWanIcon,
  NutanixPrismIcon,
  NutanixAhvIcon,
  NutanixMoveIcon,
  AwsTransitGatewayIcon,
  AwsFsxOntapIcon,
  GcpInterconnectIcon,
  GcpNetAppVolumesIcon,
  VmwareVcenterIcon,
  VmwareHcxIcon,
  PaloAltoNetworksNvaIcon,
  FortinetFortiGateNvaIcon
} from '../../components/icons/CloudArchitectureIcons';

interface VlanSubsegment {
  vlanId: number;
  subnetCidr: string;
  environment: 'Dev' | 'Staging' | 'Pre-Prod' | 'Prod';
}

interface AIBlueprintResult {
  imageUrl: string;
  isFallback: boolean;
  model: string;
  prompt: string;
  message?: string;
}

export const DesignGeneratorPage: React.FC = () => {
  const { setIsBriefingModalOpen } = useCustomization();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Wizard Metadata
  const [customerName, setCustomerName] = useState<string>('Global Financial Enterprises');
  const [architectName, setArchitectName] = useState<string>('Wasim Sayyed');
  const [projectDate, setProjectDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cloudPlatform, setCloudPlatform] = useState<'Azure VMware Solution' | 'Google Cloud VMware Engine' | 'VMware Cloud on AWS'>('Azure VMware Solution');

  // 2. On-Premises Infrastructure
  const [vCenterCount, setVCenterCount] = useState<number>(2);
  const [esxiHostCount, setEsxiHostCount] = useState<number>(24);
  const [clusterCount, setClusterCount] = useState<number>(4);
  const [vdsCount, setVdsCount] = useState<number>(2);
  const [totalVMCount, setTotalVMCount] = useState<number>(380);
  const [environments, setEnvironments] = useState<string[]>(['Dev', 'Staging', 'Prod']);
  const [subsegments, setSubsegments] = useState<VlanSubsegment[]>([
    { vlanId: 10, subnetCidr: '10.10.10.0/24', environment: 'Prod' },
    { vlanId: 20, subnetCidr: '10.20.10.0/24', environment: 'Prod' },
    { vlanId: 30, subnetCidr: '10.30.10.0/24', environment: 'Prod' },
    { vlanId: 40, subnetCidr: '10.40.10.0/24', environment: 'Dev' },
    { vlanId: 100, subnetCidr: '10.100.10.0/24', environment: 'Prod' }
  ]);

  // 3. Network & Security Settings
  const [connectivity, setConnectivity] = useState<'Hybrid (VPN + ExpressRoute / DirectConnect)' | 'VPN Only' | 'Direct Circuits with FastPath / Global Reach'>('Hybrid (VPN + ExpressRoute / DirectConnect)');
  const [landingZone, setLandingZone] = useState<'Hub-Spoke VNet / VPC' | 'Dedicated Transit Hub VNet' | 'Azure Virtual WAN / AWS TGW / GCP NCC'>('Hub-Spoke VNet / VPC');
  const [nvaFirewall, setNvaFirewall] = useState<'Palo Alto Networks VM-Series' | 'Azure Firewall Premium / Native' | 'Fortinet FortiGate-VM' | 'Check Point CloudGuard' | 'Cisco Secure Firewall'>('Palo Alto Networks VM-Series');
  const [wafSolution, setWafSolution] = useState<'Azure WAF on Application Gateway' | 'Cloudflare Magic Transit' | 'AWS WAF' | 'F5 Distributed Cloud WAF'>('Azure WAF on Application Gateway');

  // 4. Hyperscaler SDDC Settings
  const [avsGen, setAvsGen] = useState<'Gen 1' | 'Gen 2'>('Gen 2');
  const [nodeSku, setNodeSku] = useState<string>('AV36P');
  const [mgmtCidrInput, setMgmtCidrInput] = useState<string>('10.240.0.0/22');
  const [decoupledStorageTB, setDecoupledStorageTB] = useState<number>(120);

  // DR Parameters (Hydrated from DR Planner or default)
  const [drEngine, setDrEngine] = useState<string>('VMware SRM + vSphere Replication');
  const [drRpoMinutes, setDrRpoMinutes] = useState<number>(5);
  const [drRtoMinutes, setDrRtoMinutes] = useState<number>(20);
  const [drStrategy, setDrStrategy] = useState<string>('Pilot Light (3-Node Minimum)');

  // SVG Zoom & Modal States
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showPreFlightModal, setShowPreFlightModal] = useState<boolean>(false);
  const [show3DModal, setShow3DModal] = useState<boolean>(false);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  // 3D Isometric AI Generation States
  const [isGenerating3D, setIsGenerating3D] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [aiBlueprintResult, setAiBlueprintResult] = useState<AIBlueprintResult | null>(null);
  const [blueprint3DZoom, setBlueprint3DZoom] = useState<number>(1.0);

  // Dynamic Multi-Cloud & Nutanix Architecture State (Milestone 2)
  const [activeTemplate, setActiveTemplate] = useState<ArchitectureTemplateId>('avs');
  const [topologyEnvironments, setTopologyEnvironments] = useState<EnvironmentNode[]>(() =>
    getDefaultEnvironmentsForTemplate('avs')
  );
  const [interconnectLinks, setInterconnectLinks] = useState<InterconnectLink[]>(() =>
    getDefaultInterconnectLinksForTemplate('avs')
  );
  const [importedLegacyContext, setImportedLegacyContext] = useState<ImportedLegacyContext>({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'nutanix' | 'sddc' | 'native' | 'migration'>('all');
  const [canvasMode, setCanvasMode] = useState<'interactive' | 'static-vector'>('interactive');

  // Interactive Canvas Interconnect & Inspector States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkModalSourceId, setLinkModalSourceId] = useState<string>('');
  const [linkModalTargetId, setLinkModalTargetId] = useState<string>('');
  const [linkProtocol, setLinkProtocol] = useState<InterconnectLink['protocol']>('ExpressRoute FastPath');
  const [linkBandwidth, setLinkBandwidth] = useState<number>(10);
  const [linkRedundant, setLinkRedundant] = useState<boolean>(true);
  const [linkNotes, setLinkNotes] = useState<string>('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Mouse Dragging States
  const [isDraggingNodeId, setIsDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [conflictsResolvedList, setConflictsResolvedList] = useState<string[]>([]);
  const [showAddEnvModal, setShowAddEnvModal] = useState<boolean>(false);
  const [newEnvName, setNewEnvName] = useState<string>('');
  const [newEnvPlatform, setNewEnvPlatform] = useState<CloudPlatformType>('Nutanix NC2 on Azure');
  const [newEnvRole, setNewEnvRole] = useState<EnvironmentRole>('Disaster Recovery');
  const [newEnvRegion, setNewEnvRegion] = useState<string>('Azure East US 2');
  const [newEnvHosts, setNewEnvHosts] = useState<number>(4);
  const [newEnvStorageTB, setNewEnvStorageTB] = useState<number>(60);
  const [newEnvCidr, setNewEnvCidr] = useState<string>('10.240.0.0/22');

  // Hydrate from RVTools or DR Planner or Sizing Tool with domain conflict resolution
  useEffect(() => {
    try {
      const blueprintState = localStorage.getItem('zaboraa_4k_blueprint_state');
      const drExport = localStorage.getItem('zaboraa_dr_export');
      const sizingExport = localStorage.getItem('zaboraa_sizing_export');

      if (blueprintState || drExport || sizingExport) {
        const { model, notice, conflictsResolved } = hydrateFromLegacyStorage(
          blueprintState,
          drExport,
          sizingExport
        );
        setActiveTemplate(model.templateId);
        setTopologyEnvironments(model.environments);
        if (model.interconnectLinks && model.interconnectLinks.length > 0) {
          setInterconnectLinks(model.interconnectLinks);
        }
        setImportedLegacyContext(model.importedLegacyContext);
        setCustomerName(model.customerName);
        setArchitectName(model.architectName);
        setDrEngine(model.resilience.replicationEngine);
        setDrRpoMinutes(model.resilience.targetRpoMinutes);
        setDrRtoMinutes(model.resilience.targetRtoMinutes);
        setDrStrategy(
          model.resilience.drTopology === 'Backup & Restore'
            ? 'Cold Storage / On-Demand'
            : model.resilience.drTopology === 'Warm Standby'
            ? 'Hot Standby (Full Cluster)'
            : 'Pilot Light (3-Node Minimum)'
        );

        // Map to existing legacy variables to ensure 100% backward-compatibility with SVG/Canvas
        if (model.environments[0]) {
          setTotalVMCount(model.environments[0].vmCount ?? Math.round(model.environments[0].totalVcpu / 2.5));
          setEsxiHostCount(model.environments[0].hostCount);
          setClusterCount(Math.max(1, Math.round(model.environments[0].hostCount / 6)));
        }
        if (model.environments[1]) {
          setDecoupledStorageTB(model.environments[1].storageTB);
          setNodeSku(model.environments[1].nodeSku);
          if (model.environments[1].platform.includes('AWS')) {
            setCloudPlatform('VMware Cloud on AWS');
          } else if (model.environments[1].platform.includes('Google') || model.environments[1].platform.includes('GCP')) {
            setCloudPlatform('Google Cloud VMware Engine');
          } else {
            setCloudPlatform('Azure VMware Solution');
          }
        }

        // Hydrate legacy VLANs if present in RVTools state
        const parsedBlueprint = blueprintState ? JSON.parse(blueprintState) : null;
        if (parsedBlueprint?.vlans && Array.isArray(parsedBlueprint.vlans) && parsedBlueprint.vlans.length > 0) {
          setSubsegments(parsedBlueprint.vlans.slice(0, 6).map((v: any, i: number) => ({
            vlanId: v.vlanId || (i + 1) * 10,
            subnetCidr: `10.${v.vlanId || (i + 1) * 10}.10.0/24`,
            environment: (v.portGroup?.toLowerCase().includes('dev') ? 'Dev' : v.portGroup?.toLowerCase().includes('stg') ? 'Staging' : 'Prod') as 'Dev' | 'Staging' | 'Prod'
          })));
        }

        setImportedNotice(notice);
        setConflictsResolvedList(conflictsResolved);
      }
    } catch (err) {
      console.warn('Hydration exception:', err);
    }
  }, []);

  // Explicit non-destructive writeback (STRICT BOUNDARY: only triggered on explicit Save or Export Blueprint/BOM actions)
  const handlePersistLegacyState = () => {
    if (topologyEnvironments && topologyEnvironments.length > 0) {
      const updatedEnvs = [...topologyEnvironments];
      if (updatedEnvs[0]) {
        updatedEnvs[0].vmCount = totalVMCount;
      }
      const activeModel: DynamicTopologyModel = {
        templateId: activeTemplate,
        customerName,
        architectName,
        projectDate,
        environments: updatedEnvs,
        interconnectLinks,
        resilience: {
          drTopology: drStrategy.includes('Cold') ? 'Backup & Restore' : drStrategy.includes('Hot') ? 'Warm Standby' : 'Pilot Light',
          targetRpoMinutes: drRpoMinutes,
          targetRtoMinutes: drRtoMinutes,
          replicationMode: drRpoMinutes <= 1 ? 'Synchronous' : 'Asynchronous',
          replicationEngine: drEngine,
          failoverMode: 'Orchestrated Runbook',
          failbackApproach: 'Reverse Delta Sync'
        },
        activeServiceIds: [],
        importedLegacyContext: importedLegacyContext || {}
      };
      writebackLegacyStorage(activeModel);
      setSaveSuccessNotice('Blueprint state saved successfully. Legacy localStorage synchronized non-destructively.');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }
  };

  // Update Node SKU options when cloud platform changes
  useEffect(() => {
    if (cloudPlatform === 'Azure VMware Solution') {
      setNodeSku('AV36P');
    } else if (cloudPlatform === 'VMware Cloud on AWS') {
      setNodeSku('i4i.metal');
    } else {
      setNodeSku('ve1-standard-72');
    }
  }, [cloudPlatform]);

  const handleSelectTemplate = (template: ArchitectureTemplateId) => {
    setActiveTemplate(template);
    const newEnvs = getDefaultEnvironmentsForTemplate(template);
    const newLinks = getDefaultInterconnectLinksForTemplate(template);
    setTopologyEnvironments(newEnvs);
    setInterconnectLinks(newLinks);
    setSelectedNodeId(null);
    setConnectingSourceId(null);

    if (template === 'nutanix-onprem') {
      setCloudPlatform('Azure VMware Solution');
      setDrEngine('Nutanix Protection Domains (NearSync)');
      setDrRpoMinutes(15);
      setDrRtoMinutes(30);
      setDrStrategy('Warm Standby (Full Cluster)');
    } else if (template === 'nutanix-to-nc2') {
      setCloudPlatform('Azure VMware Solution');
      setDrEngine('Nutanix Move / Prism Pairing');
      setNodeSku('AN36P');
      setDrRpoMinutes(15);
      setDrRtoMinutes(60);
      setDrStrategy('Pilot Light (3-Node Minimum)');
    } else if (template === 'vmware-to-nc2') {
      setCloudPlatform('Azure VMware Solution');
      setDrEngine('Nutanix Move Cross-Hypervisor');
      setNodeSku('AN36P');
      setDrRpoMinutes(15);
      setDrRtoMinutes(60);
      setDrStrategy('Pilot Light (3-Node Minimum)');
    } else if (template === 'avs') {
      setCloudPlatform('Azure VMware Solution');
      setDrEngine('VMware SRM + vSphere Replication');
      setNodeSku('AV36P');
      setDrRpoMinutes(5);
      setDrRtoMinutes(20);
      setDrStrategy('Pilot Light (3-Node Minimum)');
    } else if (template === 'vmc-aws') {
      setCloudPlatform('VMware Cloud on AWS');
      setDrEngine('VMware HCX Bulk / Replication');
      setNodeSku('i4i.metal');
      setDrRpoMinutes(15);
      setDrRtoMinutes(30);
      setDrStrategy('Pilot Light (3-Node Minimum)');
    } else if (template === 'gcve') {
      setCloudPlatform('Google Cloud VMware Engine');
      setDrEngine('VMware HCX / Google Cloud Interconnect');
      setNodeSku('ve1-standard-72');
      setDrRpoMinutes(15);
      setDrRtoMinutes(30);
      setDrStrategy('Pilot Light (3-Node Minimum)');
    } else if (template === 'aws-native') {
      setCloudPlatform('VMware Cloud on AWS');
      setDrEngine('AWS Direct Connect + AWS DMS');
      setNodeSku('AWS Native VPC Hub');
      setDrRpoMinutes(15);
      setDrRtoMinutes(30);
      setDrStrategy('Warm Standby (Full Cluster)');
    } else if (template === 'gcp-native') {
      setCloudPlatform('Google Cloud VMware Engine');
      setDrEngine('Google Cloud Partner Interconnect');
      setNodeSku('Shared VPC Host Project');
      setDrRpoMinutes(15);
      setDrRtoMinutes(30);
      setDrStrategy('Warm Standby (Full Cluster)');
    } else if (template === 'multi-cloud') {
      setCloudPlatform('Azure VMware Solution');
      setDrEngine('Multi-Cloud Cross-Replication');
      setNodeSku('AV36P');
      setDrRpoMinutes(15);
      setDrRtoMinutes(45);
      setDrStrategy('Hot Standby (Full Cluster)');
    }
  };

  // IPv4 CIDR validation helper (supports /0 through /32 with strict octet checking)
  const isValidIpv4Cidr = (cidr: string): boolean => {
    const trimmed = cidr.trim();
    if (!trimmed) return true; // Optional if blank
    const match = trimmed.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    if (!match) return false;
    const [, o1, o2, o3, o4, prefix] = match;
    const octets = [Number(o1), Number(o2), Number(o3), Number(o4)];
    for (const oct of octets) {
      if (oct < 0 || oct > 255) return false;
    }
    const prefixNum = Number(prefix);
    return prefixNum >= 0 && prefixNum <= 32;
  };

  // Form field validation computations for Add New Environment modal
  const trimmedEnvName = newEnvName.trim();
  const isEnvNameEmpty = trimmedEnvName.length === 0;
  const isEnvNameDuplicate = Boolean(
    trimmedEnvName &&
      topologyEnvironments.some(
        env => env.name.trim().toLowerCase() === trimmedEnvName.toLowerCase()
      )
  );
  const trimmedCidr = newEnvCidr.trim();
  const isCidrFormatInvalid = Boolean(trimmedCidr.length > 0 && !isValidIpv4Cidr(trimmedCidr));

  // Determine if host count is valid (>= 0, integer, finite; native hub environments allow 0)
  const isHostCountValid =
    Number.isInteger(newEnvHosts) &&
    !isNaN(newEnvHosts) &&
    (newEnvPlatform === 'AWS Native' || newEnvPlatform === 'GCP Native' ? newEnvHosts >= 0 : newEnvHosts >= 1);

  // Storage valid: positive number
  const isStorageValid = !isNaN(newEnvStorageTB) && newEnvStorageTB > 0;

  // Overall form validity
  const isAddEnvFormValid =
    !isEnvNameEmpty &&
    !isEnvNameDuplicate &&
    !isCidrFormatInvalid &&
    isHostCountValid &&
    isStorageValid;

  const handleAddEnvironment = () => {
    if (!isAddEnvFormValid) return;

    // Platform-specific node SKU calculation
    const derivedSku = newEnvPlatform.includes('NC2')
      ? 'AN36P'
      : newEnvPlatform.includes('AVS')
      ? 'AV36P'
      : newEnvPlatform.includes('AWS')
      ? (newEnvHosts === 0 ? 'AWS Native VPC Hub' : 'i4i.metal')
      : newEnvPlatform.includes('Google') || newEnvPlatform.includes('GCP')
      ? (newEnvHosts === 0 ? 'Google Cloud Native Hub' : 've1-standard-72')
      : 'NX-8170-G9';

    const derivedTier: 'source' | 'transit' | 'target' =
      newEnvRole === 'Production' ? 'source' : newEnvRole === 'Shared Services' ? 'transit' : 'target';

    const tierCount = topologyEnvironments.filter(e => e.tier === derivedTier).length;
    const defaultX = derivedTier === 'source' ? 80 : derivedTier === 'transit' ? 430 : 780;
    const defaultY = 120 + tierCount * 180;

    const newEnv: EnvironmentNode = {
      id: `env-${Date.now()}`,
      name: trimmedEnvName,
      platform: newEnvPlatform,
      role: newEnvRole,
      region: newEnvRegion.trim() || 'Custom Region',
      hostCount: Math.max(0, newEnvHosts),
      nodeSku: derivedSku,
      totalVcpu: Math.max(0, newEnvHosts) * 36,
      totalRamGB: Math.max(0, newEnvHosts) * 576,
      storageTB: Math.max(0, newEnvStorageTB),
      cidrBlock: trimmedCidr || '10.240.0.0/22',
      // Explicit requirement: Add as unlinked zone until connected in topology view
      connectedEnvironmentIds: [],
      tier: derivedTier,
      x: defaultX,
      y: defaultY,
      notes: `${newEnvRole} node group on ${newEnvPlatform}`
    };

    setTopologyEnvironments(prev => [...prev, newEnv]);
    setShowAddEnvModal(false);
    // Reset modal state
    setNewEnvName('');
    setNewEnvRegion('Azure East US 2');
    setNewEnvHosts(4);
    setNewEnvStorageTB(60);
    setNewEnvCidr('10.240.0.0/22');
  };

  const handleRemoveEnvironment = (idToRemove: string) => {
    if (topologyEnvironments.length <= 1) return;
    setTopologyEnvironments(prev => prev.filter(e => e.id !== idToRemove));
    setInterconnectLinks(prev => prev.filter(l => l.sourceId !== idToRemove && l.targetId !== idToRemove));
    if (selectedNodeId === idToRemove) setSelectedNodeId(null);
  };

  // Interactive Canvas Mouse Dragging & Coordinate Persistence
  const handleNodeMouseDown = (e: React.MouseEvent, node: EnvironmentNode) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) return;
    setIsDraggingNodeId(node.id);
    const currX = node.x ?? 80;
    const currY = node.y ?? 120;
    setDragOffset({ x: e.clientX - currX, y: e.clientY - currY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingNodeId) return;
    const newX = Math.max(20, Math.min(1000, e.clientX - dragOffset.x));
    const newY = Math.max(40, Math.min(520, e.clientY - dragOffset.y));
    setTopologyEnvironments(prev =>
      prev.map(n => (n.id === isDraggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingNodeId(null);
  };

  // Interactive Click-to-Connect Interconnect Links
  const handleStartConnect = (sourceId: string) => {
    if (connectingSourceId === sourceId) {
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(sourceId);
    }
  };

  const handleFinishConnect = (targetId: string) => {
    if (!connectingSourceId || connectingSourceId === targetId) return;
    setLinkModalSourceId(connectingSourceId);
    setLinkModalTargetId(targetId);
    setEditingLinkId(null);
    setLinkProtocol('ExpressRoute FastPath');
    setLinkBandwidth(10);
    setLinkRedundant(true);
    setLinkNotes('');
    setShowLinkModal(true);
    setConnectingSourceId(null);
  };

  const handleOpenEditLink = (link: InterconnectLink) => {
    setLinkModalSourceId(link.sourceId);
    setLinkModalTargetId(link.targetId);
    setEditingLinkId(link.id);
    setLinkProtocol(link.protocol);
    setLinkBandwidth(link.bandwidthGbps);
    setLinkRedundant(link.redundant ?? true);
    setLinkNotes(link.notes ?? '');
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!linkModalSourceId || !linkModalTargetId) return;
    if (editingLinkId) {
      setInterconnectLinks(prev =>
        prev.map(l =>
          l.id === editingLinkId
            ? {
                ...l,
                protocol: linkProtocol,
                bandwidthGbps: linkBandwidth,
                redundant: linkRedundant,
                notes: linkNotes
              }
            : l
        )
      );
    } else {
      const newLink: InterconnectLink = {
        id: `link-${Date.now()}`,
        sourceId: linkModalSourceId,
        targetId: linkModalTargetId,
        protocol: linkProtocol,
        bandwidthGbps: linkBandwidth,
        status: 'active',
        redundant: linkRedundant,
        notes: linkNotes || `${linkProtocol} link between environments`
      };
      setInterconnectLinks(prev => [...prev, newLink]);
      setTopologyEnvironments(prev =>
        prev.map(n => {
          if (n.id === linkModalSourceId && !n.connectedEnvironmentIds.includes(linkModalTargetId)) {
            return { ...n, connectedEnvironmentIds: [...n.connectedEnvironmentIds, linkModalTargetId] };
          }
          if (n.id === linkModalTargetId && !n.connectedEnvironmentIds.includes(linkModalSourceId)) {
            return { ...n, connectedEnvironmentIds: [...n.connectedEnvironmentIds, linkModalSourceId] };
          }
          return n;
        })
      );
    }
    setShowLinkModal(false);
  };

  const handleDeleteLink = (linkId: string) => {
    const linkToDelete = interconnectLinks.find(l => l.id === linkId);
    if (linkToDelete) {
      setTopologyEnvironments(prev =>
        prev.map(n => {
          if (n.id === linkToDelete.sourceId) {
            return { ...n, connectedEnvironmentIds: n.connectedEnvironmentIds.filter(id => id !== linkToDelete.targetId) };
          }
          if (n.id === linkToDelete.targetId) {
            return { ...n, connectedEnvironmentIds: n.connectedEnvironmentIds.filter(id => id !== linkToDelete.sourceId) };
          }
          return n;
        })
      );
    }
    setInterconnectLinks(prev => prev.filter(l => l.id !== linkId));
    setShowLinkModal(false);
  };

  const handleUpdateNodeSpec = (nodeId: string, updates: Partial<EnvironmentNode>) => {
    setTopologyEnvironments(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, ...updates } : n))
    );
  };

  const getPlatformResilienceWarnings = () => {
    const warnings: { type: 'info' | 'warning'; text: string }[] = [];
    const hasNutanix = topologyEnvironments.some(e => e.platform.includes('Nutanix'));
    const hasVmware = topologyEnvironments.some(e => e.platform.includes('VMware'));
    const hasNc2 = topologyEnvironments.some(e => e.platform.includes('NC2'));

    if (hasNutanix && drRpoMinutes <= 1) {
      warnings.push({
        type: 'warning',
        text: 'Nutanix Metro Availability (Near-Zero RPO) requires sub-5ms round-trip network latency (RTT) between sites and an independent Witness VM.'
      });
    }

    if (hasVmware && !hasNutanix && drRpoMinutes <= 1) {
      warnings.push({
        type: 'warning',
        text: 'VMware vSphere Metro Storage Cluster (vMSC) requires synchronous storage replication with vendor-certified array links and round-trip latency under 5ms (or 10ms with certified vMSC).'
      });
    }

    if (hasVmware && hasNc2) {
      warnings.push({
        type: 'info',
        text: 'Cross-Hypervisor Migration (VMware ESXi to Nutanix AHV) utilizes Nutanix Move. Prerequisite: Guest OS VirtIO driver injection and non-disruptive snapshot seeding.'
      });
    }

    if (drStrategy.toLowerCase().includes('pilot light')) {
      warnings.push({
        type: 'info',
        text: 'Pilot Light topology: BareMetal host reservation or cloud provider quota pre-approval is required to scale from standby to full production capacity during a disaster.'
      });
    }

    return warnings;
  };

  const effectiveMgmtCidr = mgmtCidrInput.trim() || '10.240.0.0/22';
  const calculatedCloudNodes = Math.max(3, Math.ceil(totalVMCount / (nodeSku.includes('64') || nodeSku.includes('i4i') ? 70 : 45)));

  const externalStorageName =
    cloudPlatform === 'Azure VMware Solution'
      ? 'Azure NetApp Files (ANF)'
      : cloudPlatform === 'VMware Cloud on AWS'
      ? 'Amazon FSx for NetApp ONTAP'
      : 'Google Cloud NetApp Volumes (GCNV)';

  // 4K Canvas Drawing Engine (3840x2160)
  const draw4KCanvas = (targetCanvas: HTMLCanvasElement) => {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const width = 3840;
    const height = 2160;
    targetCanvas.width = width;
    targetCanvas.height = height;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Blueprint Title Header Box
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(80, 80, width - 160, 200, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${customerName.toUpperCase()} — HYBRID CLOUD TOPOLOGY BLUEPRINT`, 130, 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '30px "JetBrains Mono", monospace';
    ctx.fillText(
      `ARCHITECT: ${architectName}  |  DATE: ${projectDate}  |  TARGET: ${cloudPlatform} (${calculatedCloudNodes}x ${nodeSku})  |  DR: ${drEngine}`,
      130,
      230
    );

    // 3. Panel 1: On-Premises SDDC (Left)
    const p1X = 80;
    const p1Y = 330;
    const pWidth = 1100;
    const pHeight = 1720;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(p1X, p1Y, pWidth, pHeight);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(p1X, p1Y, pWidth, pHeight);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('01. ON-PREMISES DATACENTER', p1X + 40, p1Y + 70);

    // Box 1.1: vCenter Management
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p1X + 40, p1Y + 120, pWidth - 80, 360);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p1X + 40, p1Y + 120, pWidth - 80, 360);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VMware vCenter Server (VCSA)', p1X + 70, p1Y + 180);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`• ${vCenterCount} vCenter Server Appliance(s)`, p1X + 70, p1Y + 240);
    ctx.fillText(`• ${clusterCount} ESXi Clusters (${esxiHostCount} Compute Hosts)`, p1X + 70, p1Y + 290);
    ctx.fillText(`• ${totalVMCount} Virtual Machines Across Workload Tiers`, p1X + 70, p1Y + 340);
    ctx.fillText(`• ${vdsCount} Virtual Distributed Switches (VDS)`, p1X + 70, p1Y + 390);

    // Box 1.2: SAN/NAS Datastores
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p1X + 40, p1Y + 520, pWidth - 80, 340);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p1X + 40, p1Y + 520, pWidth - 80, 340);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SAN & NAS Storage Tier', p1X + 70, p1Y + 580);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText('• Fibre Channel / iSCSI Clustered Arrays', p1X + 70, p1Y + 640);
    ctx.fillText(`• Discovered VLANs: ${subsegments.map(s => s.vlanId).join(', ')}`, p1X + 70, p1Y + 690);
    ctx.fillText(`• Segregated Environments: ${environments.join(', ')}`, p1X + 70, p1Y + 740);

    // Box 1.3: HCX Connector Fleet
    ctx.fillStyle = 'rgba(6, 78, 59, 0.7)';
    ctx.fillRect(p1X + 40, p1Y + 900, pWidth - 80, 420);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(p1X + 40, p1Y + 900, pWidth - 80, 420);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VMware HCX Connector Fleet', p1X + 70, p1Y + 960);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText('• HCX Interconnect (IX) Service Engine', p1X + 70, p1Y + 1020);
    ctx.fillText('• HCX Network Extension (NE) Fleet', p1X + 70, p1Y + 1070);
    ctx.fillText('• HCX WAN Optimization (WO)', p1X + 70, p1Y + 1120);
    ctx.fillText('• Mobility Optimized Networking (MON) Active', p1X + 70, p1Y + 1170);
    ctx.fillText(`• Disaster Recovery Engine: ${drEngine}`, p1X + 70, p1Y + 1220);

    // 4. Panel 2: Hybrid Transit & Security Edge (Center)
    const p2X = 1240;
    const p2Y = 330;
    const p2Width = 1100;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(p2X, p2Y, p2Width, pHeight);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(p2X, p2Y, p2Width, pHeight);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('02. HYBRID TRANSIT & SECURITY EDGE', p2X + 40, p2Y + 70);

    // Box 2.1: Physical Interconnect
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p2X + 40, p2Y + 120, p2Width - 80, 320);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p2X + 40, p2Y + 120, p2Width - 80, 320);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Cloud Interconnect & Express Peering', p2X + 70, p2Y + 180);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`• ${connectivity}`, p2X + 70, p2Y + 240);
    ctx.fillText('• Dual Redundant 10 Gbps BGP Cross-Connects', p2X + 70, p2Y + 290);
    ctx.fillText('• Ultra-Low Latency Direct Peering (<2ms)', p2X + 70, p2Y + 340);

    // Box 2.2: Transit Hub Architecture
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p2X + 40, p2Y + 480, p2Width - 80, 360);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p2X + 40, p2Y + 480, p2Width - 80, 360);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Landing Zone: ${landingZone}`, p2X + 70, p2Y + 540);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText('• ExpressRoute Gateway / DirectConnect VGW', p2X + 70, p2Y + 600);
    ctx.fillText('• Transitive Routing & Route Server Peering', p2X + 70, p2Y + 650);
    ctx.fillText('• FastPath Acceleration Enabled', p2X + 70, p2Y + 700);

    // Box 2.3: Next-Gen Firewall (NVA) & WAF
    ctx.fillStyle = 'rgba(88, 28, 135, 0.7)';
    ctx.fillRect(p2X + 40, p2Y + 880, p2Width - 80, 360);
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(p2X + 40, p2Y + 880, p2Width - 80, 360);
    ctx.fillStyle = '#d8b4fe';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`NVA Firewall: ${nvaFirewall}`, p2X + 70, p2Y + 940);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`• Web Application Firewall: ${wafSolution}`, p2X + 70, p2Y + 1000);
    ctx.fillText('• Deep Packet Inspection (DPI) & IPS/IDS', p2X + 70, p2Y + 1050);
    ctx.fillText('• Egress Internet Breakout & Zero-Trust Inspection', p2X + 70, p2Y + 1100);

    // 5. Panel 3: Cloud SDDC Core (Right)
    const p3X = 2400;
    const p3Y = 330;
    const p3Width = 1360;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(p3X, p3Y, p3Width, pHeight);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(p3X, p3Y, p3Width, pHeight);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`03. ${cloudPlatform.toUpperCase()} SDDC CORE`, p3X + 40, p3Y + 70);

    // Box 3.1: Bare-Metal SDDC Cluster
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p3X + 40, p3Y + 120, p3Width - 80, 360);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p3X + 40, p3Y + 120, p3Width - 80, 360);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Cluster Architecture: ${calculatedCloudNodes} Hosts (${nodeSku})`, p3X + 70, p3Y + 180);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`• Hardware Generation: ${avsGen} Architecture`, p3X + 70, p3Y + 240);
    ctx.fillText(`• Management Network CIDR: ${effectiveMgmtCidr}`, p3X + 70, p3Y + 290);
    ctx.fillText('• vCenter Server + vSAN Enterprise Array', p3X + 70, p3Y + 340);
    ctx.fillText(`• Sized for ${totalVMCount} Workloads with N+1 High Availability`, p3X + 70, p3Y + 390);

    // Box 3.2: NSX-T Software Defined Networking
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(p3X + 40, p3Y + 520, p3Width - 80, 340);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(p3X + 40, p3Y + 520, p3Width - 80, 340);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NSX-T Multi-Tier Routing & Microsegmentation', p3X + 70, p3Y + 580);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText('• Tier-0 Active-Active Gateway with ECMP Peering', p3X + 70, p3Y + 640);
    ctx.fillText(`• Segregated Tier-1 Gateways (${environments.map(e => `T1-${e}`).join(', ')})`, p3X + 70, p3Y + 690);
    ctx.fillText('• Distributed Firewall (DFW) Microsegmentation Active', p3X + 70, p3Y + 740);

    // Box 3.3: External Decoupled Storage Tier
    ctx.fillStyle = 'rgba(12, 74, 110, 0.7)';
    ctx.fillRect(p3X + 40, p3Y + 880, p3Width - 80, 360);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(p3X + 40, p3Y + 880, p3Width - 80, 360);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('External Decoupled Storage Tier (NFS Datastores)', p3X + 70, p3Y + 940);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`• Capacity: ${decoupledStorageTB} TB Offloaded from vSAN Sprawl`, p3X + 70, p3Y + 1000);
    ctx.fillText(`• Platform: ${externalStorageName}`, p3X + 70, 1050);
    ctx.fillText('• High-Throughput Dedicated NFS Datastore Mounts', p3X + 70, 1100);

    // 6. Connectors (Arrow lines across panels)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 8]);

    // Line 1: On-Prem to Edge
    ctx.beginPath();
    ctx.moveTo(p1X + pWidth, p1Y + 1040);
    ctx.lineTo(p2X, p2Y + 280);
    ctx.stroke();

    // Line 2: Edge to SDDC
    ctx.beginPath();
    ctx.moveTo(p2X + p2Width, p2Y + 660);
    ctx.lineTo(p3X, p3Y + 660);
    ctx.stroke();

    // Reset dash
    ctx.setLineDash([]);
  };

  // Export 4K Canvas Image (STRICT BOUNDARY: pure render and download, ZERO localStorage writes)
  const handleExport4K = (format: 'png' | 'jpeg') => {
    const offscreen = document.createElement('canvas');
    draw4KCanvas(offscreen);
    const link = document.createElement('a');
    link.download = `${customerName.replace(/\s+/g, '_')}_4K_Cloud_Architecture_Blueprint.${format}`;
    link.href = offscreen.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  // Export Complete Multi-Cloud Blueprint (JSON) - Explicit Export Action (Syncs legacy state)
  const handleExportBlueprintJSON = () => {
    handlePersistLegacyState();
    const updatedEnvs = [...topologyEnvironments];
    if (updatedEnvs[0]) {
      updatedEnvs[0].vmCount = totalVMCount;
    }
    const exportPayload: DynamicTopologyModel = {
      templateId: activeTemplate,
      customerName,
      architectName,
      projectDate,
      environments: updatedEnvs,
      interconnectLinks,
      resilience: {
        drTopology: drStrategy.includes('Cold') ? 'Backup & Restore' : drStrategy.includes('Hot') ? 'Warm Standby' : 'Pilot Light',
        targetRpoMinutes: drRpoMinutes,
        targetRtoMinutes: drRtoMinutes,
        replicationMode: drRpoMinutes <= 1 ? 'Synchronous' : 'Asynchronous',
        replicationEngine: drEngine,
        failoverMode: 'Orchestrated Runbook',
        failbackApproach: 'Reverse Delta Sync'
      },
      activeServiceIds: [
        'azure-avd',
        'azure-firewall',
        'azure-anf',
        'azure-vwan',
        'nutanix-prism',
        'nutanix-move',
        'aws-tgw',
        'aws-fsx-ontap'
      ],
      importedLegacyContext: importedLegacyContext || {}
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customerName.replace(/\s+/g, '_')}_MultiCloud_Blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export BOM to Excel - Explicit Export Action (Syncs legacy state)
  const handleExportBOMExcel = () => {
    handlePersistLegacyState();
    const wb = XLSX.utils.book_new();
    const rows = [
      { Category: 'General', Metric: 'Customer Name', Specification: customerName },
      { Category: 'General', Metric: 'Lead Architect', Specification: architectName },
      { Category: 'General', Metric: 'Target Hyperscaler Platform', Specification: cloudPlatform },
      { Category: 'Cloud Cluster', Metric: 'Node Model SKU', Specification: nodeSku },
      { Category: 'Cloud Cluster', Metric: 'Sized Host Count', Specification: `${calculatedCloudNodes} Bare-Metal Nodes` },
      { Category: 'Cloud Cluster', Metric: 'Management CIDR', Specification: effectiveMgmtCidr },
      { Category: 'Storage', Metric: 'Decoupled External Storage', Specification: `${decoupledStorageTB} TB (${externalStorageName})` },
      { Category: 'Workloads', Metric: 'Protected Virtual Machines', Specification: `${totalVMCount} VMs` },
      { Category: 'Networking', Metric: 'Physical Interconnect', Specification: connectivity },
      { Category: 'Security', Metric: 'Next-Gen Firewall', Specification: nvaFirewall },
      { Category: 'Security', Metric: 'Web Application Firewall', Specification: wafSolution },
      { Category: 'Disaster Recovery', Metric: 'Replication Engine', Specification: drEngine },
      { Category: 'Disaster Recovery', Metric: 'Target RPO SLA', Specification: `${drRpoMinutes} Minutes` },
      { Category: 'Disaster Recovery', Metric: 'Target RTO SLA', Specification: `${drRtoMinutes} Minutes` }
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Architecture BOM');
    XLSX.writeFile(wb, `${customerName.replace(/\s+/g, '_')}_Cloud_Architecture_BOM.xlsx`);
  };

  // Prompt Construction for Gemini Imagen 3
  const buildIsometricDiagramPrompt = () => {
    return `Dark enterprise blueprint aesthetic 3D isometric architectural diagram of a production hybrid VMware cloud topology for ${customerName}. Deep slate and midnight navy canvas background (#020617) with glowing high-contrast neon cyan, teal, and electric violet network lines, glowing 3D server rack chassis, and hyper-detailed isometric hardware annotations. Left panel displays on-premises enterprise datacenter with ${totalVMCount} VMs, vCenter Server, and VMware HCX interconnect mesh. Center transit panel shows dual redundant 10 Gbps ${connectivity} with ${nvaFirewall} next-gen firewall inspection and ${landingZone}. Right panel shows ${calculatedCloudNodes}x ${nodeSku} bare-metal SDDC nodes in ${cloudPlatform} with vSAN cluster and ${decoupledStorageTB} TB decoupled ${externalStorageName} NFS datastores. Replicated via ${drEngine} with ${drRpoMinutes}-minute RPO. Isometric orthographic 3D projection, photorealistic enterprise blueprint technical drawing, illuminated fiber optic paths, 4K presentation grade clarity.`;
  };

// AI 3D Isometric Generation Trigger
  const handleGenerateAIBlueprint = async () => {
    setIsGenerating3D(true);
    setShowPreFlightModal(false);
    setGenerationProgress(10);
    setGenerationStep('Synthesizing verified multi-tier infrastructure parameters...');

    const prompt = buildIsometricDiagramPrompt();

    // Progress simulation milestones
    const timer1 = setTimeout(() => {
      setGenerationProgress(35);
      setGenerationStep('Rendering 3D isometric server racks, NSX-T Tier-0 gateways, and firewalls...');
    }, 800);

    const timer2 = setTimeout(() => {
      setGenerationProgress(70);
      setGenerationStep('Illuminating glowing neon network paths and decoupled storage fabric...');
    }, 1800);

    try {
      // FIX: Use the clean relative path handled by Vite middleware (locally) and Vercel (production)
      const resp = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await resp.json();
      setGenerationProgress(100);
      setGenerationStep('Finalizing 4K dark blueprint render...');

      if (data.success && data.imageBase64) {
        setAiBlueprintResult({
          imageUrl: `data:image/jpeg;base64,${data.imageBase64}`,
          isFallback: false,
          model: data.model || 'imagen-3.0-generate-002',
          prompt: data.prompt || prompt
        });
      } else {
        // Fallback with bundled high-res 3D isometric diagram
        setAiBlueprintResult({
          imageUrl: data.fallbackUrl || '/assets/images/blueprint_3d_isometric_1791610246387.jpg',
          isFallback: true,
          model: 'Bundled Enterprise 3D Blueprint Asset',
          prompt,
          message: data.message || 'Rendered using bundled high-resolution 3D isometric architecture blueprint.'
        });
      }

      setTimeout(() => {
        setIsGenerating3D(false);
        setShow3DModal(true);
      }, 500);
    } catch (err: any) {
      // In case of network error, gracefully fallback
      setGenerationProgress(100);
      setAiBlueprintResult({
        imageUrl: '/assets/images/blueprint_3d_isometric_1791610246387.jpg',
        isFallback: true,
        model: 'Bundled Enterprise 3D Blueprint Asset',
        prompt,
        message: 'Loaded bundled high-resolution 3D isometric architecture blueprint.'
      });
      setTimeout(() => {
        setIsGenerating3D(false);
        setShow3DModal(true);
      }, 500);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };


  // Download AI 3D Image
  const handleDownloadAIBlueprint = () => {
    if (!aiBlueprintResult) return;
    const link = document.createElement('a');
    link.download = `${customerName.replace(/\s+/g, '_')}_3D_Isometric_Cloud_Blueprint.png`;
    link.href = aiBlueprintResult.imageUrl;
    link.click();
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors">Engineering Workbench</Link>
          <span>/</span>
          <span className="text-cyan-300">4K Architecture Topology & 3D Blueprint Generator</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Enterprise 4K Architecture & 3D Blueprint Engine</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-semibold">
                Dual Mode: Vector + 3D AI
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Synthesize enterprise VMware hybrid topologies into presentation-ready 3840×2160 (4K) blueprints and AI-generated 3D isometric architecture diagrams with glowing neon transit paths.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Explicit Save Blueprint (Strict Legacy Writeback Boundary) */}
            <button
              onClick={handlePersistLegacyState}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow transition-all hover:scale-[1.02]"
              title="Save current blueprint state and synchronize legacy localStorage non-destructively"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>Save Blueprint</span>
            </button>

            {/* Export Complete Blueprint JSON */}
            <button
              onClick={handleExportBlueprintJSON}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow"
              title="Export complete multi-cloud architecture topology model as JSON"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Export Blueprint (JSON)</span>
            </button>

            {/* Primary AI Generation Trigger Button */}
            <button
              onClick={() => setShowPreFlightModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Review & Generate 3D Blueprint</span>
            </button>

            <button
              onClick={() => handleExport4K('png')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow"
              title="Download high-resolution 4K canvas without storage write"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export 4K Canvas</span>
            </button>

            <button
              onClick={() => setShowDossierModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Executive Dossier</span>
            </button>

            <button
              onClick={handleExportBOMExcel}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow"
              title="Generate Bill of Materials Excel spreadsheet and sync storage"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export BOM (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Notice Banner */}
      {saveSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button
            onClick={() => setSaveSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hydration Banner if state was loaded */}
      {importedNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-3 text-xs text-cyan-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{importedNotice}</span>
          </div>
          <button
            onClick={() => setImportedNotice(null)}
            className="text-cyan-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generation Loading Overlay */}
      {isGenerating3D && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              <div className="text-sm font-bold text-white">Generating 3D Isometric Architecture Blueprint</div>
            </div>
            <span className="font-mono text-cyan-400 text-xs font-bold">{generationProgress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{generationStep}</span>
          </p>
        </div>
      )}

      {/* Conflicts Resolution Notification */}
      {conflictsResolvedList.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1.5 text-xs text-amber-200">
          <div className="font-semibold flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Multi-Tool State Conflict Resolution Applied:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
            {conflictsResolvedList.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Architecture Design Track Selector (9 Enterprise Tracks with Category Filters) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Enterprise Architecture Design Track (9 Cloud Tracks)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select foundational multi-cloud, hyperscaler SDDC, or hyperconverged migration pattern.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30">
            Active Track: {activeTemplate.toUpperCase()}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {[
            { id: 'all', label: 'All Tracks (9)' },
            { id: 'nutanix', label: 'Nutanix & Hybrid (3)' },
            { id: 'sddc', label: 'Hyperscaler SDDC (3)' },
            { id: 'native', label: 'Cloud Native (2)' },
            { id: 'migration', label: 'Migration (1)' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategoryTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategoryTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 9 Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Track 1: Nutanix On-Prem */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'nutanix') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('nutanix-onprem')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'nutanix-onprem'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-emerald-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <NutanixPrismIcon className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    AOS / AHV
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Nutanix On-Premises</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  NCI clusters, AHV virtualization, Prism Central management, and Flow microsegmentation.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Primary Datacenter</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 2: Nutanix On-Prem to NC2 on Azure */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'nutanix') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('nutanix-to-nc2')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'nutanix-to-nc2'
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-cyan-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <NutanixAhvIcon className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-500 text-xs">→</span>
                    <AzureVirtualWanIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    NC2 Azure
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Nutanix to NC2 on Azure</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  BareMetal Azure nodes with native Azure vNet integration, Nutanix Move replication, and DR.
                </p>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Hybrid Cloud Extension</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 3: VMware to Nutanix NC2 Assessment */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'migration') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('vmware-to-nc2')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'vmware-to-nc2'
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-indigo-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <VmwareVcenterIcon className="w-5 h-5 text-sky-400" />
                    <span className="text-slate-500 text-xs">→</span>
                    <NutanixMoveIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Migration
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">VMware to NC2 Assessment</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Cross-hypervisor migration assessment, Nutanix Move VirtIO driver injection, and wave cutover.
                </p>
              </div>
              <div className="text-[10px] font-mono text-indigo-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Move Assessment</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 4: Azure VMware Solution (AVS) */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'sddc') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('avs')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'avs'
                  ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-950/50 ring-1 ring-sky-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-sky-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <AzureExpressRouteIcon className="w-6 h-6 text-sky-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    AVS SDDC
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Azure VMware Solution</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  ExpressRoute FastPath, Tier-0 NSX-T gateways, decoupled ANF storage, and Azure native hub.
                </p>
              </div>
              <div className="text-[10px] font-mono text-sky-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Dedicated SDDC</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 5: VMware Cloud on AWS (VMC) */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'sddc') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('vmc-aws')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'vmc-aws'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-amber-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <AwsTransitGatewayIcon className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    AWS VMC
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">VMware Cloud on AWS</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  BareMetal i4i.metal SDDC, high-speed Connected VPC ENI, Transit Gateway, and FSx ONTAP storage.
                </p>
              </div>
              <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>AWS Dedicated SDDC</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 6: Google Cloud VMware Engine (GCVE) */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'sddc') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('gcve')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'gcve'
                  ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-blue-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <GcpInterconnectIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    GCP GCVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Google Cloud VMware Engine</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  ve1-standard-72 nodes with 100 Gbps dedicated interconnect, NetApp Volumes (GCNV), and Cloud Armor.
                </p>
              </div>
              <div className="text-[10px] font-mono text-blue-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>GCP Dedicated SDDC</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 7: AWS Native Enterprise VPC Hub */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'native') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('aws-native')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'aws-native'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-amber-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <AwsTransitGatewayIcon className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    AWS Native
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">AWS Native Enterprise VPC Hub</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Direct Connect gateway, Transit Gateway security inspection, Amazon EKS, Aurora, and S3 tiers.
                </p>
              </div>
              <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Cloud Native VPC</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 8: Google Cloud Native Hub */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'native') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('gcp-native')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'gcp-native'
                  ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-blue-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <GcpInterconnectIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    GCP Native
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Google Cloud Native Hub</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Dedicated Interconnect, Shared VPC host project, GKE enterprise clusters, and BigQuery lakehouse.
                </p>
              </div>
              <div className="text-[10px] font-mono text-blue-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Cloud Native Mesh</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}

          {/* Track 9: Multi-Cloud Enterprise Mesh */}
          {(activeCategoryTab === 'all' || activeCategoryTab === 'nutanix') && (
            <button
              type="button"
              onClick={() => handleSelectTemplate('multi-cloud')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                activeTemplate === 'multi-cloud'
                  ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-purple-600/50 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <AzureVirtualWanIcon className="w-4 h-4 text-sky-400" />
                    <AwsTransitGatewayIcon className="w-4 h-4 text-amber-400" />
                    <GcpInterconnectIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Mesh
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">Multi-Cloud Enterprise Mesh</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Arbitrary multi-DC topology spanning On-Prem, Azure, AWS, and GCP with shared identity & DR.
                </p>
              </div>
              <div className="text-[10px] font-mono text-purple-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Cross-Cloud DR</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Multi-Environment Builder (Step 2) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Dynamic Multi-Environment Builder ({topologyEnvironments.length} Active Environments)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure arbitrary on-premises datacenters, cloud regions, production tiers, and disaster recovery targets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddEnvModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <span>+ Add Custom Environment</span>
          </button>
        </div>

        {/* Environments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {topologyEnvironments.map((env, idx) => {
            const isProd = env.role === 'Production';
            const isDR = env.role === 'Disaster Recovery';
            const isShared = env.role === 'Shared Services';
            const isSecondActive = env.role === 'Secondary Active';

            return (
              <div
                key={env.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Platform Icon Badge */}
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {env.platform.includes('Nutanix') ? (
                        <NutanixAhvIcon className="w-5 h-5 text-emerald-400" />
                      ) : env.platform.includes('Azure') ? (
                        <AzureVirtualWanIcon className="w-5 h-5 text-sky-400" />
                      ) : env.platform.includes('AWS') ? (
                        <AwsTransitGatewayIcon className="w-5 h-5 text-amber-400" />
                      ) : env.platform.includes('Google') || env.platform.includes('GCP') ? (
                        <GcpInterconnectIcon className="w-5 h-5 text-blue-400" />
                      ) : (
                        <VmwareVcenterIcon className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{env.name}</h4>
                      <p className="text-[11px] text-slate-400">{env.region}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                      isProd
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : isDR
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : isSecondActive
                        ? 'bg-sky-950 text-sky-300 border-sky-700'
                        : isShared
                        ? 'bg-slate-900 text-slate-300 border-slate-700'
                        : 'bg-purple-950 text-purple-300 border-purple-700'
                    }`}
                  >
                    {env.role}
                  </span>
                </div>

                {/* Sizing Details */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">HOSTS / SKU</span>
                    <span className="font-semibold text-white">
                      {env.hostCount > 0 ? `${env.hostCount}x ${env.nodeSku.split(' ')[0]}` : 'Serverless'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">COMPUTE</span>
                    <span className="font-semibold text-cyan-300">
                      {env.totalVcpu} vCPU
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">STORAGE</span>
                    <span className="font-semibold text-emerald-300">
                      {env.storageTB} TiB
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-900">
                  <span className="font-mono text-[10px] text-slate-500">CIDR: {env.cidrBlock}</span>
                  {topologyEnvironments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEnvironment(env.id)}
                      className="text-rose-400 hover:text-rose-300 text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform-Specific Resilience Validation Warning Banner */}
        {getPlatformResilienceWarnings().length > 0 && (
          <div className="space-y-2 pt-2">
            {getPlatformResilienceWarnings().map((w, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  w.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                }`}
              >
                {w.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <strong>Technical Architecture Requirement: </strong>
                  <span>{w.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Environment Modal */}
      {showAddEnvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Add New Infrastructure Environment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEnvModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Environment Name with validation and requirement helper text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">
                    Environment Name <span className="text-rose-400">*</span>
                  </label>
                  {isEnvNameEmpty ? (
                    <span className="text-[11px] text-amber-400/90 font-mono">Required to enable button</span>
                  ) : isEnvNameDuplicate ? (
                    <span className="text-[11px] text-rose-400 font-mono font-semibold">Name already in use</span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Frankfurt DR Secondary Datacenter"
                  value={newEnvName}
                  onChange={e => setNewEnvName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 text-xs focus:outline-none transition ${
                    isEnvNameDuplicate
                      ? 'border-rose-500 focus:border-rose-400'
                      : isEnvNameEmpty
                      ? 'border-slate-800 focus:border-cyan-500'
                      : 'border-emerald-500/60 focus:border-emerald-400'
                  }`}
                />
                {isEnvNameDuplicate && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>An environment named &ldquo;{trimmedEnvName}&rdquo; already exists. Please choose a unique name.</span>
                  </p>
                )}
                {isEnvNameEmpty && (
                  <p className="text-[11px] text-slate-400">
                    Enter a descriptive identifier (e.g., region, role, or facility name).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Platform Technology</label>
                  <select
                    value={newEnvPlatform}
                    onChange={e => setNewEnvPlatform(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Nutanix AHV">Nutanix AHV (On-Premises)</option>
                    <option value="Nutanix NC2 on Azure">Nutanix NC2 on Azure</option>
                    <option value="Azure VMware Solution">Azure VMware Solution (AVS)</option>
                    <option value="VMware vSphere">VMware vSphere (On-Premises)</option>
                    <option value="VMware Cloud on AWS">VMware Cloud on AWS</option>
                    <option value="Google Cloud VMware Engine">Google Cloud VMware Engine</option>
                    <option value="AWS Native">AWS Native VPC Hub</option>
                    <option value="GCP Native">Google Cloud Native Hub</option>
                    <option value="Co-Location Datacenter">Co-Location Datacenter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Operational Role</label>
                  <select
                    value={newEnvRole}
                    onChange={e => setNewEnvRole(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Production">Primary Production</option>
                    <option value="Disaster Recovery">Disaster Recovery (DR)</option>
                    <option value="Secondary Active">Secondary Active-Active</option>
                    <option value="Dev/Test">Development & Test</option>
                    <option value="Shared Services">Shared Services Hub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Region / Facility</label>
                  <input
                    type="text"
                    placeholder="e.g. Azure West Europe"
                    value={newEnvRegion}
                    onChange={e => setNewEnvRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Management CIDR</label>
                    {isCidrFormatInvalid ? (
                      <span className="text-[11px] text-rose-400 font-mono font-semibold">Invalid CIDR</span>
                    ) : trimmedCidr ? (
                      <span className="text-[11px] text-emerald-400 font-mono">IPv4 Valid</span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Optional</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="10.240.0.0/22"
                    value={newEnvCidr}
                    onChange={e => setNewEnvCidr(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 text-xs font-mono focus:outline-none transition ${
                      isCidrFormatInvalid
                        ? 'border-rose-500 focus:border-rose-400'
                        : trimmedCidr
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-slate-800 focus:border-cyan-500'
                    }`}
                  />
                  {isCidrFormatInvalid ? (
                    <p className="text-[11px] text-rose-400">
                      Enter a valid IPv4 CIDR block (e.g. 10.240.0.0/22 or 172.16.0.0/16, prefix /0 to /32).
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Format: x.x.x.x/yy (leave blank if unassigned).
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Host / Node Count</label>
                    {!isHostCountValid && (
                      <span className="text-[11px] text-rose-400 font-mono font-semibold">Invalid count</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={newEnvPlatform.includes('Native') ? 0 : 1}
                    max={64}
                    value={newEnvHosts}
                    onChange={e => setNewEnvHosts(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 text-xs font-mono focus:outline-none transition ${
                      !isHostCountValid ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {newEnvPlatform.includes('Native')
                      ? 'Native VPC / VNet services (0 allowed for serverless/managed)'
                      : 'Physical or baremetal hypervisor nodes (min 1)'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Storage Footprint (TB)</label>
                    {!isStorageValid && (
                      <span className="text-[11px] text-rose-400 font-mono font-semibold">Invalid TB</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newEnvStorageTB}
                    onChange={e => setNewEnvStorageTB(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 text-xs font-mono focus:outline-none transition ${
                      !isStorageValid ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Raw or usable storage allocation (TB)
                  </span>
                </div>
              </div>
            </div>

            {/* Validation helper status bar */}
            {!isAddEnvFormValid && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Required to add environment:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  {isEnvNameEmpty && <li>Provide an Environment Name</li>}
                  {isEnvNameDuplicate && <li>Choose an Environment Name that is not already in use</li>}
                  {isCidrFormatInvalid && <li>Provide a valid IPv4 CIDR (or leave blank)</li>}
                  {!isHostCountValid && <li>Enter a valid non-negative host count</li>}
                  {!isStorageValid && <li>Enter a valid positive storage footprint in TB</li>}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Newly created environments are added as unlinked zones until connected.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEnvModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddEnvironment}
                  disabled={!isAddEnvFormValid}
                  title={!isAddEnvFormValid ? 'Complete all required fields to add environment' : undefined}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Add Environment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Interactive Infrastructure Capture Wizard (4 Columns / Form Sections) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Step 3: Workload & Sizing Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {/* Section 1: Customer & Cloud */}
          <div className="space-y-3">
            <div className="font-mono text-cyan-400 font-bold uppercase text-[10px]">01. Metadata & Cloud</div>
            <div className="space-y-1">
              <label className="text-slate-300">Customer Organization Name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Lead Principal Architect</label>
              <input
                type="text"
                value={architectName}
                onChange={e => setArchitectName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Target Hyperscaler Platform</label>
              <select
                value={cloudPlatform}
                onChange={e => setCloudPlatform(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-bold"
              >
                <option value="Azure VMware Solution">Azure VMware Solution (AVS)</option>
                <option value="VMware Cloud on AWS">VMware Cloud on AWS (VMC)</option>
                <option value="Google Cloud VMware Engine">Google Cloud VMware Engine (GCVE)</option>
              </select>
            </div>
          </div>

          {/* Section 2: On-Premises Inventory */}
          <div className="space-y-3">
            <div className="font-mono text-cyan-400 font-bold uppercase text-[10px]">02. On-Premises SDDC</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-300">vCenter Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={vCenterCount}
                  onChange={e => setVCenterCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300">ESXi Hosts</label>
                <input
                  type="number"
                  min="4"
                  max="200"
                  value={esxiHostCount}
                  onChange={e => setEsxiHostCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-300">Cluster Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={clusterCount}
                  onChange={e => setClusterCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300">Total VMs</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={totalVMCount}
                  onChange={e => setTotalVMCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono font-bold text-cyan-300"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Environments</label>
              <div className="flex gap-2 text-[10px]">
                {['Dev', 'Staging', 'Prod'].map(env => (
                  <button
                    key={env}
                    onClick={() => {
                      setEnvironments(prev =>
                        prev.includes(env) ? prev.filter(e => e !== env) : [...prev, env]
                      );
                    }}
                    className={`px-2 py-1 rounded border font-mono cursor-pointer ${
                      environments.includes(env)
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Network & Security */}
          <div className="space-y-3">
            <div className="font-mono text-cyan-400 font-bold uppercase text-[10px]">03. Network & Security Edge</div>
            <div className="space-y-1">
              <label className="text-slate-300">Physical Connectivity</label>
              <select
                value={connectivity}
                onChange={e => setConnectivity(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px]"
              >
                <option value="Hybrid (VPN + ExpressRoute / DirectConnect)">Hybrid (VPN + ExpressRoute / DirectConnect)</option>
                <option value="Direct Circuits with FastPath / Global Reach">Direct Circuits (FastPath / Global Reach)</option>
                <option value="VPN Only">IPsec VPN Only</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">NVA Firewall Architecture</label>
              <select
                value={nvaFirewall}
                onChange={e => setNvaFirewall(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px]"
              >
                <option value="Palo Alto Networks VM-Series">Palo Alto Networks VM-Series</option>
                <option value="Azure Firewall Premium / Native">Azure Firewall Premium / Native</option>
                <option value="Fortinet FortiGate-VM">Fortinet FortiGate-VM</option>
                <option value="Check Point CloudGuard">Check Point CloudGuard</option>
                <option value="Cisco Secure Firewall">Cisco Secure Firewall</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">WAF Solution</label>
              <select
                value={wafSolution}
                onChange={e => setWafSolution(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px]"
              >
                <option value="Azure WAF on Application Gateway">Azure WAF on App Gateway</option>
                <option value="Cloudflare Magic Transit">Cloudflare Magic Transit</option>
                <option value="AWS WAF">AWS WAF</option>
                <option value="F5 Distributed Cloud WAF">F5 Distributed Cloud WAF</option>
              </select>
            </div>
          </div>

          {/* Section 4: Hyperscaler SDDC Settings */}
          <div className="space-y-3">
            <div className="font-mono text-cyan-400 font-bold uppercase text-[10px]">04. SDDC SKU & IPAM</div>
            <div className="space-y-1">
              <label className="text-slate-300">Bare-Metal Node SKU</label>
              <select
                value={nodeSku}
                onChange={e => setNodeSku(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] font-mono font-bold text-cyan-300"
              >
                {cloudPlatform === 'Azure VMware Solution' && (
                  <>
                    <option value="AV36P">AV36P (36 cores, 576GB RAM)</option>
                    <option value="AV64">AV64 (64 cores, 1024GB RAM)</option>
                    <option value="AV48">AV48 (48 cores, 768GB RAM)</option>
                    <option value="AV52">AV52 (52 cores, 1536GB RAM)</option>
                    <option value="AV36">AV36 (36 cores, 576GB RAM)</option>
                  </>
                )}
                {cloudPlatform === 'VMware Cloud on AWS' && (
                  <>
                    <option value="i4i.metal">i4i.metal (64 cores, 1024GB RAM)</option>
                    <option value="i3en.metal">i3en.metal (96 cores, 768GB RAM)</option>
                    <option value="m7i.metal-24xl">m7i.metal-24xl (96 cores, 384GB RAM)</option>
                  </>
                )}
                {cloudPlatform === 'Google Cloud VMware Engine' && (
                  <>
                    <option value="ve1-standard-72">ve1-standard-72 (72 cores, 768GB RAM)</option>
                    <option value="ve2-standard-128">ve2-standard-128 (128 cores, 2048GB RAM)</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-300">Management IP CIDR</label>
                <span className="text-[10px] text-cyan-400 font-mono">/22 Required</span>
              </div>
              <input
                type="text"
                placeholder="10.240.0.0/22"
                value={mgmtCidrInput}
                onChange={e => setMgmtCidrInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Decoupled Storage (TB)</label>
              <input
                type="number"
                min="0"
                max="800"
                value={decoupledStorageTB}
                onChange={e => setDecoupledStorageTB(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono font-bold text-cyan-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Dual-Mode Topology Viewport (Interactive Multi-Tier Canvas + Static 4K Viewport) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Step 4: Topology Canvas</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {topologyEnvironments.length} Nodes · {interconnectLinks.length} Interconnect Links
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Multi-Cloud Architecture Canvas</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Viewport Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setCanvasMode('interactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  canvasMode === 'interactive'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Interactive Canvas</span>
              </button>
              <button
                type="button"
                onClick={() => setCanvasMode('static-vector')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  canvasMode === 'static-vector'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Static 4K Vector Blueprint</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.1))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono text-cyan-300">{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale(prev => Math.min(1.8, prev + 0.1))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomScale(1.0)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer text-[10px] font-mono"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            {/* Export 4K PNG (Zero storage writes) */}
            <button
              onClick={() => handleExport4K('png')}
              className="px-3 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>4K PNG</span>
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="overflow-x-auto overflow-y-hidden border border-slate-800 rounded-xl bg-slate-950 p-4">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.15s ease-out',
              width: '1280px',
              height: '720px'
            }}
            className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-2xl select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            {canvasMode === 'interactive' ? (
              /* ========================================================================= */
              /* MODE 1: Interactive Multi-Tier Architecture Canvas                        */
              /* ========================================================================= */
              <div className="relative w-full h-full bg-slate-950 overflow-hidden">
                {/* Canvas Background Grid */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <pattern id="interactiveGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="1280" height="720" fill="url(#interactiveGrid)" />
                </svg>

                {/* Multi-Tier Column Background Dividers */}
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none border-b border-slate-900">
                  <div className="border-r border-slate-800/60 p-4 bg-slate-900/10">
                    <span className="text-[11px] font-mono font-bold text-cyan-400/70 tracking-wider uppercase">
                      TIER 1: SOURCE & ON-PREMISES DC
                    </span>
                  </div>
                  <div className="border-r border-slate-800/60 p-4 bg-slate-900/20">
                    <span className="text-[11px] font-mono font-bold text-indigo-400/70 tracking-wider uppercase">
                      TIER 2: TRANSIT & SECURITY HUBS
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/10">
                    <span className="text-[11px] font-mono font-bold text-emerald-400/70 tracking-wider uppercase">
                      TIER 3: TARGET CLOUD SDDC / NATIVE / DR
                    </span>
                  </div>
                </div>

                {/* Floating Connecting Mode Banner */}
                {connectingSourceId && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500 shadow-xl flex items-center gap-3 text-xs text-amber-200">
                    <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>
                      Connecting from: <strong>{topologyEnvironments.find(e => e.id === connectingSourceId)?.name}</strong>. Click target node to establish link.
                    </span>
                    <button
                      type="button"
                      onClick={() => setConnectingSourceId(null)}
                      className="px-2 py-0.5 rounded bg-amber-900 hover:bg-amber-800 text-white text-[10px] font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Interactive SVG Interconnect Curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {interconnectLinks.map(link => {
                    const sourceNode = topologyEnvironments.find(e => e.id === link.sourceId);
                    const targetNode = topologyEnvironments.find(e => e.id === link.targetId);
                    if (!sourceNode || !targetNode) return null;

                    const sx = (sourceNode.x ?? 80) + 290;
                    const sy = (sourceNode.y ?? 120) + 70;
                    const tx = (targetNode.x ?? 780);
                    const ty = (targetNode.y ?? 120) + 70;

                    const dx = Math.abs(tx - sx) * 0.45;
                    const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
                    const strokeColor = link.protocol.includes('ExpressRoute')
                      ? '#38bdf8'
                      : link.protocol.includes('Direct Connect')
                      ? '#f59e0b'
                      : link.protocol.includes('Interconnect')
                      ? '#60a5fa'
                      : link.protocol.includes('Move') || link.protocol.includes('HCX')
                      ? '#10b981'
                      : '#c084fc';

                    const midX = (sx + tx) / 2;
                    const midY = (sy + ty) / 2;

                    return (
                      <g key={link.id}>
                        {/* Glow halo */}
                        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="6" opacity="0.2" />
                        {/* Main connection line */}
                        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2.5" />
                        {/* Directional animated dashes */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="6,8"
                          opacity="0.8"
                        />
                        {/* Link Protocol & Bandwidth Badge */}
                        <foreignObject
                          x={midX - 70}
                          y={midY - 14}
                          width="140"
                          height="28"
                          className="pointer-events-auto"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEditLink(link)}
                            className="w-full h-full px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-[10px] font-mono text-slate-200 hover:text-white flex items-center justify-center gap-1 shadow-lg cursor-pointer transition"
                            title={`Click to edit or remove ${link.protocol} link (${link.bandwidthGbps} Gbps)`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span className="font-bold text-cyan-300">{link.bandwidthGbps}G</span>
                            <span className="truncate">{link.protocol.split(' ')[0]}</span>
                          </button>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Node Cards */}
                <div className="absolute inset-0 z-20 pointer-events-auto">
                  {topologyEnvironments.map(env => {
                    const isSourceSelected = connectingSourceId === env.id;
                    const isTargetCandidate = Boolean(connectingSourceId && connectingSourceId !== env.id);
                    const isSelected = selectedNodeId === env.id;

                    const isProd = env.role === 'Production';
                    const isDR = env.role === 'Disaster Recovery';
                    const isShared = env.role === 'Shared Services';

                    return (
                      <div
                        key={env.id}
                        style={{
                          transform: `translate(${env.x ?? 80}px, ${env.y ?? 120}px)`,
                          width: '290px'
                        }}
                        onMouseDown={e => handleNodeMouseDown(e, env)}
                        className={`absolute rounded-xl bg-slate-900/95 border shadow-2xl transition-shadow select-none ${
                          isSourceSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-950/50'
                            : isTargetCandidate
                            ? 'border-cyan-400 ring-2 ring-cyan-400/40 animate-pulse'
                            : isSelected
                            ? 'border-cyan-500 ring-1 ring-cyan-500'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Draggable Card Header */}
                        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing bg-slate-950/40 rounded-t-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                            <div className="p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                              {env.platform.includes('Nutanix') ? (
                                <NutanixAhvIcon className="w-4 h-4 text-emerald-400" />
                              ) : env.platform.includes('Azure') ? (
                                <AzureVirtualWanIcon className="w-4 h-4 text-sky-400" />
                              ) : env.platform.includes('AWS') ? (
                                <AwsTransitGatewayIcon className="w-4 h-4 text-amber-400" />
                              ) : env.platform.includes('Google') || env.platform.includes('GCP') ? (
                                <GcpInterconnectIcon className="w-4 h-4 text-blue-400" />
                              ) : (
                                <VmwareVcenterIcon className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{env.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate">{env.region}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              isProd
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : isDR
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : isShared
                                ? 'bg-slate-900 text-slate-300 border-slate-700'
                                : 'bg-sky-950 text-sky-300 border-sky-700'
                            }`}
                          >
                            {env.role}
                          </span>
                        </div>

                        {/* Card Body - Infrastructure Metrics */}
                        <div className="p-3 space-y-2 text-[11px] font-mono">
                          <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                            <div>
                              <span className="text-[9px] text-slate-500 block">HOSTS</span>
                              <span className="font-bold text-white text-xs">{env.hostCount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block">VCPU</span>
                              <span className="font-bold text-cyan-300 text-xs">{env.totalVcpu}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block">STORAGE</span>
                              <span className="font-bold text-emerald-300 text-xs">{env.storageTB}T</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>CIDR: {env.cidrBlock}</span>
                            <span className="text-slate-500 truncate max-w-[120px]">{env.nodeSku.split(' ')[0]}</span>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-2 border-t border-slate-800/80 bg-slate-950/30 rounded-b-xl flex items-center justify-between gap-1 text-[10px]">
                          {isTargetCandidate ? (
                            <button
                              type="button"
                              onClick={() => handleFinishConnect(env.id)}
                              className="w-full py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Connect Here</span>
                            </button>
                          ) : isSourceSelected ? (
                            <span className="w-full text-center py-1 text-amber-300 font-mono font-semibold">
                              Source Selected
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartConnect(env.id)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1 cursor-pointer transition"
                                title="Start drawing connection link to another node"
                              >
                                <Link2 className="w-3 h-3" />
                                <span>Connect</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedNodeId(env.id)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer transition"
                                title="Inspect and edit node sizing parameters"
                              >
                                <Settings2 className="w-3 h-3 text-slate-400" />
                                <span>Inspect</span>
                              </button>
                              {topologyEnvironments.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEnvironment(env.id)}
                                  className="px-2 py-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 cursor-pointer transition"
                                  title="Remove environment"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Node Spec Inspector Drawer / Modal */}
                {selectedNodeId && (() => {
                  const inspectingNode = topologyEnvironments.find(e => e.id === selectedNodeId);
                  if (!inspectingNode) return null;
                  const nodeLinks = interconnectLinks.filter(
                    l => l.sourceId === inspectingNode.id || l.targetId === inspectingNode.id
                  );

                  return (
                    <div className="absolute top-4 right-4 z-40 w-96 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl p-5 text-slate-100 space-y-4 animate-in slide-in-from-right duration-150">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold text-white truncate">Node Spec Inspector</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] uppercase font-mono">Environment Name</label>
                          <input
                            type="text"
                            value={inspectingNode.name}
                            onChange={e => handleUpdateNodeSpec(inspectingNode.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-mono">Platform</label>
                            <input
                              type="text"
                              disabled
                              value={inspectingNode.platform}
                              className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-slate-400 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-mono">Region</label>
                            <input
                              type="text"
                              value={inspectingNode.region}
                              onChange={e => handleUpdateNodeSpec(inspectingNode.id, { region: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase">Hosts</label>
                            <input
                              type="number"
                              min="0"
                              max="64"
                              value={inspectingNode.hostCount}
                              onChange={e =>
                                handleUpdateNodeSpec(inspectingNode.id, {
                                  hostCount: Number(e.target.value),
                                  totalVcpu: Number(e.target.value) * 36,
                                  totalRamGB: Number(e.target.value) * 576
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase">vCPU</label>
                            <input
                              type="number"
                              value={inspectingNode.totalVcpu}
                              onChange={e => handleUpdateNodeSpec(inspectingNode.id, { totalVcpu: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-cyan-300 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase">Storage TB</label>
                            <input
                              type="number"
                              min="1"
                              value={inspectingNode.storageTB}
                              onChange={e => handleUpdateNodeSpec(inspectingNode.id, { storageTB: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-emerald-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] uppercase font-mono">Management CIDR</label>
                          <input
                            type="text"
                            value={inspectingNode.cidrBlock}
                            onChange={e => handleUpdateNodeSpec(inspectingNode.id, { cidrBlock: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                          />
                        </div>

                        {/* Connected Interconnect Links */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-mono block">Connected Links ({nodeLinks.length})</span>
                          {nodeLinks.length === 0 ? (
                            <p className="text-[11px] text-slate-500">Unlinked zone. Click 'Connect' on canvas to create an interconnect link.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {nodeLinks.map(link => (
                                <div key={link.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                                  <div className="truncate pr-2">
                                    <span className="text-cyan-400 font-mono font-bold">{link.bandwidthGbps}G</span> · {link.protocol}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="text-rose-400 hover:text-rose-300 text-[10px] cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(null)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Configure Interconnect Link Modal */}
                {showLinkModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-sm font-bold text-white">
                            {editingLinkId ? 'Edit Interconnect Link' : 'Establish Network Interconnect Link'}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLinkModal(false)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Source</span>
                            <span className="font-bold text-cyan-300">
                              {topologyEnvironments.find(e => e.id === linkModalSourceId)?.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Target</span>
                            <span className="font-bold text-emerald-300">
                              {topologyEnvironments.find(e => e.id === linkModalTargetId)?.name}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">Interconnect Protocol</label>
                          <select
                            value={linkProtocol}
                            onChange={e => setLinkProtocol(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                          >
                            <option value="ExpressRoute FastPath">Azure ExpressRoute FastPath (Ultra High Speed)</option>
                            <option value="AWS Direct Connect">AWS Direct Connect Gateway (10G Dedicated)</option>
                            <option value="Google Cloud Interconnect">Google Cloud Dedicated Interconnect</option>
                            <option value="IPsec VPN">Site-to-Site IPsec VPN Tunnel</option>
                            <option value="VMware HCX L2 Extension">VMware HCX Network Extension (L2 Stretch)</option>
                            <option value="Nutanix Move">Nutanix Move Non-Disruptive Migration Pipe</option>
                            <option value="Nutanix Protection Domain / Leap">Nutanix Protection Domains (NearSync / Leap)</option>
                            <option value="VNet / VPC Peering">Cloud Native VNet / VPC Peering</option>
                            <option value="Transit Gateway Route">Transit Gateway Inter-Region Peering</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-300 font-medium">Bandwidth (Gbps)</label>
                            <select
                              value={linkBandwidth}
                              onChange={e => setLinkBandwidth(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono font-bold text-cyan-400"
                            >
                              <option value="1">1 Gbps</option>
                              <option value="10">10 Gbps</option>
                              <option value="25">25 Gbps</option>
                              <option value="40">40 Gbps</option>
                              <option value="100">100 Gbps</option>
                            </select>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={linkRedundant}
                                onChange={e => setLinkRedundant(e.target.checked)}
                                className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                              />
                              <span>Dual Redundant Circuit</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">Notes & Annotations</label>
                          <input
                            type="text"
                            placeholder="e.g. Dedicated 10G pipe with 99.99% SLA"
                            value={linkNotes}
                            onChange={e => setLinkNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        {editingLinkId ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(editingLinkId)}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-semibold cursor-pointer"
                          >
                            Delete Link
                          </button>
                        ) : (
                          <div />
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowLinkModal(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveLink}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            {editingLinkId ? 'Save Changes' : 'Establish Link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ========================================================================= */
              /* MODE 2: Preserved Static 4K Vector Blueprint Viewport                     */
              /* ========================================================================= */
              <svg viewBox="0 0 1280 720" className="w-full h-full">
                {/* Grid Background */}
                <defs>
                  <pattern id="diagGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="1280" height="720" fill="url(#diagGrid)" />

                {/* Header Box */}
                <rect x="30" y="25" width="1220" height="65" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="50" y="52" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="Plus Jakarta Sans">
                  {customerName} — {cloudPlatform} Architecture Blueprint
                </text>
                <text x="50" y="74" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">
                  ARCHITECT: {architectName} · DATE: {projectDate} · NODE SKU: {nodeSku} ({calculatedCloudNodes} NODES) · MGMT CIDR: {effectiveMgmtCidr}
                </text>

                {/* Panel 1: On-Premises Datacenter (Left) */}
                <rect x="30" y="110" width="370" height="570" rx="10" fill="#0b1120" stroke="#334155" strokeWidth="1" />
                <text x="50" y="140" fill="#06b6d4" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans">
                  01. ON-PREMISES DATACENTER
                </text>

                {/* On-Prem Box 1: vSphere Compute */}
                <rect x="50" y="160" width="330" height="150" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="65" y="185" fill="#ffffff" fontSize="12" fontWeight="bold">VMware vCenter Server (VCSA)</text>
                <text x="65" y="210" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {vCenterCount} vCenter Instance(s)</text>
                <text x="65" y="230" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {clusterCount} Clusters · {esxiHostCount} ESXi Hosts</text>
                <text x="65" y="250" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {totalVMCount} Virtual Machines</text>
                <text x="65" y="270" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {vdsCount} Virtual Distributed Switches</text>

                {/* On-Prem Box 2: SAN Storage */}
                <rect x="50" y="325" width="330" height="130" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="65" y="350" fill="#ffffff" fontSize="12" fontWeight="bold">SAN / NAS Storage Tier</text>
                <text x="65" y="375" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Fibre Channel / iSCSI Clustered Arrays</text>
                <text x="65" y="395" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Stretched VLANs: {subsegments.map(s => s.vlanId).join(', ')}</text>
                <text x="65" y="415" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Environments: {environments.join(', ')}</text>

                {/* On-Prem Box 3: HCX Connector */}
                <rect x="50" y="470" width="330" height="180" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                <text x="65" y="495" fill="#34d399" fontSize="12" fontWeight="bold">VMware HCX Connector Fleet</text>
                <text x="65" y="520" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• HCX Interconnect (IX) Service Engine</text>
                <text x="65" y="540" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• HCX Network Extension (NE) L2 Stretch</text>
                <text x="65" y="560" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• HCX WAN Optimization (WO)</text>
                <text x="65" y="580" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• Mobility Optimized Networking (MON)</text>

                {/* Panel 2: Hybrid Transit & Edge Security (Center) */}
                <rect x="430" y="110" width="370" height="570" rx="10" fill="#0b1120" stroke="#334155" strokeWidth="1" />
                <text x="450" y="140" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans">
                  02. HYBRID TRANSIT & EDGE
                </text>

                {/* Center Box 1: Interconnect */}
                <rect x="450" y="160" width="330" height="130" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="465" y="185" fill="#ffffff" fontSize="12" fontWeight="bold">Cloud Interconnect & Peering</text>
                <text x="465" y="210" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {connectivity}</text>
                <text x="465" y="230" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Dual Redundant 10G Circuits</text>
                <text x="465" y="250" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• BGP Dynamic Route Peering</text>

                {/* Center Box 2: Landing Zone */}
                <rect x="450" y="305" width="330" height="150" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="465" y="330" fill="#ffffff" fontSize="12" fontWeight="bold">Landing Zone Architecture</text>
                <text x="465" y="355" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• {landingZone}</text>
                <text x="465" y="375" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• FastPath Gateway Acceleration</text>
                <text x="465" y="395" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Route Server Peering Active</text>

                {/* Center Box 3: NVA Firewall & WAF */}
                <rect x="450" y="470" width="330" height="180" rx="6" fill="#581c87" stroke="#a855f7" strokeWidth="1" />
                <text x="465" y="495" fill="#d8b4fe" fontSize="12" fontWeight="bold">NVA Firewall: {nvaFirewall.split(' ')[0]}</text>
                <text x="465" y="520" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• {nvaFirewall}</text>
                <text x="465" y="540" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• WAF: {wafSolution}</text>
                <text x="465" y="560" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• Zero-Trust Inspection & IDS/IPS</text>
                <text x="465" y="580" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• Egress Cloud Breakout Routing</text>

                {/* Panel 3: Cloud SDDC Core (Right) */}
                <rect x="830" y="110" width="420" height="570" rx="10" fill="#0b1120" stroke="#334155" strokeWidth="1" />
                <text x="850" y="140" fill="#10b981" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans">
                  03. {cloudPlatform.toUpperCase()} SDDC CORE
                </text>

                {/* SDDC Box 1: Bare-Metal Hosts */}
                <rect x="850" y="160" width="380" height="150" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="865" y="185" fill="#ffffff" fontSize="12" fontWeight="bold">
                  {calculatedCloudNodes} Hosts ({nodeSku}) — {avsGen}
                </text>
                <text x="865" y="210" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Management CIDR: {effectiveMgmtCidr}</text>
                <text x="865" y="230" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• VMware ESXi Hypervisor + vSAN</text>
                <text x="865" y="250" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Sized for {totalVMCount} VMs (N+1 HA Buffer)</text>

                {/* SDDC Box 2: NSX-T Core */}
                <rect x="850" y="325" width="380" height="150" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="865" y="350" fill="#ffffff" fontSize="12" fontWeight="bold">NSX-T SDN & Tier-0/Tier-1 Routing</text>
                <text x="865" y="375" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Tier-0 Active-Active Gateway (ECMP)</text>
                <text x="865" y="395" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Segregated Tier-1s: {environments.map(e => `T1-${e}`).join(', ')}</text>
                <text x="865" y="415" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">• Distributed Firewall (DFW) Microseg</text>

                {/* SDDC Box 3: Decoupled Storage */}
                <rect x="850" y="490" width="380" height="160" rx="6" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1" />
                <text x="865" y="515" fill="#38bdf8" fontSize="12" fontWeight="bold">
                  External Decoupled Storage Tier ({decoupledStorageTB} TB)
                </text>
                <text x="865" y="540" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">
                  • {externalStorageName}
                </text>
                <text x="865" y="560" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• High-IOPS NFS Datastore Mounts</text>
                <text x="865" y="580" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">• Offloads Storage Sprawl from Bare-Metal Hosts</text>

                {/* Interconnect Connecting Arrows */}
                <path d="M 380 540 L 450 220" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,4" fill="none" />
                <path d="M 780 380 L 850 380" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,4" fill="none" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Workspace Bridge */}
      <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Google Drive Shared Architecture Repository</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Save your generated 4K topology images and executive dossiers directly to Google Drive folder: <span className="font-mono text-cyan-300 select-all">{GOOGLE_DRIVE_CONFIG.folderId}</span>.
            </div>
          </div>
        </div>
        <a
          href={GOOGLE_DRIVE_CONFIG.folderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shrink-0"
        >
          <span>Open Shared Google Drive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Pre-Flight "Review & Confirm Architecture Inputs" Modal */}
      {showPreFlightModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 text-slate-200 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 uppercase font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Architecture Pre-Flight Review</span>
                </span>
                <h2 className="text-xl font-bold text-white">Review & Confirm Architecture Inputs</h2>
              </div>
              <button
                onClick={() => setShowPreFlightModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Verify the synthesized customer parameters, sized bare-metal hosts, network topology, and disaster recovery settings before initiating the 3D isometric diagram rendering engine.
            </p>

            {/* Inputs Review Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Customer & Project</div>
                <div className="font-bold text-white text-sm">{customerName}</div>
                <div className="text-[11px] text-cyan-300 font-sans">Lead: {architectName}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Target Hyperscaler & Nodes</div>
                <div className="font-bold text-emerald-400 text-sm">{calculatedCloudNodes}x {nodeSku} Nodes</div>
                <div className="text-[11px] text-slate-300 font-sans">{cloudPlatform}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Storage Tiers</div>
                <div className="font-bold text-white text-xs">Primary: vSAN Enterprise / ESA</div>
                <div className="text-[11px] text-cyan-300">Decoupled: {decoupledStorageTB} TB ({externalStorageName})</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Workload Specifications</div>
                <div className="font-bold text-white text-xs">{totalVMCount} Virtual Machines</div>
                <div className="text-[11px] text-slate-400">~{totalVMCount * 4} vCPUs · ~{totalVMCount * 16} GiB RAM</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Disaster Recovery Strategy</div>
                <div className="font-bold text-indigo-300 text-xs">{drEngine}</div>
                <div className="text-[11px] text-slate-400">{drRpoMinutes}-Min RPO · {drRtoMinutes}-Min RTO ({drStrategy})</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">Security Edge & Connectivity</div>
                <div className="font-bold text-purple-300 text-xs">{nvaFirewall}</div>
                <div className="text-[11px] text-slate-400">{connectivity}</div>
              </div>
            </div>

            {/* Visual Aesthetic Confirmation */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Visual Aesthetic Profile:</span>
                </div>
                <div className="text-slate-400 text-[11px]">Dark enterprise blueprint palette with glowing neon cyan/violet network paths</div>
              </div>
              <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
                UHD 4K Ready
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPreFlightModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Cancel & Adjust
              </button>
              <button
                onClick={handleGenerateAIBlueprint}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Generate 3D Architecture Blueprint</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Isometric AI Blueprint Viewer Modal */}
      {show3DModal && aiBlueprintResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex justify-center">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-6xl w-full p-6 space-y-5 text-slate-200 shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3D Isometric Cloud Architecture Blueprint</span>
                  </span>
                  {aiBlueprintResult.isFallback ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                      Bundled High-Res Asset
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                      Live Gemini Imagen 3 Render
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{customerName} — 3D Architecture Topology</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setBlueprint3DZoom(prev => Math.max(0.7, prev - 0.15))}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 text-xs font-mono text-cyan-300">{Math.round(blueprint3DZoom * 100)}%</span>
                  <button
                    onClick={() => setBlueprint3DZoom(prev => Math.min(2.0, prev + 0.15))}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setBlueprint3DZoom(1.0)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer text-[10px] font-mono"
                  >
                    100%
                  </button>
                </div>

                <button
                  onClick={handleDownloadAIBlueprint}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 3D Blueprint (.png)</span>
                </button>

                <button
                  onClick={() => setShow3DModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewport for Image */}
            <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[460px] max-h-[65vh]">
              <div
                style={{
                  transform: `scale(${blueprint3DZoom})`,
                  transition: 'transform 0.15s ease-out'
                }}
                className="max-w-full max-h-full flex items-center justify-center p-2"
              >
                <img
                  src={aiBlueprintResult.imageUrl}
                  alt={`${customerName} 3D Isometric Cloud Blueprint`}
                  className="rounded-lg object-contain shadow-2xl max-h-[60vh] w-auto"
                />
              </div>
            </div>

            {/* Footer with Metadata & Google Drive Handoff */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-white font-bold">{calculatedCloudNodes}x {nodeSku}</span> in {cloudPlatform} · <span className="text-cyan-300">{decoupledStorageTB} TB</span> {externalStorageName} · DR: {drEngine}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={GOOGLE_DRIVE_CONFIG.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Sync with Shared Google Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setShow3DModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Dossier Printable Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-8 space-y-6 text-slate-200 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Executive Architecture Deliverable</span>
                <h2 className="text-xl font-bold text-white">{customerName} — Cloud Blueprint Dossier</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>Platform: <span className="font-bold text-white">{cloudPlatform}</span></div>
              <div>Node SKU: <span className="font-bold text-cyan-300">{nodeSku} ({calculatedCloudNodes} Hosts)</span></div>
              <div>Management CIDR: <span className="font-bold text-white">{effectiveMgmtCidr}</span></div>
              <div>Decoupled Storage: <span className="font-bold text-cyan-300">{decoupledStorageTB} TB</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white uppercase font-mono">Bill of Materials (BOM) Summary:</div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• {calculatedCloudNodes} Bare-Metal Hosts running {cloudPlatform} SDDC</li>
                <li>• {decoupledStorageTB} TB External High-Performance NFS Datastore Tier ({externalStorageName})</li>
                <li>• VMware HCX Enterprise Mobility Fleet (IX, NE, WO)</li>
                <li>• NSX-T Tier-0 Active-Active Gateway with ECMP Peering</li>
                <li>• NVA Next-Gen Firewall: {nvaFirewall}</li>
                <li>• Web Application Firewall: {wafSolution}</li>
                <li>• Disaster Recovery Engine: {drEngine} ({drRpoMinutes}-Min RPO, {drRtoMinutes}-Min RTO)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
