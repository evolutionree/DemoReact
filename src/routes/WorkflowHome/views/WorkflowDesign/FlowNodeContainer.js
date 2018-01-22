import React, { PropTypes, Component } from 'react';
import styles from './styles.less';

const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: "#61B7CF",
  joinstyle: "round",
  outlineStroke: "white",
  outlineWidth: 2
};
const connectorHoverStyle = {
  strokeWidth: 3,
  stroke: "#216477",
  outlineWidth: 5,
  outlineStroke: "white"
};
const endpointHoverStyle = {
  fill: "#216477",
  stroke: "#216477"
};
const sourceEndpoint = {
  // cssClass: 'asdf',
  endpoint: "Dot",
  paintStyle: {
    stroke: "#7AB02C",
    // stroke: "transparent",
    fill: "transparent",
    radius: 6,
    strokeWidth: 1
  },
  isSource: true,
  connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
  connectorStyle: connectorPaintStyle,
  // hoverPaintStyle: endpointHoverStyle,
  // connectorHoverStyle: connectorHoverStyle,
  dragOptions: {},
  overlays: [
    ["Label", {
      location: [0.5, 1.5],
      label: "Drag",
      cssClass: "endpointSourceLabel",
      visible: false
    }]
  ]
};
const targetEndpoint = {
  endpoint: "Dot",
  // cssClass: 'asdf',
  paintStyle: {
    // fill: "transparent",
    fill: "#639f4a",
    radius: 6
  },
  // hoverPaintStyle: endpointHoverStyle,
  maxConnections: -1,
  dropOptions: { hoverClass: "hover", activeClass: "active" },
  isTarget: true,
  overlays: [
    ["Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: false }]
  ]
};

class FlowNodeContainer extends Component {
  static propTypes = {
    jspInstance: PropTypes.object,
    id: PropTypes.string.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.node,
    steptypeid: PropTypes.number
  };
  endpoints = [];
  componentDidMount() {
    this.props.jspInstance.draggable(this.props.id);
    this.addEndpoint();
  }
  componentWillUnmount() {
    this.endpoints.forEach(endpointId => {
      this.props.jspInstance.deleteEndpoint(endpointId);
    });
  }
  addEndpoint = () => {
    const jsp = this.props.jspInstance;
    const type = this.props.steptypeid;
    const id = this.props.id;
    const options = {
      anchor: 'TopCenter',
      uuid: id + '-TopCenter'
    };
    const options2 = {
      anchor: 'BottomCenter',
      uuid: id + '-BottomCenter'
    };
    const options3 = {
      anchor: 'LeftMiddle',
      uuid: id + '-LeftMiddle'
    };
    const options4 = {
      cssClass: 'jtk-endpoint--source',
      anchor: 'RightMiddle',
      uuid: id + '-RightMiddle'
    };
    if (type !== -1) {
      // jsp.addEndpoint(id, sourceEndpoint, options);
      // jsp.addEndpoint(id, sourceEndpoint, options2);
      jsp.addEndpoint(id, sourceEndpoint, options4);
      this.endpoints.push(options4.uuid);
    }
    if (type !== 0) {
      jsp.addEndpoint(id, targetEndpoint, options3);
      this.endpoints.push(options3.uuid);
      // jsp.addEndpoint(id, targetEndpoint, options4);
    }
  };
  render() {
    const { id, x, y, children } = this.props;
    return (
      <div
        id={id}
        className={styles.flownode + ' ' + this.props.className}
        style={{ left: x + 'px', top: y + 'px' }}
      >
        {children}
      </div>
    );
  }
}

export default FlowNodeContainer;
