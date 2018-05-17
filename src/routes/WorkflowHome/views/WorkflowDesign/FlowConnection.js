import React, { Component, PropTypes } from 'react';

class FlowConnection extends Component {
  static propTypes = {
    jspInstance: PropTypes.object,
    from: PropTypes.string,
    to: PropTypes.string
  };
  connection = null;
  componentDidMount() {
    const { jspInstance, from, to } = this.props;
    this.connection = jspInstance.connect({
      source: `${from}`,
      target: `${to}`,
      anchor: ['Right', 'Left'],
      // detachable: false
    });
    this.connection.bind('click', (conn, originEvent) => {
      if (conn.id === 'branchCustomLabel') return;

      const jsp = this.props.jspInstance;
      jsp.select().each(conn => {
        const connector = conn.getConnector();
        connector.canvas.classList.remove('connector-active');

        const overlays = conn.getOverlays();
        const branchLabel = overlays.branchCustomLabel;
        if (branchLabel) {
          branchLabel.canvas.classList.remove('branch-label-active');
        }
      });

      const connector = conn.getConnector();
      connector.canvas.classList.add('connector-active');

      const overlays = conn.getOverlays();
      const branchLabel = overlays.branchCustomLabel;
      if (branchLabel) {
        branchLabel.canvas.classList.add('branch-label-active');
      }

      originEvent.stopPropagation();
      // debugger;
    })
  }
  componentWillUnmount() {
    const { jspInstance, from, to } = this.props;
    // jspInstance.detach({
    //   source: `${from}`,
    //   target: `${to}`,
    //   anchor: ['Right', 'Left']
    // });
    const conn = jspInstance.getConnections({ scope: '*', source: from, target: to })[0];
    if (conn) {
      jspInstance.detach(conn);
    }
  }
  render() {
    return null;
  }
}

export default FlowConnection;
