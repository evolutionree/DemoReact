import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'dva';
import { Button, Icon } from 'antd';
import * as _ from 'lodash';
import 'jsplumb';
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
        click: () => { alert('you clicked on the arrow overlay'); }
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
            click: () => { alert('you clicked on the arrow overlay'); }
          }
        }],
        ['Custom', {
          // location: 0.1,
          // id: 'label',
          // cssClass: 'aLabel',
          // events: {
          //   tap: () => { alert('hey'); }
          // }
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
    jspInstance.bind('connection', (connInfo, originalEvent) => {
      const { connection } = connInfo;
      connection.getOverlay('label')
        .setLabel(connection.sourceId.slice(-1) + '-' + connection.targetId.slice(-1));
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

  render() {
    const { flowSteps, flowPaths } = this.props;
    const { jspInstance } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <FlowContainer onDomReady={this.onContainerReady}>
          {jspInstance ? (
            <div>
              {flowSteps.map(({ id, x, y, name, rawNode }) => (
                <FlowNodeContainer
                  key={id}
                  jspInstance={jspInstance}
                  id={getNodeElemId(id)}
                  x={x}
                  y={y}
                >
                  <FlowNode id={id} title={name} nodeData={rawNode} />
                </FlowNodeContainer>
              ))}
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
      }
    };
  }
)(WorkflowDesign);
