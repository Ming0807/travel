import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getEntryCohortFilterSupport } from '../../lib/dashboard/entry-cohort-filter-support.ts';

test('allows date, location and evidence scope without changing filters', () => {
  const filters = Object.freeze({ dateFrom: '2026-09-01', dateTo: '2026-09-10', attractionId: 4, evidenceScope: 'field_claim' });
  assert.deepEqual(getEntryCohortFilterSupport(filters), { supported: true, unsupportedFilters: [] });
});
test('blocks each post-entry attribute, including satisfaction bounds', () => {
  for (const key of ['originCountryId','originProvinceId','ageGroup','transportModeId','travelPurposeId','satisfactionMin','satisfactionMax']) {
    assert.deepEqual(getEntryCohortFilterSupport({ [key]: key === 'ageGroup' ? '18-24' : 1 }), {
      supported: false, unsupportedFilters: [key],
    });
  }
});
test('returns stable field names only, never respondent values', () => {
  assert.deepEqual(getEntryCohortFilterSupport({ satisfactionMax: 5, ageGroup: '18-24', originCountryId: 99 }), {
    supported: false, unsupportedFilters: ['originCountryId','ageGroup','satisfactionMax'],
  });
  assert.deepEqual(getEntryCohortFilterSupport({ ageGroup: undefined }), { supported: true, unsupportedFilters: [] });
});
