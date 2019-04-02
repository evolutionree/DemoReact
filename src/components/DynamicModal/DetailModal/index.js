import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, message, Spin } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { DynamicFormView } from '../../../components/DynamicForm';
import { getGeneralProtocol, getEntcommDetail } from '../../../services/entcomm';
import connectPermission from '../../../models/connectPermission';
import styles from './styles.less';

class DetailModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    onCancel: PropTypes.func
  };
  static defaultProps = {};

  state = {
    loading: false
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { recordId, entityId } = nextProps;
      this.setState({ loading: true });

      Promise.all([
        this.fetchDetailData(entityId, recordId),
        this.fetchProtocol(entityId)
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
        detailData: {},
        protocol: [],
        loading: false,
        tabInfoFieldName: ''
      });
    }
  }

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


  renderTitle = (title) => {
    const { entityId, recordId, onCancel } = this.props;
    return (
      <div className={styles.modaltitle}>
        <span>{title}</span>
        <div className={styles.titlebtns}>
          <Link className={styles.linkEntity} to={`/entcomm/${entityId}/${recordId}`} onClick={onCancel}>跳转到主页</Link>
        </div>
      </div>
    );
  }

  render() {
    const { title, visible, onCancel, entityId } = this.props;
    const { loading, protocol, detailData } = this.state;

    return (
      <Modal
        wrapClassName={styles.modal}
        title={this.renderTitle(title)}
        visible={visible}
        onCancel={onCancel}
        maskClosable
        footer={null}
      >
        <Spin spinning={loading}>
          <DynamicFormView
            entityId={entityId}
            entityTypeId={(detailData && detailData.rectype) || entityId}
            fields={protocol}
            value={detailData || {}}
            cols={24}
          />
        </Spin>
      </Modal>
    );
  }
}

export default connect()(connectPermission(props => props.entityId, DetailModal));
