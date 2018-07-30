import React from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Button, Icon, message } from 'antd';
import { getIntlText } from './../../../../components/UKComponent/Form/IntlText';
import { queryWebFieldVisible } from '../../../../services/entity';
import styles from './WebListConfigModal.less';

class WebListConfigModal extends React.Component {
  static propTypes = {};
  static defaultTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      // fieldNotVisible: [],
      // fieldVisible: [],
      pickedIds: []
    };
  }

  componentWillReceiveProps(nextProps) {
    // 打开窗口时，查数据
    const isOpening = !/wListConfig/.test(this.props.showModals) &&
      /wListConfig/.test(nextProps.showModals);
    if (isOpening) {
      queryWebFieldVisible(this.props.entityId)
        .then(result => {
          this.setState({
            // fieldNotVisible: result.data.fieldnotvisible,
            // fieldVisible: result.data.fieldvisible,
            pickedIds: result.data.fieldvisible.map(field => field.fieldid)
          });
        });
    }
  }

  handleOk = () => {
    if (this.state.pickedIds.length > 50) {
      message.error('列表显示字段不能超过50个');
      return;
    }
    this.props.submit(this.state.pickedIds);
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      fieldVisible: arrayMove(this.state.fieldVisible, oldIndex, newIndex)
    });
  };

  pickField = (field) => {
    // const fieldNotVisible = this.state.fieldNotVisible.filter(item => item !== field);
    // const fieldVisible = [...this.state.fieldVisible, field];
    // this.setState({ fieldNotVisible, fieldVisible });
    this.setState({
      pickedIds: [...this.state.pickedIds, field.fieldid]
    });
  };

  removeField = (field) => {
    // const fieldVisible = this.state.fieldVisible.filter(item => item !== field);
    // const fieldNotVisible = [...this.state.fieldNotVisible, field];
    // this.setState({ fieldNotVisible, fieldVisible });
    this.setState({
      pickedIds: this.state.pickedIds.filter(id => id !== field.fieldid)
    });
  };

  pickAll = () => {
    // this.setState({
    //   fieldNotVisible: [],
    //   fieldVisible: this.state.fieldVisible.concat(this.state.fieldNotVisible)
    // });
    this.setState({
      pickedIds: this.getAllFields().map(field => field.fieldid)
    });
  };

  removeAll = () => {
    // this.setState({
    //   fieldNotVisible: this.state.fieldNotVisible.concat(this.state.fieldVisible),
    //   fieldVisible: []
    // });
    this.setState({
      pickedIds: []
    });
  };

  getAllFields = () => {
    // 过滤掉禁用字段和分组
    return this.props.list.filter(field => field.recstatus === 1 && field.controltype !== 20);
  };

  getPickedFields = () => {
    return this.getAllFields().filter(field => this.state.pickedIds.indexOf(field.fieldid) !== -1);
  };

  getRestFields = () => {
    return this.getAllFields().filter(field => this.state.pickedIds.indexOf(field.fieldid) === -1);
  };

  render() {
    return (
      <Modal
        title="设置web端列表显示字段"
        visible={/wListConfig/.test(this.props.showModals)}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
        confirmLoading={this.props.modalPending}
      >
        <Row gutter={10}>
          <Col span={10}>
            <div>
              <p className={styles.title}>待选字段</p>
              <ul className={styles.list}>
                {this.getRestFields().map(field => (
                  <li className={styles.item} key={field.fieldid}>
                    <span title={field.displayname}>{getIntlText('displayname', field)}</span>
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
                {this.getPickedFields().map((field, index) => (
                  <li className={styles.item} key={field.fieldid}>
                    {/*<DragHandle>*/}
                      {/*<Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />*/}
                    {/*</DragHandle>*/}
                    <span>{getIntlText('displayname', field)}</span>
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
        dispatch({ type: 'entityFields/setWebVisibleFields', payload: visibleFields })
      },
      cancel: () => {
        dispatch({ type: 'entityFields/showModals', payload: '' })
      }
    };
  }
)(WebListConfigModal);

