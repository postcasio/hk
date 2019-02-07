import { Dispatcher } from '../CutsceneController';
// import { addUIElement } from '../commands/common';
// import Kinetic, { Image, Point, Size } from 'kinetic';
// import animate from '../Animate';
// import linear from 'eases/linear';

export default async function intro(dispatch: Dispatcher): Promise<any> {
  // const AnimatedImage = animate(Image);
  // const tex = new Texture('res/image/test.png');
  // await dispatch(
  //   addUIElement(
  //     <AnimatedImage
  //       src={tex}
  //       at={Point.zero}
  //       size={Size.of(tex)}
  //       animateProps={{
  //         at: [linear, 60]
  //       }}
  //     />
  //   )
  // );
  await Sphere.sleep(10);
}
