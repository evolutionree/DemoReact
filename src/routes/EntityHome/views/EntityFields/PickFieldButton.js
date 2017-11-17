import React from 'react';
import { Modal, Button, Col, Row } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './PickFieldButton.less';

class PickFieldButton extends React.Component {
  static propTypes = {
    allFields: React.PropTypes.array,
    pickedIds: React.PropTypes.arrayOf(React.PropTypes.string),
    onPick: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      pickedIds: [],
      currField: ''
    };
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
    const { allFields } = this.props;
    const pickedFields = this.state.pickedIds.map(id => {
      return _.find(allFields, item => item.fieldid === id);
    });
    const restFields = allFields.filter(field => {
      return this.state.pickedIds.indexOf(field.fieldid) === -1;
    });

    return (
      <span style={{ display: 'inline-block' }}>
        <Button onClick={this.showPicker}>添加</Button>
        <Modal
          title="添加显示字段"
          visible={this.state.shown}
          onOk={this.handlePick}
          onCancel={this.handleCancel}
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
                      {field.fieldlabel}
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col span={4}>
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
                      {field.fieldlabel}
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col span={4}>
              <Button className={styles.btn}>上移</Button>
              <Button className={styles.btn}>下移</Button>
            </Col>
          </Row>
        </Modal>
      </span>
    );
  }
}

export default PickFieldButton;
