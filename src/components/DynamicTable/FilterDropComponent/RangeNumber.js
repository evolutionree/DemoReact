/**
 * Created by 0291 on 2018/4/18.
 */
import React, { PropTypes, Component } from 'react';
import { InputNumber } from 'antd';

class RangeNumber extends Component {
  static propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    width: PropTypes.number
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  onChange = (type, value) => {
    const newValue = this.props.value;
    if (type === 'min') {
      newValue[0] = value;
    } else {
      newValue[1] = value;
    }
    if (newValue[0] === undefined) {
      newValue[0] = '';
    }
    if (newValue[1] === undefined) {
      newValue[1] = '';
    }
    this.props.onChange && this.props.onChange(newValue);
  }

  render() {
    const { width = 160 } = this.props;
    const rangeNumberArr = this.props.value;
    const minValue = [undefined, null, '', 'isnull'].includes(rangeNumberArr[0]) ? null : rangeNumberArr[0];
    const maxValue = [undefined, null, '', 'isnull'].includes(rangeNumberArr[1]) ? null : rangeNumberArr[1];

    return (
      <div>
        <div>从</div>
        <InputNumber style={{ width, marginRight: 8 }} onChange={this.onChange.bind(this, 'min')} value={minValue} />
        <div>到</div>
        <InputNumber style={{ width, marginRight: 8 }} onChange={this.onChange.bind(this, 'max')} value={maxValue} />
      </div>
    );
  }
}

export default RangeNumber;
