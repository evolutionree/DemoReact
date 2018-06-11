/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Row, Col } from 'antd';

const Option = Select.Option;

class SchemeSelect extends PureComponent {
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

  onSelectChange = (value) => {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    const { relTabEntity, value } = this.props;
    return (
      <Select value={value} onChange={this.onSelectChange}>
        {
          relTabEntity && relTabEntity instanceof Array && relTabEntity.map((entity, index) => {
            return <Option key={entity.entityid + '1' + index}>{entity.entityname}</Option>;
          })
        }
      </Select>
    );
  }
}

export default connect(
  state => {
    const { relTabEntity } = state.transferscheme;
    return {
      relTabEntity
    };
  })(SchemeSelect);
