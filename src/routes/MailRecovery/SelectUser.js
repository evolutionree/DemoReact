/**
 * Created by 0291 on 2017/12/13.
 */
import React, { PropTypes } from 'react';
import { Icon, Input } from 'antd';
import { connect } from 'dva';
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
    });
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
    const userDataSourceData = this.props.userDataSourceData;
   let text = '';
   const filterArray =  userDataSourceData && userDataSourceData instanceof Array && userDataSourceData.filter(item => item.userid === this.props.value);
   if (filterArray instanceof Array && filterArray.length === 1) {
     text = filterArray[0].username;
   }
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

export default connect(
  state => state.mailrecovery,
  dispatch => {
    return {

    };
  }
)(UserSelect);
