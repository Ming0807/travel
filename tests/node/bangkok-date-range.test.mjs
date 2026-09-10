import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bangkokDateRangeBounds } from '../../lib/utils/bangkok-datetime.ts';

test('uses local midnight and an exclusive next-day bound', () => {
  assert.deepEqual(bangkokDateRangeBounds('2026-09-01', '2026-09-10'), {
    fromInclusive: '2026-09-01T00:00:00+07:00',
    toExclusive: '2026-09-11T00:00:00+07:00',
  });
});
test('rolls across leap days, months and years', () => {
  for (const [last, next] of [['2024-02-28','2024-02-29'],['2024-02-29','2024-03-01'],['2026-12-31','2027-01-01']]) {
    assert.equal(bangkokDateRangeBounds(last,last).toExclusive, `${next}T00:00:00+07:00`);
  }
});
test('rejects invalid or reversed dates rather than normalizing silently', () => {
  for (const range of [['2026-02-30','2026-03-01'],['2026-09-11','2026-09-10'],['bad','2026-09-10']]) {
    assert.throws(() => bangkokDateRangeBounds(...range));
  }
});
