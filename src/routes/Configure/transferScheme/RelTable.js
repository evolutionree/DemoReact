/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';
import { query as queryEntities } from '../../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;

class RelTable extends Component {
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
      <div>
232323
      </div>
    );
  }
}

export default RelTable;
