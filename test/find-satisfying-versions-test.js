'use strict';

let findSatisfyingVersions = require('../lib/find-satisfying-versions');

describe('lib/find-satisfying-versions', () => {
  test('returns versions that satisfy the semver string', () => {
    let versions = findSatisfyingVersions(['1.13.0', '1.11.2', '4.0.0'], '< 4.0.0');
    expect(versions).toEqual(['1.13.0', '1.11.2']);
  });

  test('handles invalid versions', () => {
    let versions = findSatisfyingVersions(['1.13.0', '1.11.2', 'garbage'], '< 4.0.0');
    expect(versions).toEqual(['1.13.0', '1.11.2']);
  });

  test('limits to the latest point release of each satisfying minor version', () => {
    let availableVersions = [
      '1.0.1',
      '1.0.2',
      '1.1.0',
      '1.2.15',
      '1.3.4',
      '1.3.5',
      '1.3.6',
      '1.4.1',
      '1.5.0',
    ];
    let versions = findSatisfyingVersions(
      availableVersions,
      '< 1.2.0 || 1.2.15 || > 1.3.0 < 1.5.0'
    );
    expect(versions).toEqual(['1.0.2', '1.1.0', '1.2.15', '1.3.6', '1.4.1']);
  });
});
