/**
 * Created by 0291 on 2017/7/14.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Button, Icon, message } from 'antd';
import * as _ from 'lodash';
import { queryCommonRelField, saveCommonRelField } from '../../../../services/entity';
import styles from './WebListConfigModal.less';


class SetCustMailConfigModal extends React.Component {
  static propTypes = {};
  static defaultTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      data: {
        fieldnotvisible: [],
        fieldvisible: []
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    // 打开窗口时，查数据
    const isOpening = !/customMailConfig/.test(this.props.showModals) &&
      /customMailConfig/.test(nextProps.showModals);
    if (isOpening) {
      const params = {
        entityid: this.props.entityId,
        commentityid: '349cba2f-42b0-44c2-89f5-207052f50a00' // 邮件客户实体id
      };
      queryCommonRelField(params)
        .then(result => {
          this.setState({
            data: result.data
          });
        });
    }
  }

  handleOk = () => {
    const params = this.state.data.fieldvisible.map((item) => {
      return {
        entityid: this.props.entityId,
        fieldid: item.fieldid,
        fieldname: item.fieldname,
        relentityid: '349cba2f-42b0-44c2-89f5-207052f50a00'
      };
    });
    this.setState({ modalPending: true });
    saveCommonRelField(params).then(result => {
      this.setState({ modalPending: false });
      message.success('保存成功');
      this.props.cancel();
    }, err => {
      this.setState({ modalPending: false });
      message.error(err.message || '保存失败');
    });
  };


  pickField = (field) => {
    let newData = _.cloneDeep(this.state.data);
    newData.fieldnotvisible = newData.fieldnotvisible.filter((item) => {
      return item.fieldid !== field.fieldid;
    });
    newData.fieldvisible.push(field);
    this.setState({
      data: newData
    });
  };

  removeField = (field) => {
    let newData = _.cloneDeep(this.state.data);
    newData.fieldvisible = newData.fieldvisible.filter((item) => {
      return item.fieldid !== field.fieldid;
    });
    newData.fieldnotvisible.push(field);
    this.setState({
      data: newData
    });
  };

  pickAll = () => {
    let newData = _.cloneDeep(this.state.data);
    newData.fieldnotvisible.forEach((field) => {
      newData.fieldvisible.push(field);
    });
    newData.fieldnotvisible = [];

    this.setState({
      data: newData
    });
  };

  removeAll = () => {
    let newData = _.cloneDeep(this.state.data);
    newData.fieldvisible.forEach((field) => {
      newData.fieldnotvisible.push(field);
    });
    newData.fieldvisible = [];
    this.setState({
      data: newData
    });
  };

  render() {
    console.log(JSON.stringify(this.state.data))
    return (
      <Modal
        title="设置邮件客户信息字段"
        visible={/customMailConfig/.test(this.props.showModals)}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
        confirmLoading={this.state.modalPending}
      >
        <Row gutter={10}>
          <Col span={10}>
            <div>
              <p className={styles.title}>待选字段</p>
              <ul className={styles.list}>
                {this.state.data.fieldnotvisible.map(field => (
                  <li className={styles.item} key={field.fieldid}>
                    <span title={field.displayname}>{field.displayname}</span>
                    <Icon type="plus" onClick={() => { this.pickField(field); }} />
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Button className={styles.btn} type="default" onClick={this.pickAll}>
              <Icon type="plus" />
            </Button>
            <Button className={styles.btn} type="default" onClick={this.removeAll}>
              <Icon type="minus" />
            </Button>
          </Col>
          <Col span={10}>
            <div>
              <p className={styles.title}>已选字段</p>
              <ul className={styles.list}>
                {this.state.data.fieldvisible.map((field, index) => (
                  <li className={styles.item} key={field.fieldid}>
                    <span>{field.displayname}</span>
                    <Icon type="minus" onClick={() => { this.removeField(field); }} />
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityId } = state.entityFields;
    return {
      showModals,
      entityId
    };
  },
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityFields/showModals', payload: '' })
      }
    };
  }
)(SetCustMailConfigModal);
