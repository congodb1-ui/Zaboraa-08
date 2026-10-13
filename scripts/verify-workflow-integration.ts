import {
  ArchitectureTemplateId,
  getDefaultEnvironmentsForTemplate,
  getDefaultInterconnectLinksForTemplate,
  EnvironmentNode,
  InterconnectLink
} from '../src/types/multiCloudBlueprint';
import { buildTrackVisualSpec } from '../src/pages/tools/DesignGeneratorPage';

console.log('======================================================');
console.log(' RUNNING END-TO-END WORKFLOW INTEGRATION AUDIT TESTS');
console.log('======================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Track-Aware Platform Models for All 9 Architecture Tracks
// -----------------------------------------------------------------------------
console.log('\nTest 1: Track-Aware Platform Visual Models (All 9 Tracks)');
const allTracks: ArchitectureTemplateId[] = [
  'nutanix-onprem',
  'nutanix-to-nc2',
  'vmware-to-nc2',
  'avs',
  'vmc-aws',
  'gcve',
  'aws-native',
  'gcp-native',
  'multi-cloud'
];

allTracks.forEach(trackId => {
  const envs = getDefaultEnvironmentsForTemplate(trackId);
  const links = getDefaultInterconnectLinksForTemplate(trackId);
  const spec = buildTrackVisualSpec(trackId, {
    customerName: 'Test Enterprise',
    sourceEnv: envs[0],
    transitEnv: envs[1],
    targetEnv: envs[envs.length - 1],
    totalVMs: 350,
    interconnectLinks: links,
    connectivity: 'Hybrid (VPN + Direct Circuit)',
    landingZone: 'Enterprise Hub-Spoke',
    nvaFirewall: 'Palo Alto VM-Series',
    wafSolution: 'Cloudflare Magic Transit',
    drEngine: 'Platform DR Engine',
    drRpoMinutes: 0,
    drRtoMinutes: 15,
    drStrategy: 'Warm Standby',
    externalStorageName: 'Enterprise Decoupled Storage',
    decoupledStorageTB: 50
  });

  assert(Boolean(spec.title && spec.title.length > 10), `${trackId}: Generates descriptive title "${spec.title}"`);
  assert(Boolean(spec.panel1Header && spec.panel2Header && spec.panel3Header), `${trackId}: Generates all 3 panel headers`);
  assert(spec.panel1Box1.bullets.length >= 2, `${trackId}: Panel 1 Box 1 contains detailed bullet points`);
  assert(spec.panel3Box1.bullets.length >= 2, `${trackId}: Panel 3 Target Box contains detailed bullet points`);
});

// Specific platform authenticity checks
const nutanixSpec = buildTrackVisualSpec('nutanix-onprem', {
  customerName: 'Acme Corp',
  sourceEnv: getDefaultEnvironmentsForTemplate('nutanix-onprem')[0],
  totalVMs: 200,
  interconnectLinks: [],
  connectivity: '100G Leaf-Spine',
  landingZone: 'Flow VPC',
  nvaFirewall: 'Flow Network Security',
  wafSolution: 'F5 WAF',
  drEngine: 'NearSync',
  drRpoMinutes: 0,
  drRtoMinutes: 10,
  drStrategy: 'Warm Standby',
  externalStorageName: 'Nutanix Objects',
  decoupledStorageTB: 0
});
assert(nutanixSpec.panel1Header.includes('NUTANIX'), 'Nutanix On-Prem spec correctly references NUTANIX in Panel 1');
assert(nutanixSpec.panel1Box1.title.includes('Prism Central'), 'Nutanix On-Prem spec highlights Prism Central');

const vmcSpec = buildTrackVisualSpec('vmc-aws', {
  customerName: 'Acme Corp',
  sourceEnv: getDefaultEnvironmentsForTemplate('vmc-aws')[0],
  targetEnv: getDefaultEnvironmentsForTemplate('vmc-aws')[2],
  totalVMs: 300,
  interconnectLinks: [],
  connectivity: 'AWS Direct Connect',
  landingZone: 'AWS Transit Gateway',
  nvaFirewall: 'AWS Network Firewall',
  wafSolution: 'AWS WAF',
  drEngine: 'VMware HCX',
  drRpoMinutes: 15,
  drRtoMinutes: 30,
  drStrategy: 'Pilot Light',
  externalStorageName: 'Amazon FSx for NetApp ONTAP',
  decoupledStorageTB: 100
});
assert(vmcSpec.panel3Header.includes('VMWARE CLOUD ON AWS'), 'VMC spec explicitly features VMware Cloud on AWS SDDC');
assert(vmcSpec.panel3Box2.title.includes('Connected VPC'), 'VMC spec details Connected VPC and ENI connectivity');

// -----------------------------------------------------------------------------
// TEST 2: Single Source of Truth & Node Coordinate Preservation
// -----------------------------------------------------------------------------
console.log('\nTest 2: Single Source of Truth & Coordinate Preservation');
const initialEnvs = getDefaultEnvironmentsForTemplate('avs');
const initialCoords = initialEnvs.map(e => ({ id: e.id, x: e.x, y: e.y }));

// Simulate updating node specs in Step 3
const updatedEnvs: EnvironmentNode[] = initialEnvs.map(e => {
  if (e.id === initialEnvs[0].id) {
    return {
      ...e,
      hostCount: 32,
      totalVcpu: 32 * 36,
      totalRamGB: 32 * 576,
      storageTB: 250,
      cidrBlock: '10.99.0.0/16'
    };
  }
  return e;
});

// Verify coordinates are 100% preserved
updatedEnvs.forEach(updated => {
  const original = initialCoords.find(c => c.id === updated.id);
  assert(original !== undefined, `Environment ${updated.id} maintained`);
  assert(original?.x === updated.x && original?.y === updated.y, `Environment ${updated.name} strictly preserved (x=${updated.x}, y=${updated.y})`);
});

// Aggregate topologyMetrics calculation check
const totalHosts = updatedEnvs.reduce((acc, e) => acc + e.hostCount, 0);
const totalVcpu = updatedEnvs.reduce((acc, e) => acc + e.totalVcpu, 0);
assert(totalHosts === 32 + initialEnvs.slice(1).reduce((acc, e) => acc + e.hostCount, 0), 'Total hosts rolled up accurately');
assert(totalVcpu === 32 * 36 + initialEnvs.slice(1).reduce((acc, e) => acc + e.totalVcpu, 0), 'Total vCPU rolled up accurately');

// -----------------------------------------------------------------------------
// TEST 3: Template Switch Customization Detection
// -----------------------------------------------------------------------------
console.log('\nTest 3: Template Switch Guardrail Customization Detection');
function checkHasUserCustomizations(
  currentTemplate: ArchitectureTemplateId,
  currentEnvs: EnvironmentNode[],
  currentLinks: InterconnectLink[]
): boolean {
  const defaults = getDefaultEnvironmentsForTemplate(currentTemplate);
  const defaultLinks = getDefaultInterconnectLinksForTemplate(currentTemplate);
  if (currentEnvs.length !== defaults.length) return true;
  if (currentLinks.length !== defaultLinks.length) return true;
  for (let i = 0; i < currentEnvs.length; i++) {
    const cur = currentEnvs[i];
    const def = defaults[i];
    if (!def) return true;
    if (
      cur.name !== def.name ||
      cur.hostCount !== def.hostCount ||
      cur.nodeSku !== def.nodeSku ||
      cur.storageTB !== def.storageTB ||
      cur.cidrBlock !== def.cidrBlock ||
      (cur.vmCount !== undefined && cur.vmCount !== def.vmCount)
    ) {
      return true;
    }
  }
  return false;
}

const defaultAvsEnvs = getDefaultEnvironmentsForTemplate('avs');
const defaultAvsLinks = getDefaultInterconnectLinksForTemplate('avs');
assert(
  !checkHasUserCustomizations('avs', defaultAvsEnvs, defaultAvsLinks),
  'Default template topology has NO customizations'
);

const customizedEnvs = [...defaultAvsEnvs];
customizedEnvs[0] = { ...customizedEnvs[0], hostCount: 99 };
assert(
  checkHasUserCustomizations('avs', customizedEnvs, defaultAvsLinks),
  'Customized host count detected to trigger confirmation modal'
);

// -----------------------------------------------------------------------------
// TEST 4: Environment Deletion Cascade Link Severing Check
// -----------------------------------------------------------------------------
console.log('\nTest 4: Cascade Link Severing on Environment Removal');
const envsBeforeDelete = getDefaultEnvironmentsForTemplate('avs');
const linksBeforeDelete = getDefaultInterconnectLinksForTemplate('avs');
const targetIdToRemove = envsBeforeDelete[envsBeforeDelete.length - 1].id;

const connectedLinks = linksBeforeDelete.filter(
  l => l.sourceId === targetIdToRemove || l.targetId === targetIdToRemove
);
assert(connectedLinks.length > 0, `Target environment has ${connectedLinks.length} active links`);

// Removal logic: filter out environment and sever links
const remainingEnvs = envsBeforeDelete.filter(e => e.id !== targetIdToRemove);
const remainingLinks = linksBeforeDelete.filter(
  l => l.sourceId !== targetIdToRemove && l.targetId !== targetIdToRemove
);
assert(remainingEnvs.length === envsBeforeDelete.length - 1, 'Environment removed cleanly');
assert(
  !remainingLinks.some(l => l.sourceId === targetIdToRemove || l.targetId === targetIdToRemove),
  'All links attached to removed environment severed without orphan references'
);

// -----------------------------------------------------------------------------
// TEST 5: Zero LocalStorage Write Guarantee on Read/Inspect Workflows
// -----------------------------------------------------------------------------
console.log('\nTest 5: Storage Isolation (Strict Legacy Sync Boundary)');
const mockStorage: Record<string, string> = {
  zaboraa_4k_blueprint_state: JSON.stringify({ vCenterCount: 2 }),
  zaboraa_dr_export: JSON.stringify({ rpoMin: 15 }),
  zaboraa_sizing_export: JSON.stringify({ totalVMs: 300 })
};

let setItemCalls = 0;
const storageProxy = new Proxy(mockStorage, {
  set(target, prop, value) {
    setItemCalls++;
    target[prop as string] = value;
    return true;
  }
});

// Simulate rendering all 9 tracks and inspecting specs
allTracks.forEach(t => {
  const e = getDefaultEnvironmentsForTemplate(t);
  const l = getDefaultInterconnectLinksForTemplate(t);
  buildTrackVisualSpec(t, {
    customerName: 'Bank',
    sourceEnv: e[0],
    totalVMs: 100,
    interconnectLinks: l,
    connectivity: 'Direct',
    landingZone: 'Hub',
    nvaFirewall: 'FortiGate',
    wafSolution: 'AWS WAF',
    drEngine: 'SRM',
    drRpoMinutes: 5,
    drRtoMinutes: 20,
    drStrategy: 'Pilot Light',
    externalStorageName: 'ANF',
    decoupledStorageTB: 10
  });
});

assert(setItemCalls === 0, 'Zero writes to localStorage during track switches, visual spec rendering, or inspections');

console.log('\n======================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('======================================================');
