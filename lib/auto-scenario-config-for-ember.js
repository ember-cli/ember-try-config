'use strict';
let semver = require('semver');
let getEmberVersions = require('./get-ember-versions');
let findSatisfyingVersions = require('./find-satisfying-versions');
let getChannelURL = require('ember-source-channel-url');
const firstEmberSourceVersion = '2.11.0';

module.exports = async function generateConfig(options) {
  let versionPromises;

  if (options.onlyVersionCompatibility) {
    versionPromises = [
      //resolves requested versions
      generateScenariosFromSemver(options.versionCompatibility, options.availableVersions),
    ];
  } else {
    versionPromises = [
      //always resolves beta, canary, release
      generateBaseScenarios(options.getChannelURL),
      //resolves requested versions
      generateScenariosFromSemver(options.versionCompatibility, options.availableVersions),
    ];
  }

  let versions = await Promise.all(versionPromises);

  return {
    scenarios: versions.reduce((acc, v) => [...acc, ...v], []),
  };
};

async function generateScenariosFromSemver(semverStatements, availableVersions) {
  let statement = semverStatements.ember;

  let possibleVersions = availableVersions ? availableVersions : await getEmberVersions();
  let versions = findSatisfyingVersions(possibleVersions, statement);

  return versions
    .map((version) => {
      let versionNum = semver.clean(version);

      if (semver.gte(versionNum, firstEmberSourceVersion)) {
        return {
          name: `ember-${versionNum}`,
          npm: {
            devDependencies: {
              'ember-source': versionNum,
            },
          },
        };
      } else {
        return null;
      }
    })
    .filter(Boolean);
}

async function generateBaseScenarios(_getChannelURL = getChannelURL) {
  let [release, beta, canary] = await Promise.all([
    _getChannelURL('release'),
    _getChannelURL('beta'),
    _getChannelURL('canary'),
  ]);

  return [
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
          'ember-source': beta,
        },
      },
    },
    {
      name: 'ember-canary',
      allowedToFail: true,
      npm: {
        devDependencies: {
          'ember-source': canary,
        },
      },
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-source': release,
        },
      },
    },
  ];
}
