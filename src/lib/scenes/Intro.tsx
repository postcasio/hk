import Scene from '../Scene';
import Cutscene from '../Cutscene';
import Kinetic from 'kinetic';
import Title from './Title';

export default class Intro extends Scene {
  handleCutsceneComplete = () => {
    this.director.setScene(Title);
  };

  render() {
    SSj.log('Rendering cutscene');
    return (
      <Cutscene
        script={import('../cutscenes/intro')}
        onComplete={this.handleCutsceneComplete}
      />
    );
  }
}
