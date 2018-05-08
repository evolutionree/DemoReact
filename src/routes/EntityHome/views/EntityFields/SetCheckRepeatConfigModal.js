/**
 * Created by 0291 on 2017/7/14.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Button, Icon, message } from 'antd';
import _ from 'lodash';
import { queryentitycondition } from '../../../../services/entity';
import styles from './WebListConfigModal.less';


class CheckRepeat extends React.Component {
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
    const isOpening = !/checkRepeatConfig/.test(this.props.showModals) &&
      /checkRepeatConfig/.test(nextProps.showModals);
    if (isOpening) {
      queryentitycondition(this.props.entityId)
        .then(result => {
          this.setState({
            data: result.data
          });
        });
    }
  }

  handleOk = () => {
    this.props.submit(this.state.data);
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
    newData.fieldnotvisible.map((field) => {
      newData.fieldvisible.push(field);
    });
    newData.fieldnotvisible = [];

    this.setState({
      data: newData
    });
  };

  removeAll = () => {
    let newData = _.cloneDeep(this.state.data);
    newData.fieldvisible.map((field) => {
      newData.fieldnotvisible.push(field);
    });
    newData.fieldvisible = [];
    this.setState({
      data: newData
    });
  };

  render() {
    return (
      <Modal
        title="设置查重字段"
        visible={/checkRepeatConfig/.test(this.props.showModals)}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
        confirmLoading={this.props.modalPending}
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
  state => state.entityFields,
  dispatch => {
    return {
      submit: (visibleFields) => {
        dispatch({ type: 'entityFields/setCheckRepeatConfig', payload: visibleFields })
      },
      cancel: () => {
        dispatch({ type: 'entityFields/showModals', payload: '' })
      }
    };
  }
)(CheckRepeat);
