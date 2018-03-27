/**
 * Created by 0291 on 2018/3/7.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col, Input } from 'antd';
import InputAddress from '../../../components/DynamicForm/controls/InputAddress';
import { connect } from 'dva';

class AddressSet extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  updateAddress = (value) => {
    this.props.onChange({
      ...this.props.value,
      location: value
    });
  }

  updateDistanceRange = (e) => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.props.onChange({
        ...this.props.value,
        fencing: value
      });
    }
  }

  onBlur = () => {
    const { onChange } = this.props;
    const value = this.props.value.fencing
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      onChange({
        ...this.props.value,
        fencing: value.slice(0, -1)
      });
    }
  }

  render() {
    const { location, fencing } = this.props.value;
    return (
      <div>
        <div style={{ width: '40%', float: 'left', paddingRight: '10px' }}>
          <InputAddress onChange={this.updateAddress} value={location} />
        </div>
        <span>允许偏差距离<Input addonAfter="米" style={{ width: '30%', paddingLeft: '4px' }} onChange={this.updateDistanceRange} onBlur={this.onBlur} value={fencing} /></span>
      </div>
    );
  }
}

export default AddressSet;
