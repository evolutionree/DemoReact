import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import { jsPlumb } from 'jsplumb';
import classnames from 'classnames';
import { queryCaseItem, queryFlowJSONv2 } from '../../services/workflow';
import s from './index.less';

const START_NODE = 0;
const END_NODE = -1;

const jspConfig = {
  PaintStyle: {
    strokeWidth: 3,
    stroke: '#b5b5b5'
  },
  Connector: ['Flowchart', {
    stub: [10, 60],
    midpoint: 0.1,
    gap: 0,
    cornerRadius: 3,
    alwaysRespectStubs: true
  }],
  ConnectionsDetachable: false,
  ConnectionOverlays: [
    ['Arrow', {
      location: 1,
      visible: true,
      width: 11,
      length: 11,
      id: 'ARROW',
      events: {}
    }]
  ]
};

function getNodeElemId(id) {
  return `workflow-${id}`;
}

/**
 * 格式化服务端数据，并为节点初始化坐标
 * @param data { lines, nodes }
 * @returns {flowSteps: Array, flowPaths: Array}
 */
function parseFlowJSON(data) {
  if (!data.nodes || !data.nodes.length) {
    return { flowSteps: [], flowPaths: [], flowStepsByIdCollection: {} };
  }
  const flowSteps = data.nodes.map(item => ({
    id: item.nodeid,
    name: item.nodename,
    x: (item.nodeconfig && item.nodeconfig.positionX) || item.x,
    y: (item.nodeconfig && item.nodeconfig.positionY) || item.y,
    rawNode: item
  }));
  const flowPaths = data.lines.map(item => ({
    from: item.fromnodeid,
    to: item.tonodeid,
    ruleid: item.ruleid
  }));
  return { flowSteps, flowPaths };
}

class FlowChartViewer extends Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      title: null,
      flowSteps: [],
      flowPaths: [],
      flowStepsNodes: null
    };
  }

  componentWillMount() {
    const clientWidth = document.body.clientWidth;
    this.modalWidth = clientWidth * 0.8; 
  }

  componentDidMount() {
    const { flowId, versionnum, caseId } = this.props;
    if (flowId) this.fetchData(flowId, versionnum, caseId);
  }

  componentWillReceiveProps(nextProps) {
    const { flowId, versionnum, caseId } = nextProps;
    if (this.props.flowId !== flowId && flowId) {
      this.fetchData(flowId, versionnum, caseId);
    }
  }

  componentWillUnmount() {
    this.clearPatch();
  }

  // 清楚连接线
  clearPatch = () => {
    const { flowPaths } = this.state;
    const jspInstance = this.jspInstance; 
    if (jspInstance && flowPaths.length) {
      flowPaths.forEach(({ from, to }) => {
        const conn = jspInstance.getConnections({ scope: '*', source: getNodeElemId(from), target: getNodeElemId(to) })[0];
        if (conn) jspInstance.detach(conn);
      });
    }
  }

  fetchData = async (flowId, versionnum, caseId) => {
    if (caseId) {
      const resList = await queryCaseItem(caseId, -1);
      if (resList.data) {
        const { result } = resList.data;
        if (result && result.length) {
          const ids = result.map(l => l.nodeid);
          const passedNodeIds = [...new Set(ids)];
          const jumpNodeIds = result.reduce((pre, v) => {
            const arr = pre.concat();
            if (v.skipnode) arr.push(v.nodeid);
            return arr;
          }, []);
          this.setState({ passedNodeIds, jumpNodeIds });
        }
      }
    }
    const res = await queryFlowJSONv2(flowId, versionnum);
    if (res.data) {
      const { flowSteps, flowPaths } = parseFlowJSON(res.data);
      this.setState({ flowSteps, flowPaths, title: res.data.flow[0] && res.data.flow[0].flowname });
    }
  }

  openModal = () => {
    if (this.jspInstance) this.renderFlowNodes(this.jspInstance);
    this.setState({ visible: true });
  }

  onCloseModal = () => {
    this.setState({ visible: false }, this.clearPatch);
  }

  chartReady = (Container) => {
    if (!this.jspInstance) {
      const jspInstance = this.jspInstance = jsPlumb.getInstance({ ...jspConfig, Container });
      this.renderFlowNodes(jspInstance);
    }
  }

  renderNode = (id, title, steptypeid, isPassed) => {
    if (/__helper/.test(id)) {
      return <div style={{ width: '30px', height: '30px', background: '#333' }}>&nbsp;</div>;
    }

    if (steptypeid === END_NODE) {
      return <div className={classnames(s.END, { [s.isPassed]: isPassed })} title={title}>{title}</div>;
    }

    return (
      <div className={s.REVIEW}>
        <div className={classnames(s.title, { [s.isPassed]: isPassed })}>
          <div className={s.content} title={title}>{title}</div>
        </div>
        {steptypeid === START_NODE ? <div className={classnames(s.body, { [s.isPassed]: isPassed })}>提交人发起审批</div> : null}
      </div>
    );
  }

  renderFlowNodes = (jspInstance) => {
    const { flowSteps, flowPaths, passedNodeIds, jumpNodeIds } = this.state;
    const flowStepsNodes = flowSteps.map(({ id, x, y, name, rawNode = {} }) => {
      const { steptypeid } = rawNode;
      const ids = passedNodeIds && passedNodeIds.slice(0, passedNodeIds.length - 1);
      let isPassed = ids && ids.includes(id);
      if (steptypeid === END_NODE) isPassed = passedNodeIds && passedNodeIds.includes(id);
      if (jumpNodeIds && jumpNodeIds.includes(id)) isPassed = false; // 跳过节点不变色
      return (
        <div
          key={id}
          id={getNodeElemId(id)}
          className={s.flownodeWrap}
          style={{ left: x + 'px', top: y + 'px' }}
        >
          {this.renderNode(getNodeElemId(id), name, steptypeid, isPassed)}
        </div>
      );
    });
    // 节点渲染完成后再渲染连接线
    this.setState({ flowStepsNodes }, () => {
      flowPaths.forEach(({ from, to }) => {
        const isPassed = passedNodeIds && passedNodeIds.includes(from) && passedNodeIds.includes(to);
        // 判断连在一起
        const fromIdx = passedNodeIds && passedNodeIds.findIndex(n => n === from);
        let isConnecte;
        if ((fromIdx || fromIdx === 0) && passedNodeIds) {
          isConnecte = passedNodeIds[fromIdx + 1] === to;
        }
        const paintStyle = isPassed && isConnecte ? { stroke: '#52c41a', strokeWidth: 3 } : undefined;
        jspInstance.connect({
          source: getNodeElemId(from),
          target: getNodeElemId(to),
          anchor: 'Continuous',
          paintStyle
        });
      });
    });
  }

  render() {
    const { visible, title, flowStepsNodes } = this.state;
    return (
      <div className={s.warpViewer}>
        <Button icon="eye" onClick={this.openModal}>流程图</Button>
        <Modal
            title={title}
            width={this.modalWidth}
            visible={visible}
            zIndex={99999}
            onCancel={this.onCloseModal}
            wrapClassName={s.warpViewerModal}
            footer={<Button onClick={this.onCloseModal}>关闭</Button>}
        >
          <div className={s.flowcontainer} ref={this.chartReady}>
            {flowStepsNodes}
          </div>
        </Modal>
      </div>
      
    );
  }
}

export default FlowChartViewer;
