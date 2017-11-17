import React, { PropTypes, Component } from 'react';
import styles from './styles.less';

class FlowContainer extends Component {
  // shouldComponentUpdate() {
  //   return false;
  // }
  render() {
    return (
      <div
        className={styles.flowcontainer}
        id={`jsp-container-${this.props.scope}`}
        ref={this.props.onDomReady}
      >
        {this.props.children}
      </div>
    );
  }
}

export default FlowContainer;
