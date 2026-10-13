/**
 * Regression Test Suite: Multi-Cloud Blueprint Data Integrity & Storage Compatibility
 * Verifies that hydration and writeback preserve explicit VM counts, zero values,
 * unknown legacy fields, and handle malformed inputs safely.
 */

// Global localStorage mock for Node environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).localStorage = mockStorage;

import {
  hydrateFromLegacyStorage,
  writebackLegacyStorage,
  DynamicTopologyModel
} from '../src/types/multiCloudBlueprint';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  [PASS] ${name}`);
  } else {
    results.push({ name, passed: false, message: detail });
    console.error(`  [FAIL] ${name}: ${detail}`);
  }
}

console.log('\n======================================================');
console.log(' RUNNING DATA INTEGRITY REGRESSION TESTS (PHASE 1)');
console.log('======================================================\n');

// ------------------------------------------------------------------
// Test 1: RVTools Non-Standard VM Count Preservation
// ------------------------------------------------------------------
console.log('Test 1: Preserving Non-Standard RVTools VM Count');
mockStorage.clear();

const rvToolsPayload = JSON.stringify({
  customerName: 'Acme Financial',
  targetCloud: 'Azure VMware Solution',
  totalVMs: 500, // Non-standard: 500 VMs with 800 vCPUs (ratio 1.6:1, NOT 2.5:1)
  totalVCPUs: 800,
  totalRAMGB: 4096,
  totalStorageTB: 320,
  decoupledStorageTB: 150
});

mockStorage.setItem('zaboraa_4k_blueprint_state', rvToolsPayload);

const hydrated1 = hydrateFromLegacyStorage(rvToolsPayload, null, null);
assert(
  hydrated1.model.environments[0].vmCount === 500,
  'Hydration captures exact VM count (500 VMs)',
  `Expected 500, received ${hydrated1.model.environments[0].vmCount}`
);

// Trigger writeback
writebackLegacyStorage(hydrated1.model);

const writtenBlueprint1 = JSON.parse(mockStorage.getItem('zaboraa_4k_blueprint_state') || '{}');
assert(
  writtenBlueprint1.totalVMs === 500,
  'Writeback preserves exact VM count in zaboraa_4k_blueprint_state (500 VMs)',
  `Expected 500, received ${writtenBlueprint1.totalVMs}`
);

const writtenDr1 = JSON.parse(mockStorage.getItem('zaboraa_dr_export') || '{}');
assert(
  writtenDr1.vms === 500,
  'Writeback preserves exact VM count in zaboraa_dr_export (500 VMs)',
  `Expected 500, received ${writtenDr1.vms}`
);

const writtenSizing1 = JSON.parse(mockStorage.getItem('zaboraa_sizing_export') || '{}');
assert(
  writtenSizing1.vms === 500,
  'Writeback preserves exact VM count in zaboraa_sizing_export (500 VMs)',
  `Expected 500, received ${writtenSizing1.vms}`
);

// ------------------------------------------------------------------
// Test 2: Valid Zero Values Preservation
// ------------------------------------------------------------------
console.log('\nTest 2: Valid Zero Values Preservation');
mockStorage.clear();

const zeroValBlueprint = JSON.stringify({
  customerName: 'Zero Storage Corp',
  totalVMs: 100,
  totalVCPUs: 250,
  totalRAMGB: 1024,
  totalStorageTB: 50,
  decoupledStorageTB: 0 // Explicit 0: No external detached storage configured
});

const zeroValDr = JSON.stringify({
  vms: 100,
  storageTB: 50,
  rpoMin: 0, // Synchronous zero-data-loss replication (RPO = 0 minutes)
  rtoMin: 0
});

mockStorage.setItem('zaboraa_4k_blueprint_state', zeroValBlueprint);
mockStorage.setItem('zaboraa_dr_export', zeroValDr);

const hydrated2 = hydrateFromLegacyStorage(zeroValBlueprint, zeroValDr, null);
assert(
  hydrated2.model.environments[1].storageTB === 0,
  'Hydration preserves decoupledStorageTB = 0 in target environment',
  `Expected 0, received ${hydrated2.model.environments[1].storageTB}`
);
assert(
  hydrated2.model.resilience.targetRpoMinutes === 0,
  'Hydration preserves targetRpoMinutes = 0 (Synchronous SLA)',
  `Expected 0, received ${hydrated2.model.resilience.targetRpoMinutes}`
);

writebackLegacyStorage(hydrated2.model);

const writtenBlueprint2 = JSON.parse(mockStorage.getItem('zaboraa_4k_blueprint_state') || '{}');
assert(
  writtenBlueprint2.decoupledStorageTB === 0,
  'Writeback preserves decoupledStorageTB = 0 without replacing with 120 fallback',
  `Expected 0, received ${writtenBlueprint2.decoupledStorageTB}`
);

const writtenDr2 = JSON.parse(mockStorage.getItem('zaboraa_dr_export') || '{}');
assert(
  writtenDr2.rpoMin === 0,
  'Writeback preserves rpoMin = 0 without replacing with 15 fallback',
  `Expected 0, received ${writtenDr2.rpoMin}`
);

// ------------------------------------------------------------------
// Test 3: Retain Unknown & Custom Legacy Storage Properties
// ------------------------------------------------------------------
console.log('\nTest 3: Non-Destructive Storage Merge & Unknown Field Retention');
mockStorage.clear();

const customBlueprintState = JSON.stringify({
  customerName: 'Custom Fields Enterprise',
  totalVMs: 200,
  totalVCPUs: 500,
  totalRAMGB: 2048,
  totalStorageTB: 100,
  // Custom & legacy specific properties:
  vlans: [
    { vlanId: 101, portGroup: 'Production-DB', vmCount: 40, totalProvisionedGiB: 8000 },
    { vlanId: 102, portGroup: 'Production-Web', vmCount: 160, totalProvisionedGiB: 12000 }
  ],
  customCorporateId: 'CORP-9921',
  auditClassification: 'FedRAMP-High',
  limitingDriver: 'Memory Bound (RAM)',
  hcxNePairs: 3
});

mockStorage.setItem('zaboraa_4k_blueprint_state', customBlueprintState);

const hydrated3 = hydrateFromLegacyStorage(customBlueprintState, null, null);
writebackLegacyStorage(hydrated3.model);

const writtenBlueprint3 = JSON.parse(mockStorage.getItem('zaboraa_4k_blueprint_state') || '{}');
assert(
  Array.isArray(writtenBlueprint3.vlans) && writtenBlueprint3.vlans.length === 2,
  'Unknown field "vlans" array preserved after writeback',
  `Expected 2 items, received ${writtenBlueprint3.vlans?.length}`
);
assert(
  writtenBlueprint3.customCorporateId === 'CORP-9921',
  'Custom field "customCorporateId" preserved after writeback',
  `Expected "CORP-9921", received "${writtenBlueprint3.customCorporateId}"`
);
assert(
  writtenBlueprint3.auditClassification === 'FedRAMP-High',
  'Custom field "auditClassification" preserved after writeback',
  `Expected "FedRAMP-High", received "${writtenBlueprint3.auditClassification}"`
);
assert(
  writtenBlueprint3.limitingDriver === 'Memory Bound (RAM)',
  'Legacy field "limitingDriver" preserved after writeback',
  `Expected "Memory Bound (RAM)", received "${writtenBlueprint3.limitingDriver}"`
);

// ------------------------------------------------------------------
// Test 4: Malformed and Partial JSON Safe Handling
// ------------------------------------------------------------------
console.log('\nTest 4: Graceful Handling of Malformed or Partial JSON');
mockStorage.clear();

let threwException = false;
try {
  const result = hydrateFromLegacyStorage('{malformed-json: true}', '{"partial": ', null);
  assert(
    result.model.environments.length > 0,
    'Gracefully falls back to default environments when encountering malformed JSON',
    `Expected environments > 0, received ${result.model.environments.length}`
  );
} catch (e) {
  threwException = true;
}
assert(!threwException, 'Hydration does not throw uncaught exceptions on corrupt storage items');

// ------------------------------------------------------------------
// Test 5: Multi-Source Precedence Order (RVTools > Sizing > DR)
// ------------------------------------------------------------------
console.log('\nTest 5: Multi-Source Conflict Resolution Precedence');
mockStorage.clear();

const rvState = JSON.stringify({ totalVMs: 450, totalStorageTB: 200 });
const sizingState = JSON.stringify({ vms: 380, storageTB: 180, nodes: 8 });
const drState = JSON.stringify({ vms: 300, storageTB: 150 });

const hydrated5 = hydrateFromLegacyStorage(rvState, drState, sizingState);
assert(
  hydrated5.model.environments[0].vmCount === 450,
  'Prioritizes RVTools (450 VMs) over Sizing (380 VMs) and DR (300 VMs)',
  `Expected 450, received ${hydrated5.model.environments[0].vmCount}`
);
assert(
  hydrated5.model.environments[1].hostCount === 8,
  'Prioritizes Sizing node count (8 nodes) for target environment',
  `Expected 8, received ${hydrated5.model.environments[1].hostCount}`
);

// ------------------------------------------------------------------
// Test 6: Load-Save-Load Idempotence
// ------------------------------------------------------------------
console.log('\nTest 6: Repeated Load-Save-Load Idempotence');
mockStorage.clear();

const initialPayload = JSON.stringify({
  customerName: 'Idempotency Validation Inc',
  totalVMs: 640,
  totalVCPUs: 1280,
  totalRAMGB: 5120,
  totalStorageTB: 400,
  decoupledStorageTB: 80,
  customTag: 'V1.0'
});

mockStorage.setItem('zaboraa_4k_blueprint_state', initialPayload);

// Cycle 1: Load and Save
const cycle1 = hydrateFromLegacyStorage(mockStorage.getItem('zaboraa_4k_blueprint_state'), null, null);
writebackLegacyStorage(cycle1.model);
const snapshot1 = JSON.parse(mockStorage.getItem('zaboraa_4k_blueprint_state') || '{}');

// Cycle 2: Load and Save
const cycle2 = hydrateFromLegacyStorage(mockStorage.getItem('zaboraa_4k_blueprint_state'), null, null);
writebackLegacyStorage(cycle2.model);
const snapshot2 = JSON.parse(mockStorage.getItem('zaboraa_4k_blueprint_state') || '{}');

assert(
  snapshot1.totalVMs === snapshot2.totalVMs && snapshot2.totalVMs === 640,
  'VM count remains 640 across repeated round-trip cycles',
  `Expected 640, received ${snapshot2.totalVMs}`
);
assert(
  snapshot1.customTag === snapshot2.customTag && snapshot2.customTag === 'V1.0',
  'Custom attributes survive across repeated round-trip cycles',
  `Expected "V1.0", received "${snapshot2.customTag}"`
);

// ------------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------------
console.log('\n======================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
console.log(` RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
console.log('======================================================\n');

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  console.log('ALL PHASE 1 DATA INTEGRITY REGRESSION TESTS PASSED CLEANLY.\n');
}
