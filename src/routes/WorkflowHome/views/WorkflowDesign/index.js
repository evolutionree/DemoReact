import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'dva';
import { Button, Icon } from 'antd';
import * as _ from 'lodash';
import 'jsplumb';
import classnames from 'classnames';
import FlowContainer from './FlowContainer';
import FlowNode from './FlowNode';
import FlowNodeContainer from './FlowNodeContainer';
import FlowConnection from './FlowConnection';
import FlowStepModal from './FlowStepModal/FlowStepModal';
import FlowBranchConditionModal from './FlowBranchConditionModal';
import styles from './styles.less';
import { getNodeElemId } from './helper';

const jsPlumbConfig = {
  PaintStyle: {
    strokeWidth: 2,
    stroke: '#b5b5b5'
  },
  Connector: ['Flowchart', {}],
  Endpoint: ['Dot', { radius: 5 }],
  EndpointStyle: { fill: 'transparent' },
  ConnectionOverlays: [
    ['Arrow', {
      location: 1,
      visible: true,
      width: 11,
      length: 11,
      id: 'ARROW',
      events: {
        click: () => {
          alert('you clicked on the arrow overlay');
        }
      }
    }],
    ['Custom', {
      // location: 0.1,
      // id: 'label',
      // cssClass: 'aLabel',
      // events: {
      //   tap: () => { alert('hey'); }
      // }
      create(component) {
        const customElem = document.createElement('div');
        // component.target.appendChild(customElem);
        ReactDom.render(<span>asdf</span>, customElem);
        return customElem;
      },
      location: 0.7,
      id: 'customOverlay'
    }]
  ]
};

