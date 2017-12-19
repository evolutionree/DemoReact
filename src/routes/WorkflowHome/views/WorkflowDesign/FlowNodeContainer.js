import React, { PropTypes, Component } from 'react';
import styles from './styles.less';

class FlowNodeContainer extends Component {
  static propTypes = {
    jspInstance: PropTypes.object,
    id: PropTypes.string.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    children: PropTypes.node
  };
  componentDidMount() {
    this.props.jspInstance.draggable(this.props.id);
  }
  render() {
    const { id, x, y, children } = this.props;
    return (
      <div
        id={id}
        className={styles.flownode}
        style={{ left: x + 'px', top: y + 'px' }}
      >
        {children}
      </div>
    );
  }
}

export default FlowNodeContainer;
