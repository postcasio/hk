import MagicCore from './MagicCore';

export default abstract class CoreModule {
  slots: MagicCore[] = [];
  type: CoreModuleType = CoreModuleType.UNLINKED;
}

export enum CoreModuleType {
  LINKED = 'LINKED',
  UNLINKED = 'UNLINKED'
}
