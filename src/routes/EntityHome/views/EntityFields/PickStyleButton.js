import React from 'react';
import { Modal, Button, Col, Row } from 'antd';
import classnames from 'classnames';
import styles from './PickStyleButton.less';

class PickStyleButton extends React.Component {
  static propTypes = {
    allStyles: React.PropTypes.array,
    pickedStyle: React.PropTypes.number,
    onPick: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      currStyle: props.pickedStyle
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ currStyle: nextProps.pickedStyle });
  }

  showPicker = () => {
    this.setState({ shown: true });
  };

  handleCancel = () => {
    this.setState({ shown: false });
  };

  handlePick = () => {
    this.setState({ shown: false });
    this.props.onPick && this.props.onPick(this.state.currStyle);
  };

  render() {
    return (
      <span style={{ display: 'inline-block' }}>
        <Button onClick={this.showPicker}>选择样式</Button>
        <Modal
          title="选择样式"
          visible={this.state.shown}
          onOk={this.handlePick}
          onCancel={this.handleCancel}
        >
          <p>请选择列表显示样式，最多可选择1种</p>
          <ul>
            {
              this.props.allStyles.map(item => {
                const cls = classnames({
                  [styles.item]: true,
                  [styles.active]: item === this.state.currStyle
                });
                return (
                  <li
                    key={item}
                    className={cls}
                    onClick={() => { this.setState({ currStyle: item }); }}
                  >
                    {`样式${item}:`}
                  </li>
                );
              })
            }
          </ul>
        </Modal>
      </span>
    );
  }
}

export default PickStyleButton;
