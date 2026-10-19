import test from 'node:test';
import assert from 'node:assert/strict';

// Test pure logic calculations
test('progress difference calculation and lag detection', () => {
  const planned = 36.85;
  const actual = 37.12;
  const diff = Number((actual - planned).toFixed(2));
  assert.equal(diff, 0.27);
  assert.equal(diff >= 0, true);

  const laggingPlanned = 40.0;
  const laggingActual = 38.5;
  const laggingDiff = Number((laggingActual - laggingPlanned).toFixed(2));
  assert.equal(laggingDiff, -1.5);
  assert.equal(laggingDiff < 0, true);
});

test('work item progress percentage calculation', () => {
  const contractQty = 480;
  const accumulatedQty = 410;
  const progressPercent = Math.min(100, Math.round((accumulatedQty / contractQty) * 100));
  assert.equal(progressPercent, 85);
});

test('worker crafts total daily man-days summation', () => {
  const crafts = [
    { todayCount: 16 },
    { todayCount: 18 },
    { todayCount: 8 },
    { todayCount: 8 },
    { todayCount: 7 },
  ];
  const total = crafts.reduce((acc, c) => acc + c.todayCount, 0);
  assert.equal(total, 57);
});

test('material sampling test pass rate calculation', () => {
  const records = [
    { result: '合格' },
    { result: '合格' },
    { result: '合格' },
    { result: '不合格' },
  ];
  const total = records.length;
  const passed = records.filter(r => r.result === '合格').length;
  const passRate = Math.round((passed / total) * 100);
  assert.equal(passRate, 75);
});

test('worker craft reordering preserves counts and updates order indices', () => {
  const crafts = [
    { id: '1', order: 1, name: 'A' },
    { id: '2', order: 2, name: 'B' },
    { id: '3', order: 3, name: 'C' },
  ];
  // move index 2 (C) to index 0
  const updated = [...crafts];
  const [moved] = updated.splice(2, 1);
  updated.splice(0, 0, moved);
  const reordered = updated.map((c, idx) => ({ ...c, order: idx + 1 }));

  assert.equal(reordered[0].name, 'C');
  assert.equal(reordered[0].order, 1);
  assert.equal(reordered[1].name, 'A');
  assert.equal(reordered[1].order, 2);
  assert.equal(reordered[2].name, 'B');
  assert.equal(reordered[2].order, 3);
});
