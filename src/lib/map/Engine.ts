import { MapFileLayer } from './Layer';
import Map_ from './Map';
import Camera from './Camera';
import clipTo from '../clip';
import CameraEntity from './entities/Camera';
import Prim from 'prim';

export interface MapFileTilesetReference {
  firstgid: number;
  source: string;
}

export interface MapFile {
  /**
   * Width in tiles.
   */
  width: number;

  /**
   * Height in tiles
   */
  height: number;

  tilewidth: number;
  tileheight: number;

  infinite: boolean;

  layers: MapFileLayer[];

  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

  renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up';

  tilesets: MapFileTilesetReference[];

  properties: {
    name: string;
    type: 'float' | 'string' | 'bool' | 'color' | 'file' | 'int';
    value: any;
  }[];
}

export default class Engine {
  map: Map_ | null = null;
  cameras: Map<string, Camera> = new Map();
  camera: Camera | null = null;

  async changeMap(path: string) {
    if (this.map) {
      await this.map.mapDidLeave();
    }

    this.cleanUp();

    this.map = new Map_(path);
    this.cameras.clear();

    const cameras = this.map.findEntities(CameraEntity);

    for (const entity of cameras) {
      const camera = new Camera(this.map);
      camera.x = entity.x;
      camera.y = entity.y;
      camera.frameX = entity.frameX;
      camera.frameY = entity.frameY;
      camera.frameW = entity.frameW;
      camera.frameH = entity.frameH;
      camera.zoom = entity.zoom;
      this.cameras.set(entity.name, camera);
      if (entity.name === 'defaultCamera') {
        this.camera = camera;
      }
    }

    await this.map.mapDidEnter();
  }

  getCamera(name: string) {
    return this.cameras.get(name);
  }

  cleanUp() {}

  draw(surface: Surface, camera?: Camera) {
    if (!camera) {
      camera = this.camera || undefined;
    }

    if (!this.map || !camera) {
      return;
    }

    clipTo(
      surface,
      camera.frameX,
      camera.frameY,
      camera.frameW,
      camera.frameH,
      () => {
        let c1 = new Color(0.129, 0, 0.278);
        let c2 = new Color(0.027, 0, 0.278);

        Prim.drawSolidRectangle(
          surface,
          camera!.frameX,
          camera!.frameY,
          camera!.frameW,
          camera!.frameH,
          c1,
          c1,
          c2,
          c2
        );
        this.map!.draw(surface, camera!);
      }
    );
  }

  update() {
    if (this.map) {
      this.map.update();
    }
  }
}
