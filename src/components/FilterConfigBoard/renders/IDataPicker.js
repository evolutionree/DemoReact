import React, { PropTypes, Component } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

class IDataPicker extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = date => {
    const val = date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
    debugger;
    this.props.onChange({ dataVal: val });
  };

  parseValue = () => {
    const { dataVal } = this.props.value;
    if (!dataVal) return undefined;
    return moment(dataVal, 'YYYY-MM-DD HH:mm:ss');
  };

  render() {
    return (
      <DatePicker
        style={{ width: '100%' }}
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择时间"
        value={this.parseValue()}
        onChange={this.handleChange}
      />
    );
  }
}

export default IDataPicker;
