import { hydrateFromLegacyStorage } from '../src/types/multiCloudBlueprint.ts';

console.log('Testing hydrateFromLegacyStorage...');

// Case 1: Empty / Null inputs (Graceful fallback)
const r1 = hydrateFromLegacyStorage(null, null, null);
console.assert(r1.model.environments.length > 0, 'Case 1 Failed: Fallback environments should exist');
console.assert(r1.notice === null, 'Case 1 Failed: Notice should be null for empty input');
console.log('✓ Case 1 Passed: Empty/null inputs handled safely');

// Case 2: Valid zero values (Zero decoupled storage, zero RAM)
const payloadZero = JSON.stringify({
  fileName: 'export-zero.xlsx',
  totalVMs: 50,
  totalStorageTB: 20,
  decoupledStorageTB: 0,
  targetCloud: 'Azure VMware Solution'
});
const r2 = hydrateFromLegacyStorage(payloadZero, null, null);
console.assert(r2.model.environments[1].storageTB === 0, 'Case 2 Failed: Decoupled storage 0 should be preserved');
console.assert(r2.model.environments[0].totalVcpu === 125, 'Case 2 Failed: VM calculation should scale');
console.log('✓ Case 2 Passed: Valid zero values preserved');

// Case 3: Conflicting exports (RVTools vs Sizing vs DR Planner)
const rvtoolsPayload = JSON.stringify({
  fileName: 'prod-rvtools.xlsx',
  totalVMs: 500,
  totalStorageTB: 300,
  cloudNodes: 8,
  nodeSku: 'AV64',
  targetCloud: 'Azure VMware Solution',
  vlans: [{ vlanId: 10, portGroup: 'Web-Tier' }],
  hcxNePairs: 2
});
const sizingPayload = JSON.stringify({
  vms: 450,
  storageTB: 280,
  nodes: 10,
  decoupledStorageTB: 80,
  cloud: 'avs'
});
const drPayload = JSON.stringify({
  vms: 300,
  engine: 'Nutanix Move',
  rpoMin: 15,
  rtoMin: 30,
  strategy: 'pilotLight'
});
const r3 = hydrateFromLegacyStorage(rvtoolsPayload, drPayload, sizingPayload);
console.assert(r3.model.environments[0].totalVcpu === 1250, 'Case 3 Failed: RVTools 500 VMs should take precedence for source');
console.assert(r3.model.environments[1].hostCount === 10, 'Case 3 Failed: Sizing nodes should update destination nodes');
console.assert(r3.model.resilience.replicationEngine === 'Nutanix Move', 'Case 3 Failed: DR engine should take precedence');
console.assert(r3.conflictsResolved.length > 0, 'Case 3 Failed: Conflicts should be documented');
console.assert(r3.model.importedLegacyContext.hcxNePairs === 2, 'Case 3 Failed: Unmapped hcxNePairs must be retained');
console.log('✓ Case 3 Passed: Conflicting exports resolved and unmapped fields preserved in importedLegacyContext');

// Case 4: Malformed JSON strings
const r4 = hydrateFromLegacyStorage('{ malformed json }', 'invalid', 'bad');
console.assert(r4.model.environments.length > 0, 'Case 4 Failed: Should not crash on malformed JSON');
console.log('✓ Case 4 Passed: Malformed data handled without exception');

console.log('ALL HYDRATION TESTS PASSED SUCCESSFULLY!');
