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
        strokeWidth: 3,
        stroke: '#b5b5b5'
      },
      // HoverPaintStyle: {
      //   strokeWidth: 3,
      //   stroke: '#3398db'
      // },
      Connector: ['Flowchart', {
        stub: [10, 60],
        midpoint: 0.1,
        gap: 0,
        cornerRadius: 3,
        alwaysRespectStubs: true
      }],
      Endpoint: ['Dot', {
        radius: 5,
        connectorStyle: {
          strokeWidth: 2,
          stroke: "#61B7CF",
          joinstyle: "round",
          outlineStroke: "white",
          outlineWidth: 2
        },
        // hoverPaintStyle: {
        //   fill: "#216477",
        //   stroke: "#216477"
        // },
        // connectorHoverStyle: {
        //   strokeWidth: 3,
        //   stroke: "#216477",
        //   outlineWidth: 5,
        //   outlineStroke: "white"
        // }
      }],
      EndpointStyle: {
        fill: 'transparent',
        connectorStyle: {
          strokeWidth: 2,
          stroke: "#61B7CF",
          joinstyle: "round",
          outlineStroke: "white",
          outlineWidth: 2
        },
        // hoverPaintStyle: {
        //   fill: "#216477",
        //   stroke: "#216477"
        // },
        // connectorHoverStyle: {
        //   strokeWidth: 3,
        //   stroke: "#216477",
        //   outlineWidth: 5,
        //   outlineStroke: "white"
        // }
      },
      ConnectionsDetachable: false,
      ConnectionOverlays: [
        ['Arrow', {
          location: 1,
          visible: true,
          width: 11,
          length: 11,
          id: 'ARROW',
          events: {
            click: () => {
              // alert('you clicked on the arrow overlay');
            }
          }
        }],
        ['Custom', {
          create: (component) => {
            return this.createPathLabel(component);
          },
          location: -50,
          id: 'branchCustomLabel',
          events: {
            click: () => {
              // debugger;
            }
          }
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
    customElem.className = 'branch-label';

    if (isBranch) {
      // TODO 开启分支条件配置
      const styl = {
        paddingBottom: '20px',
        fontSize: '12px',
        cursor: 'pointer'
      };
      ReactDom.render(
        <span style={styl} className="branch-label-span" onClick={this.editBranchRule.bind(this, fromNodeId, toNodeId)}>
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

    jspInstance.bind('click', (connInfo, originalEvent) => {
      // debugger
    });
    jspInstance.bind('dblclick', (connInfo, originalEvent) => {
      this.props.userDisConnectNode(connInfo);
      // debugger
    });
    jspInstance.bind('connection', (connInfo, originalEvent) => {
      const { connection, source, target } = connInfo;
      // 用户拖拉
      if (originalEvent) {
        jspInstance.detach(connInfo);
        setTimeout(() => {
          this.props.userConnectNode(connInfo);
        }, 5);
        // return;
      }
      // this.addExtraEndPoints([source, target]);
      // try {
      //   connection.getOverlay('label').setLabel(connection.sourceId.slice(-1) + '-' + connection.targetId.slice(-1));
      // } catch (e) {
      //   console.error(e);
      // }
    });
    jspInstance.bind('connectionDetached', (connInfo, originalEvent) => {
      if (originalEvent) {
        this.props.userDisConnectNode(connInfo);
      }
    });
    this.setState({ jspInstance });
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

  onClickContainer = (event) => {
    if (event.target.className === styles.flowcontainer) {
      const jsp = this.state.jspInstance;
      jsp.select().each(conn => {
        const connector = conn.getConnector();
        connector.canvas.classList.remove('connector-active');

        const overlays = conn.getOverlays();
        const branchLabel = overlays.branchCustomLabel;
        if (branchLabel) {
          branchLabel.canvas.classList.remove('branch-label-active');
        }
      });
    }
    // debugger;
  };

  submit = () => {
    const flowNodePosition = {};
    const flowNodes = this.flowNodeWrap.children;
    for (let i = 0; i < flowNodes.length; i++) {
      const flowNodeId = flowNodes[i].id.replace('workflow-', '');
      flowNodePosition[flowNodeId] = {
        positionX: flowNodes[i].offsetLeft,
        positionY: flowNodes[i].offsetTop
      };
    }
    this.props.save(flowNodePosition);
  }

  render() {
    const { flowSteps, flowPaths } = this.props;
    const { jspInstance } = this.state;
    return (
      <div id="flowPanel" style={{ position: 'relative' }} onClick={this.onClickContainer}>
        <FlowContainer onDomReady={this.onContainerReady}>
          {jspInstance ? (
            <div ref={ref => this.flowNodeWrap = ref}>
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
                    steptypeid={rawNode.steptypeid}
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
        <Button onClick={this.props.newFlow} style={{ position: 'absolute', right: '130px', top: '30px', zIndex: 1 }}>
          生成
        </Button>}
        {!!flowSteps.length &&
        <Button onClick={this.props.createNode} style={{ position: 'absolute', right: '130px', top: '30px', zIndex: 1 }}>
          添加节点
        </Button>}
        <Button onClick={this.submit} style={{ position: 'absolute', right: '50px', top: '30px', zIndex: 1 }}>保存</Button>
      </div>
    );
  }
}

export default connect(
  state => state.workflowDesign,
  dispatch => {
    return {
      save(flowNodePosition) {
        dispatch({ type: 'workflowDesign/saveFlowDesign', payload: flowNodePosition });
      },
      newFlow() {
        dispatch({ type: 'workflowDesign/generateFlowJSON' });
      },
      createNode() {
        dispatch({ type: 'workflowDesign/createNode' });
      },
      editBranchRule(flowPath) {
        dispatch({ type: 'workflowDesign/editBranchRule', payload: flowPath });
      },
      userConnectNode(connInfo) {
        dispatch({ type: 'workflowDesign/userConnectNode', payload: connInfo });
      },
      userDisConnectNode(connInfo) {
        dispatch({ type: 'workflowDesign/userDisConnectNode', payload: connInfo });
      }
    };
  }
)(WorkflowDesign);
