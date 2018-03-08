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
    this.props.onChange(value);
  }

  updateDistanceRange = (e) => {
    this.props.onChange(e.target.value);
  }

  render() {
    return (
      <div>
        <div style={{ width: '40%', float: 'left', paddingRight: '10px' }}>
          <InputAddress onChange={this.updateAddress} />
        </div>
        <span>允许偏差距离<Input addonAfter="米" style={{ width: '30%', paddingLeft: '4px' }} onChange={this.updateDistanceRange} /></span>
      </div>
    );
  }
}

export default AddressSet;
