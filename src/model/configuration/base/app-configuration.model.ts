import { IArguments } from '../interface';

export class AppConfiguration {
  debug: boolean;

  constructor({ d: debug }: IArguments) {
    this.debug = debug;
  }
}
