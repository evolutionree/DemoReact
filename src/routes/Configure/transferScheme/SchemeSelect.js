/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Row, Col } from 'antd';
import { query as queryEntities } from '../../../services/entity';

const Option = Select.Option;

class SchemeSelect extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  onOk = () => {

  };


  render() {
    return (
      <Select>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </Select>
    );
  }
}

export default SchemeSelect;
