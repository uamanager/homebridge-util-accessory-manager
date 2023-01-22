import {Service, WithUUID} from 'hap-nodejs';
import {API, DynamicPlatformPlugin, Logger, PlatformAccessory} from 'homebridge';
import {IAccessoryContext} from './accessory.context';
import {ConstructorArgs} from 'hap-nodejs/dist/types';

export interface IAccessoryCtor<T> {
  new(
    logger: Logger,
    api: API,
    platform: DynamicPlatformPlugin,
    accessory: PlatformAccessory<IAccessoryContext>
  ): T;
}

export abstract class AccessoryAbstract<AC extends IAccessoryContext> {
  protected constructor(
    protected readonly logger: Logger,
    protected readonly api: API,
    protected readonly platform: DynamicPlatformPlugin,
    protected readonly accessory: PlatformAccessory<AC>,
  ) {
  }

  protected _setAccessoryInformation(
    manufacturer: string,
    model: string,
    serialNumber: string,
    version: string,
  ) {
    this.accessory.getService(this.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, manufacturer)
      .setCharacteristic(this.api.hap.Characteristic.Model, model)
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, version);
  }

  protected _getService<T extends WithUUID<typeof Service>>(
    name: string,
    service: T,
  ): Service {
    return (
      this.accessory.getService(service)
      || this.accessory.addService(service, ...([name] as unknown as ConstructorArgs<T>))
    )
      .setCharacteristic(this.api.hap.Characteristic.Name, name);
  }

  protected _removeService<T extends WithUUID<typeof Service>>(
    service: T,
  ): void {
    const _service = this.accessory.getService(service);
    if (_service) {
      this.accessory.removeService(_service);
    }
  }
}