class WorkflowDesign extends Component {
  static propTypes = {
    flowSteps: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    flowPaths: PropTypes.arrayOf(PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired
    })).isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      jspInstance: null
    };
  }

  getJspConfig = () => {
    return {
      PaintStyle: {
        strokeWidth: 2,
        stroke: '#b5b5b5'
      },
      Connector: ['Flowchart', {
        stub: [10, 60],
        midpoint: 0.1,
        gap: 0,
        cornerRadius: 3,
        alwaysRespectStubs: true
      }],
      Endpoint: ['Dot', { radius: 5 }],
      EndpointStyle: { fill: 'transparent' },
      ConnectionOverlays: [
        ['Arrow', {
          location: 1,
          visible: true,
          width: 11,
          length: 11,
          id: 'ARROW',
          events: {
            click: () => {
              alert('you clicked on the arrow overlay');
            }
          }
        }],
        ['Custom', {
          create: (component) => {
            return this.createPathLabel(component);
          },
          location: -50,
          id: 'branchCustomLabel'
        }]
      ]
    };
  };

  createPathLabel = component => {
    const { flowPaths } = this.props;
    const { sourceId, targetId } = component;
    const fromNodeId = sourceId.replace('workflow-', '');
    const toNodeId = targetId.replace('workflow-', '');
    const isBranch = flowPaths.some(path => path.from === fromNodeId && path.to !== toNodeId);

    const customElem = document.createElement('div');

    if (isBranch) {
      // TODO 开启分支条件配置
      const styl = {
        display: 'inline-block',
        paddingBottom: '20px',
        fontSize: '12px',
        cursor: 'pointer'
      };
      ReactDom.render(
        <span style={styl} onClick={this.editBranchRule.bind(this, fromNodeId, toNodeId)}>
          <Icon type="edit" />
          <span>分支条件</span>
        </span>,
        customElem
      );
    }
    return customElem;
  };

  editBranchRule = (fromId, toId) => {
    const path = _.find(this.props.flowPaths, p => p.from === fromId && p.to === toId);
    if (!path) return;
    this.props.editBranchRule(path);
  };

  onContainerReady = (elemContainer) => {
    const jspInstance = jsPlumb.getInstance({ ...this.getJspConfig(), Container: elemContainer });
    // connection事件触发，创建“分支条件”按钮
    jspInstance.bind('connection', (connInfo, originalEvent) => {
      const { connection, source, target } = connInfo;
      // 用户拖拉
      if (originalEvent) {
        this.props.userConnectNode(connInfo);
        setTimeout(() => {
          // jspInstance.detach({
          //   source,
          //   target,
          //   anchor: ['BottomCenter', 'TopCenter']
          // });
          jspInstance.detach(connInfo);
        })
        return;
      }
      this.addExtraEndPoints([source, target]);
      // try {
      //   connection.getOverlay('label').setLabel(connection.sourceId.slice(-1) + '-' + connection.targetId.slice(-1));
      // } catch (e) {
      //   console.error(e);
      // }
    });
    this.setState({ jspInstance });
  };

  addExtraEndPoints = elems => {
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
      endpoint: "Dot",
      paintStyle: {
        // stroke: "#7AB02C",
        stroke: "transparent",
        fill: "transparent",
        radius: 7,
        strokeWidth: 1
      },
      isSource: true,
      connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
      connectorStyle: connectorPaintStyle,
      hoverPaintStyle: endpointHoverStyle,
      connectorHoverStyle: connectorHoverStyle,
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
      paintStyle: { fill: "transparent", radius: 7 },
      hoverPaintStyle: endpointHoverStyle,
      maxConnections: -1,
      dropOptions: { hoverClass: "hover", activeClass: "active" },
      isTarget: true,
      overlays: [
        ["Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: false }]
      ]
    };
    const jsp = this.state.jspInstance;
    const _addEndPoint = (el, isTarget) => {
      const options = {
        anchor: 'TopCenter',
        uuid: el.id + '-TopCenter'
      };
      const options2 = {
        anchor: 'BottomCenter',
        uuid: el.id + '-BottomCenter'
      };
      jsp.addEndpoint(el.id, isTarget ? targetEndpoint : sourceEndpoint, options);
      jsp.addEndpoint(el.id, isTarget ? targetEndpoint : sourceEndpoint, options2);
    };
    elems.forEach(el => {
      const cls = el.classList;
      if (cls.contains('flow-node-start')) return;
      if (cls.contains('flow-node-has-extra-endpoint')) return;
      cls.add('flow-node-has-extra-endpoint');
      if (cls.contains('flow-node-end')) {
        _addEndPoint(el, true);
      } else if (cls.contains('flow-node-mid')) {
        _addEndPoint(el);
      }
    });
  };

  addFlowNode = () => {
    const topNode = _.maxBy(this.state.flowSteps, 'id');
    this.setState({
      flowSteps: [...this.state.flowSteps, {
        id: topNode.id + 1,
        type: 'REVIEW',
        x: topNode.x + 220,
        y: topNode.y,
        title: '审批人',
        payload: {}
      }],
      flowPaths: [...this.state.flowPaths, {
        from: topNode.id + 1,
        to: -1
      }]
    });
  };

  render() {
    const { flowSteps, flowPaths } = this.props;
    const { jspInstance } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <FlowContainer onDomReady={this.onContainerReady}>
          {jspInstance ? (
            <div>
              {flowSteps.map(({ id, x, y, name, rawNode = {} }) => {
                const cls = classnames({
                  'flow-node-start': rawNode.steptypeid === 0,
                  'flow-node-end': rawNode.steptypeid === -1,
                  'flow-node-mid': rawNode.steptypeid !== 0 && rawNode.steptypeid !== -1
                });
                return (
                  <FlowNodeContainer
                    key={id}
                    className={cls}
                    jspInstance={jspInstance}
                    id={getNodeElemId(id)}
                    x={x}
                    y={y}
                  >
                    <FlowNode id={id} title={name} nodeData={rawNode} />
                  </FlowNodeContainer>
                );
              })}
              {flowPaths.map(({ from, to, isBranch }) => (
                <FlowConnection
                  key={`${from}-${to}-${isBranch}`}
                  jspInstance={jspInstance}
                  from={getNodeElemId(from)}
                  to={getNodeElemId(to)}
                />
              ))}
            </div>
          ) : 'loading...'}
          <FlowStepModal />
          <FlowBranchConditionModal />
        </FlowContainer>
        {!flowSteps.length &&
        <Button onClick={this.props.newFlow} style={{ position: 'absolute', right: '130px', top: '30px' }}>
          生成
        </Button>}
        <Button onClick={this.props.save} style={{ position: 'absolute', right: '50px', top: '30px' }}>保存</Button>
      </div>
    );
  }
}

export default connect(
  state => state.workflowDesign,
  dispatch => {
    return {
      save() {
        dispatch({ type: 'workflowDesign/saveFlowDesign' });
      },
      newFlow() {
        dispatch({ type: 'workflowDesign/generateFlowJSON' });
      },
      editBranchRule(flowPath) {
        dispatch({ type: 'workflowDesign/editBranchRule', payload: flowPath });
      },
      userConnectNode(connInfo) {
        dispatch({ type: 'workflowDesign/userConnectNode', payload: connInfo });
      }
    };
  }
)(WorkflowDesign);
