'use strict';

let autoScenarioConfigForEmber = require('../lib/auto-scenario-config-for-ember');

let fakeGetChannelUrl = function (channel) {
  return Promise.resolve(`https://emberjs.example.com/${channel}-1234.tgz`);
};

describe('lib/auto-scenario-config-for-ember', () => {
  test('includes default scenarios and works with straight version #', () => {
    jest.setTimeout(10000);

    return autoScenarioConfigForEmber({
      versionCompatibility: { ember: '2.18.0' },
      getChannelURL: fakeGetChannelUrl,
    }).then((config) => {
      expect(config.scenarios).toEqual([
        {
          name: 'default',
          npm: {
            devDependencies: {},
          },
        },
        {
          name: 'ember-beta',
          allowedToFail: true,
          npm: {
            devDependencies: {
              'ember-source': 'https://emberjs.example.com/beta-1234.tgz',
            },
            overrides: {
              'ember-source': '$ember-source',
            },
          },
        },
        {
          name: 'ember-canary',
          allowedToFail: true,
          npm: {
            devDependencies: {
              'ember-source': 'https://emberjs.example.com/canary-1234.tgz',
            },
            overrides: {
              'ember-source': '$ember-source',
            },
          },
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': 'https://emberjs.example.com/release-1234.tgz',
            },
            overrides: {
              'ember-source': '$ember-source',
            },
          },
        },
        {
          name: 'ember-2.18.0',
          npm: {
            devDependencies: {
              'ember-source': '2.18.0',
            },
            overrides: {
              'ember-source': '$ember-source',
            },
          },
        },
      ]);
    });
  });

  test('works with complex semver statement', () => {
    let availableVersions = [
      '2.11.0',
      '2.12.0',
      '2.12.2',
      '2.13.0',
      '2.18.0',
      '3.0.0',
      '3.1.0',
      '3.1.1',
    ];

    return autoScenarioConfigForEmber({
      versionCompatibility: { ember: '2.11.0 - 2.12.7 || ~ 3.1.0 || ^2.18.0' },
      availableVersions,
      getChannelURL: fakeGetChannelUrl,
    }).then((config) => {
      expect(config.scenarios).toMatchSnapshot();
    });
  });
});
