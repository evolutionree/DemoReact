import React, { Component, PropTypes } from 'react';

class FlowConnection extends Component {
  static propTypes = {
    jspInstance: PropTypes.object,
    from: PropTypes.string,
    to: PropTypes.string
  };
  componentDidMount() {
    const { jspInstance, from, to } = this.props;
    jspInstance.connect({
      source: `${from}`,
      target: `${to}`,
      anchor: ['Right', 'Left']
    });
  }
  componentWillUnmount() {
    const { jspInstance, from, to } = this.props;
    jspInstance.detach({
      source: `${from}`,
      target: `${to}`,
      anchor: ['Right', 'Left']
    });
  }
  render() {
    return null;
  }
}

export default FlowConnection;
