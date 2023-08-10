'use strict';
let semver = require('semver');
let getEmberVersions = require('./get-ember-versions');
let findSatisfyingVersions = require('./find-satisfying-versions');
let getChannelURL = require('ember-source-channel-url');
const firstEmberSourceVersion = '2.11.0';

module.exports = async function generateConfig(options) {
  let [base, semver] = await Promise.all([
    generateBaseScenarios(options.getChannelURL),
    generateScenariosFromSemver(
      options.versionCompatibility,
      options.availableVersions,
      options.project
    ),
  ]);

  return {
    scenarios: [...base, ...semver],
  };
};

async function generateScenariosFromSemver(semverStatements, availableVersions, project) {
  let statement = semverStatements.ember;

  let possibleVersions = availableVersions ? availableVersions : await getEmberVersions();
  let versions = findSatisfyingVersions(possibleVersions, statement);

  return versions
    .map((version) => {
      let versionNum = semver.clean(version);

      if (semver.gte(versionNum, firstEmberSourceVersion)) {
        const scenario = {
          name: `ember-${versionNum}`,
          npm: {
            devDependencies: {
              'ember-source': versionNum,
            },
          },
        };

        // If the app has ember-source < 4.0.0 and ember-cli >= 5.0.0, we need to add ember-cli < 5.0.0 as a dependency
        // because ember-cli 5.0.0+ requires ember-source 4.0.0+.
        if (
          semver.lt(versionNum, '4.0.0') &&
          project &&
          project.dependencies &&
          project.dependencies()['ember-cli'] &&
          semver.gte(semver.minVersion(project.dependencies()['ember-cli']), '5.0.0')
        ) {
          scenario.npm.devDependencies['ember-cli'] = '~4.12.0';
        }

        return scenario;
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
