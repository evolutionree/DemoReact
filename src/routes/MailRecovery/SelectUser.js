/**
 * Created by 0291 on 2017/12/13.
 */
import React, { PropTypes } from 'react';
import { Icon, Input } from 'antd';
import UserSelectModal from './UserSelectModal';

class UserSelect extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  showModal() {
    this.setState({
      modalVisible: true
    })
  }

  hideModal() {
    this.setState({
      modalVisible: false
    })
  }

  handleOk(item) {
    this.props.onChange && this.props.onChange(item.userid);
    this.setState({
      modalVisible: false
    })
  }

  render() {
   const text = this.props.value;
   // <Icon type="close-circle" />
    return (
      <div>
        <div className="ant-input" onClick={this.showModal.bind(this)} style={{ width: 200 }}>
          {
            text || this.props.placeholder
          }
        </div>
        <UserSelectModal
          visible={this.state.modalVisible}
          onOk={this.handleOk.bind(this)}
          onCancel={this.hideModal.bind(this)}
        />
      </div>
    );
  }
}

export default UserSelect;
