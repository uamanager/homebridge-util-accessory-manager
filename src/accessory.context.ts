import { UnknownContext } from 'homebridge';

export interface IBaseAccessoryContext extends UnknownContext {
  manufacturer: string;
  model: string;
  name: string;
  serialNumber: string;
  version: string;
}
