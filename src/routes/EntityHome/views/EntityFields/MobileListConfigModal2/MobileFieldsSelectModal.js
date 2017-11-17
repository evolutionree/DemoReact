import React from 'react';
import { Modal, Button, Col, Row } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './styles.less';

function orderUp(arr, item) {
  const index = arr.indexOf(item);
  if (index === -1 || index === 0) return arr;
  const prevIndex = index - 1;
  const newArr = [...arr];
  newArr[index] = newArr[prevIndex];
  newArr[prevIndex] = item;
  return newArr;
}
function orderDown(arr, item) {
  const index = arr.indexOf(item);
  if (index === -1 || index >= arr.length - 1) return arr;
  const nextIndex = index + 1;
  const newArr = [...arr];
  newArr[index] = newArr[nextIndex];
  newArr[nextIndex] = item;
  return newArr;
}

class MobileFieldsSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    allFields: React.PropTypes.array,
    pickedIds: React.PropTypes.arrayOf(React.PropTypes.string),
    onPick: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      pickedIds: [],
      currField: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        pickedIds: nextProps.pickedIds,
        currField: ''
      });
    }
  }

  showPicker = () => {
    this.setState({ shown: true });
  };

  handleCancel = () => {
    this.setState({ shown: false });
  };

  handlePick = () => {
    this.props.onPick && this.props.onPick(this.state.pickedIds);
    this.setState({
      shown: false
    });
  };

  handleUp = () => {
    const id = this.state.currField;
    if (!id) return;
    if (this.state.pickedIds.indexOf(id) === -1) return;
    this.setState({
      pickedIds: orderUp(this.state.pickedIds, id)
    });
  };

  handleDown = () => {
    const id = this.state.currField;
    if (!id) return;
    if (this.state.pickedIds.indexOf(id) === -1) return;
    this.setState({
      pickedIds: orderDown(this.state.pickedIds, id)
    });
  };

  pick = () => {
    const id = this.state.currField;
    if (!id) return;
    if (this.state.pickedIds.indexOf(id) !== -1) return;
    this.setState({
      pickedIds: [...this.state.pickedIds, id],
      currField: ''
    });
  };

  remove = () => {
    const id = this.state.currField;
    if (!id) return;
    if (this.state.pickedIds.indexOf(id) === -1) return;
    this.setState({
      pickedIds: this.state.pickedIds.filter(item => item !== id),
      currField: ''
    });
  };

  render() {
    const { visible, allFields } = this.props;
    const pickedFields = this.state.pickedIds.map(id => {
      return _.find(allFields, item => item.fieldid === id);
    });
    const restFields = allFields.filter(field => {
      return this.state.pickedIds.indexOf(field.fieldid) === -1;
    });

    return (
      <Modal
        title="添加显示字段"
        visible={visible}
        onOk={this.handlePick}
        onCancel={this.props.onCancel}
      >
        <Row gutter={10}>
          <Col span={8}>
            <div>
              <p className={styles.title}>待选字段</p>
              <ul className={styles.list}>
                {restFields.map(field => (
                  <li
                    className={
                      field.fieldid === this.state.currField
                        ? classnames([styles.item, styles.active])
                        : styles.item
                    }
                    key={field.fieldid}
                    onClick={() => { this.setState({ currField: field.fieldid }); }}
                  >
                    {field.displayname}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Button className={styles.btn} onClick={this.pick}>显示</Button>
            <Button className={styles.btn} onClick={this.remove}>隐藏</Button>
          </Col>
          <Col span={8}>
            <div>
              <p className={styles.title}>已选字段</p>
              <ul className={styles.list}>
                {pickedFields.map(field => (
                  <li
                    className={
                      field.fieldid === this.state.currField
                        ? classnames([styles.item, styles.active])
                        : styles.item
                    }
                    key={field.fieldid}
                    onClick={() => { this.setState({ currField: field.fieldid }); }}
                  >
                    {field.displayname}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col span={4}>
            <Button className={styles.btn} onClick={this.handleUp}>上移</Button>
            <Button className={styles.btn} onClick={this.handleDown}>下移</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default MobileFieldsSelectModal;
