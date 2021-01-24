import * as yargs from 'yargs';
import { singleton } from 'tsyringe';
import { AppConfiguration, DatabaseConfiguration, databaseTypes, IArguments } from '../../model/configuration';

@singleton()
export class ConfigurationService {
  private readonly arguments: IArguments;

  get databaseConfiguration(): DatabaseConfiguration {
    return new DatabaseConfiguration(this.arguments);
  }

  get appConfiguration(): AppConfiguration {
    return new AppConfiguration(this.arguments);
  }

  constructor() {
    this.arguments = yargs
      .options({
        d: { type: 'boolean', description: 'Enable debug logging', default: false, alias: 'debug' },
        ds: { type: 'string', description: 'Database schema to use', default: 'pleagan', alias: 'database-schema' },
        dh: { type: 'string', description: 'Database host to use', default: 'localhost', alias: 'database-host' },
        dp: { type: 'number', description: 'Database port to use', default: 3307, alias: 'database-port' },
        du: { type: 'string', description: 'Database user to use', default: 'pleagan', alias: 'database-user' },
        dpw: {
          type: 'string',
          description: 'Database password to use',
          default: 'pleagan',
          alias: 'database-password',
        },
        dt: {
          type: 'string',
          choices: databaseTypes,
          description: 'Database dialect to use',
          default: 'mysql',
          alias: 'database-type',
        },
      })
      .epilog('enjoy :)')
      .help('h')
      .alias('h', 'help').argv;

    if (this.appConfiguration.debug) {
      process.env.debug = 'true';
    }
  }
}
