import React, { PropTypes, Component } from 'react';
import { Modal, Spin, message, Table } from 'antd';
import { DynamicFormView } from './DynamicForm';
import { getGeneralProtocol, getEntcommDetail } from '../services/entcomm';
import { dynamicRequest } from '../services/common';
import Attachment from './DynamicForm/controls/Attachment';
import { columns, comboTableRow } from '../routes/AffairDetail';

class EntcommDetailModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func,
    footer: PropTypes.arrayOf(PropTypes.node),
    title: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      protocol: [], // 协议字段
      data: {}, // 表单数据
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      loading: false,
      hasAudit: false, // 是否已存在有审批数据
      entitymodel: {},
      approveList: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;

    if (isOpening) {
      const { entityId, recordId, flowId, caseId } = nextProps;
      this.fetchDetailAndProtocol(entityId, recordId, flowId);
      this.fetchApproveList(nextProps.currItems);
    } else if (isClosing) {
      this.resetState();
    }
  }

  fetchDetailAndProtocol = (entityId, recordId, flowId) => {
    this.setState({
      loading: true
    });
    getEntcommDetail({
      entityId: entityId,
      recId: recordId,
      needPower: 0 // TODO 跑权限
    }).then(result => {
      let { detail } = result.data;
      if (detail instanceof Array) {
        detail = detail[0];
      }
      this.setState({ data: detail });
      return getGeneralProtocol({
        typeId: detail.rectype || entityId,
        OperateType: 2
      });
    }).then(result => {
      this.setState({ protocol: result.data, loading: false });
      const { data } = this.state;

      const entitymodel = {
        typeid: data.rectype,
        relentityid: entityId,
        relrecid: recordId
      };

      const params = {
        entityid: entityId,
        flowid: flowId,
        entitymodel
      };
      return dynamicRequest('/api/workflow/checkrepeatapprove', params).then(res => {
        const { data } = res;
        this.setState({ hasAudit: !!data, entitymodel });
      });
    }).catch(e => {
      console.error(e.message);
      this.setState({
        loading: false
      });
    });
  };

  fetchApproveList = async (currItems) => {
    if (Array.isArray(currItems) && currItems[0] && currItems[0].caseid) {
      const params = { caseId: currItems[0].caseid };
      const { data: { result, result_ext } } = await dynamicRequest('/api/workflow/caseitemlist', params).catch(e => {
        console.error(e.message);
        message.error(e.message);
      });

      // 引用自审批详情页
      let count = 0;
      let flowItemList = [];
      const handleList = Array.isArray(result) && result.length ? result : [];
      const connectList = Array.isArray(result_ext) && result_ext.length ? result_ext : [];

      for (const item of handleList) {
        const preItem = flowItemList[flowItemList.length - 1];
        count = (
          preItem &&
          [1, 2].includes(preItem.nodetype) &&
          [1, 2].includes(item.nodetype) &&
          preItem.nodeid === item.nodeid
        ) ? count : count + 1;

        const itemInfo = { ...item, files: item.filejson, count };

        if ([1, 2].includes(item.nodetype) || item.isallowtransfer === 1 || item.isallowsign === 1) {
          const matchList = connectList.filter(o => (o.nodeid === item.nodeid && o.caseitemid === item.caseitemid)).map(o => {
            return {
              nodeid: item.nodeid,
              nodetype: item.nodetype,
              nodename: item.nodename,
              isallowtransfer: item.isallowtransfer,
              isallowsign: item.isallowsign,
              caseitemid: o.caseitemid,
              username: o.username,
              casestatus: o.flowstatus,
              suggest: o.comment,
              files: o.filejson,
              recupdated: o.reccreated,
              operatetype: o.operatetype,
              originaluserid: o.originaluserid,
              count
            };
          });
          if (matchList.length) {
            flowItemList = flowItemList.concat(...matchList);
            // if (item.nodetype === 2) {
            //   flowItemList = flowItemList.concat(...matchList)
            // } else if (item.isallowtransfer === 1) {
            //   matchList.push(itemInfo)
            //   flowItemList = flowItemList.concat(...matchList)
            // }
          } else {
            flowItemList.push(itemInfo);
          }
        } else {
          flowItemList.push(itemInfo);
        }
      }
      this.setState({ approveList: comboTableRow(flowItemList) });
    }
  }

  resetState = () => {
    this.setState({
      protocol: [],
      data: {},
      key: new Date().getTime()
    });
  };

  onSubmit = () => {
    const { onOk, isneedtorepeatapprove } = this.props;
    const { hasAudit, entitymodel } = this.state;

    if (onOk) {
      if (!hasAudit) return onOk();
      onOk(isneedtorepeatapprove, entitymodel);
    }
  }

  render() {
    const { title, entityName, visible, entityId, onCancel, footer } = this.props;
    const { key, loading, protocol, data, approveList: dataSource } = this.state;

    const otherProps = {};

    if (footer) {
      otherProps.footer = footer;
    } else {
      otherProps.okText = '下一步';
    }

    return (
      <Modal
        title={title || `${entityName || ''}详情`}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onSubmit}
        cancelText="关闭"
        width={document.body.clientWidth * 0.95}
        wrapClassName="DynamicFormModal"
        key={key}
        {...otherProps}
      >
        <Spin spinning={loading}>
          {
            Array.isArray(protocol) && protocol.length ? (
              <DynamicFormView
                entityId={entityId}
                entityTypeId={data.rectype || entityId}
                fields={protocol}
                value={data}
              />
            ) : null
          }
        </Spin>
      </Modal>
    );
  }
}

export default EntcommDetailModal;
