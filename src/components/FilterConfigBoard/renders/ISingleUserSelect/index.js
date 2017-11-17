import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import SingleUserSelectModal from './SingleUserSelectModal';

const Option = Select.Option;

class ISingleUserSelect extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  onModalConfirm = user => {
    this.setState({
      modalVisible: false
    });
    this.props.onChange({
      dataVal: user.id,
      dataVal_name: user.name
    });
  };

  handleChange = val => {
    if (val === '-1') {
      this.showModal();
    } else {
      this.props.onChange({
        dataVal: val,
        dataVal_name: ''
      });
    }
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  render() {
    const { dataVal, dataVal_name } = this.props.value;
    return (
      <div>
        <Select value={dataVal} onChange={this.handleChange} style={{ width: '100%' }}>
          <Option value="{currentUser}">本人</Option>
          {dataVal_name ? ([
            <Option key={dataVal} value={dataVal}>{dataVal_name}</Option>,
            <Option key="-1" value="-1">特定人（单选）</Option>
          ]) : <Option value="-1">特定人（单选）</Option>}
        </Select>
        <SingleUserSelectModal
          visible={this.state.modalVisible}
          onCancel={this.hideModal}
          onOk={this.onModalConfirm}
        />
      </div>
    );
  }
}

export default ISingleUserSelect;
