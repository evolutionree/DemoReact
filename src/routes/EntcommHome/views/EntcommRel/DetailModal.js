import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, message, Spin, Button, Icon } from 'antd';
import { connect } from 'dva';
import { DynamicFormView, DynamicFormEdit } from '../../../../components/DynamicForm';
import { editEntcomm, getGeneralProtocol, getEntcommDetail } from '../../../../services/entcomm';
import styles from './styles.less';
import connectPermission from "../../../../models/connectPermission";

class DetailModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    relId: PropTypes.string,
    detailData: PropTypes.object,
    protocol: PropTypes.array,
    onCancel: PropTypes.func
  };
  static defaultProps = {};

  editForm = null;

  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      detailData: {},
      protocol: [],
      editData: {},
      editProtocol: [],
      loading: false,
      tabInfoFieldName: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { detailData, entityId } = nextProps;
      this.setState({ loading: true });

      Promise.all([
        this.fetchDetailData(entityId, detailData.recid),
        this.fetchProtocol(detailData.rectype || entityId)
      ]).then(([detailResult, protocol]) => {
        this.setState({
          loading: false,
          detailData: detailResult.data.detail,
          protocol
        });
      }).catch(err => {
        this.setState({ loading: false });
        message.error(err.message || '获取数据失败');
      });
    } else if (isClosing) {
      this.setState({
        isEdit: false,
        detailData: {},
        protocol: [],
        editData: {},
        editProtocol: [],
        loading: false,
        tabInfoFieldName: ''
      });
    }
  }

  refreshDetailData = () => {
    this.fetchDetailData(this.props.entityId, this.props.detailData.recid)
      .then(detailResult => {
        this.setState({ detailData: detailResult.data.detail });
      });
  };

  fetchDetailData = (entityId, recId) => {
    return getEntcommDetail({ entityId, recId, needPower: 0 });
  };

  fetchProtocol = typeId => {
    const params = {
      typeId,
      operatetype: 2
    };
    return getGeneralProtocol(params).then(result => result.data);
  };

  startEdit = () => {
    if (this.state.editProtocol.length) {
      this.setState({ isEdit: true, editData: genEditData(this.state.editProtocol, _.cloneDeep(this.state.detailData)) });
      return;
    }
    const { detailData, entityId } = this.props;
    const params = {
      typeId: detailData.rectype || entityId,
      operatetype: 1
    };
    this.setState({ loading: true });
    getGeneralProtocol(params).then(result => {
      const editProtocol = result.data.map(field => {
        if (this.props.tabInfoFieldName && this.props.tabInfoFieldName === field.fieldname) {
          return {
            ...field,
            fieldconfig: {
              ...field.fieldconfig,
              isReadOnly: 1
            }
          };
        }
        return field;
      });
      this.setState({
        isEdit: true,
        loading: false,
        editData: genEditData(editProtocol, _.cloneDeep(this.state.detailData)),
        editProtocol
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取数据失败');
    });

    // fix 表格控件，加typeid
    function genEditData(editProtocol, detail) {
      const retData = _.cloneDeep(detail);
      editProtocol.forEach(field => {
        const { controltype, fieldname, fieldconfig } = field;
        if (controltype === 24 && retData[fieldname]) {
          retData[fieldname] = retData[fieldname].map(item => {
            return {
              TypeId: fieldconfig.entityId,
              FieldData: item
            };
          });
        }
      });
      return retData;
    }
  };

  saveEdit = () => {
    this.editForm.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const params = {
        typeid: this.props.detailData.rectype || this.props.entityId,
        // flowid: this.props.flow ? this.props.flow.flowid : undefined,
        recid: this.props.detailData.recid,
        fieldData: values
      };
      this.setState({ loading: true });
      editEntcomm(params).then(result => {
        this.setState({ loading: false, isEdit: false });
        message.success('提交数据成功');
        this.refreshDetailData();
        this.props.onEdit({ ...this.state.editData });
      }).catch(e => {
        this.setState({ loading: false });
        console.error(e);
        message.error(e.message || '提交数据失败');
      });
    });
  };

  cancelEdit = () => {
    this.setState({ isEdit: false });
  };

  onEditDataChange = editData => {
    this.setState({ editData });
  };

  handleDel = () => {
    Modal.confirm({
      title: '确认删除该记录',
      onOk: () => {
        this.props.delCurrItem();
      }
    });
  };

  renderTitle = () => {
    // return '详细信息';
    return (
      <div className={styles.modaltitle}>
        <span>详细信息</span>
        {this.state.isEdit ? (
          <div className={styles.titlebtns}>
            <span onClick={this.saveEdit}>
              <Icon type="check" /> 保存
            </span>
            <span onClick={this.cancelEdit}>
              <Icon type="close" /> 取消
            </span>
          </div>
        ) : (
          <div className={styles.titlebtns}>
            {this.props.checkFunc('EntityDataEdit') && <span onClick={this.startEdit}>
              <Icon type="edit" /> 编辑
            </span>}
            {this.props.checkFunc('EntityDataDelete') && <span onClick={this.handleDel}>
              <Icon type="delete" /> 删除
            </span>}
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <Modal
        wrapClassName={styles.modal}
        title={this.renderTitle()}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        maskClosable
        footer={null}
      >
        <Spin spinning={this.state.loading}>
          {this.state.isEdit ? (
            <DynamicFormEdit
              entityId={entityId}
              entityTypeId={(this.props.detailData && this.props.detailData.rectype) || this.props.entityId}
              fields={this.state.editProtocol}
              value={this.state.editData}
              onChange={this.onEditDataChange}
              ref={ref => this.editForm = ref}
            />
          ) : (
            <DynamicFormView
              entityId={entityId}
              entityTypeId={(this.props.detailData && this.props.detailData.rectype) || this.props.entityId}
              fields={this.state.protocol}
              value={this.state.detailData || {}}
            />
          )}
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { currItem, list, relEntityId, recordId, relId } = state.entcommRel;
    const { relTabs } = state.entcommHome;

    let tabInfo = {};
    if (relTabs.length && relId && relEntityId) {
      tabInfo = _.find(relTabs, item => {
        return item.relid === relId && item.relentityid === relEntityId;
      });
    }

    return {
      recordId, relId,
      visible: !!currItem,
      entityId: relEntityId,
      detailData: _.find(list, ['recid', currItem]),
      tabInfoFieldName: tabInfo.fieldname
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'entcommRel/putState', payload: { currItem: null } });
      },
      onEdit(newData) {
        dispatch({ type: 'entcommRel/fetchList' });
      },
      delCurrItem() {
        dispatch({ type: 'entcommRel/delCurrItem' });
      }
    };
  }
)(connectPermission(props => props.entityId, DetailModal));

