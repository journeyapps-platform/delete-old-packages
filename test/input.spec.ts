import { Range } from 'semver';
import { getActionInput, validateInput } from '../src/input';
import { Input, PackageType } from '../src/types';

describe('getActionInput', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = env;
  });

  test('get input from env (versionPattern)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_VERSION-PATTERN': '\\d+\\.\\d+\\.\\d+-RC\\d+',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'true',
      INPUT_TYPE: 'npm'
    };

    const result = getActionInput();
    const expected: Input = {
      packagePattern: /test|test2/,
      versionPattern: /\d+\.\d+\.\d+-RC\d+/,
      keep: 2,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(result).toEqual(expected);
  });

  test('get input from env (semverPattern)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_SEMVER-PATTERN': '^1.0.0',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'true',
      INPUT_TYPE: 'npm'
    };

    const result = getActionInput();
    const expected: Input = {
      packagePattern: /test|test2/,
      semverPattern: new Range('^1.0.0'),
      keep: 2,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(result).toEqual(expected);
  });

  test('get input from env (type)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      INPUT_TYPE: 'npm',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'true'
    };

    const result = getActionInput();
    const expected: Input = {
      packagePattern: /test|test2/,
      keep: 2,
      type: PackageType.Npm,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true
    };

    expect(result).toEqual(expected);
  });

  test('get input from env (invalid regex)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      INPUT_TYPE: 'npm',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_VERSION-PATTERN': '[',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'true'
    };

    expect(() => {
      getActionInput();
    }).toThrow(/.*must be a valid regex.*/);
  });

  test('get input from env (invalid semverPattern)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      INPUT_TYPE: 'npm',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_SEMVER-PATTERN': 'invalid',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'true'
    };

    expect(() => {
      getActionInput();
    }).toThrow(/.*must be a valid semver pattern.*/);
  });

  test('get input from env (invalid type)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      INPUT_TYPE: 'invalid',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'false'
    };

    expect(() => {
      getActionInput();
    }).toThrow(/.*must be one of the supported types.*/);
  });

  test('get input from env (missing type)', () => {
    process.env = {
      ...env,
      GITHUB_REPOSITORY: 'SmartsquareGmbH/delete-old-packages',
      INPUT_TOKEN: 'token',
      INPUT_USER: 'user',
      'INPUT_PACKAGE-PATTERN': 'test|test2',
      'INPUT_DRY-RUN': 'true',
      'INPUT_RATE-LIMIT': 'false'
    };

    expect(() => {
      getActionInput();
    }).toThrow(/.*is required and must be one of the supported types:*/);
  });
});

describe('validateInput', () => {
  test('valid input', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: 2,
      type: PackageType.Maven,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: false
    };

    expect(() => {
      validateInput(input);
    }).not.toThrow();
  });

  test('missing names', () => {
    const input: Input = {
      keep: 2,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('both versionPattern and semverPattern', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      versionPattern: /.*/,
      semverPattern: new Range('1.0.0'),
      keep: 2,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('both user and organization', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: 2,
      type: PackageType.Npm,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: 'org',
      rateLimit: true
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('keep not an integer', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: 1.5,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('keep too small', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: -1,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('keep too large', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: 101,
      token: 'token',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });

  test('token empty', () => {
    const input: Input = {
      packagePattern: /test|test2/,
      keep: 2,
      token: '',
      dryRun: true,
      user: 'user',
      organization: '',
      rateLimit: true,
      type: PackageType.Npm
    };

    expect(() => {
      validateInput(input);
    }).toThrow();
  });
});
