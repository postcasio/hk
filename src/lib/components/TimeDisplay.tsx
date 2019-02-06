import Kinetic, {
  Component,
  PositionProps,
  SizeProps,
  Fragment,
  Rectangle,
  Text
} from 'kinetic';

export interface TimeDisplayProps extends PositionProps, SizeProps {}

export default class TimeDisplay extends Component<TimeDisplayProps> {
  render() {
    return (
      <Fragment>
        {' '}
        <Rectangle
          at={this.props.at!.inherit()}
          size={this.props.size!.inherit()}
          fillColor={new Color(0.5, 0.6, 0.6)}
          borderColor={new Color(0.9, 0.9, 0.9)}
          borderWidth={1}
        />
        <Text
          content="12:05:54"
          at={this.props.at!.inherit()}
          size={this.props.size!.inherit()}
        />
      </Fragment>
    );
  }
}
