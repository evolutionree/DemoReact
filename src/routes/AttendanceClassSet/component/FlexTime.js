/**
 * Created by 0291 on 2018/3/13.
 */
import React, { PropTypes, Component } from 'react';
import { Select, Checkbox } from 'antd';
import { connect } from 'dva';
const Option = Select.Option;

class FlexTime extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onCheckChange = (e) => {
    this.props.onChange && this.props.onChange({
      hasflextime: e.target.checked ? 1 : 0,
      flextime: ''
    });
  }

  selectChange = (value) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      flextime: value
    });
  }

  render() {
    const time = [{ text: '10分钟', value: 10 }, { text: '20分钟', value: '20' }, { text: '30分钟', value: '30' }, { text: '40分钟', value: '40' },
      { text: '50分钟', value: '50' }, { text: '60分钟', value: '60' }, { text: '70分钟', value: '70' }, { text: '80分钟', value: '80' }, { text: '90分钟', value: '90' },
      { text: '100分钟', value: '100' }, { text: '110分钟', value: '110' }, { text: '120分钟', value: '120' }];

    const { hasflextime, flextime } = this.props.value;
    return (
      <div>
        <Checkbox onChange={this.onCheckChange} checked={hasflextime === 1}>允许</Checkbox>
        <div style={{ display: hasflextime === 1 ? 'inline-block' : 'none' }}>
          <Select value={flextime} style={{ width: 120 }} onChange={this.selectChange}>
            {
              time.map((item, index) => {
                return <Option key={index} value={item.value}>{item.text}</Option>;
              })
            }
          </Select>
        </div>
      </div>
    );
  }
}

export default FlexTime;
