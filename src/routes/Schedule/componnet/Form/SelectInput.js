/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { Select, Input, Icon, Tooltip } from 'antd';
import Styles from './SelectInput.less';

const Option = Select.Option;


class SelectInput extends Component {
  static propTypes = {

  };
  static defaultProps = {
    placeholder: '请输入'
  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });
  }

  selectValueChange(value) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      select: value
    });
  }

  inputValueChange(e) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      input: e.target.value
    });
  }

  render() {
    const value = this.props.value;
    return (
      <div className={Styles.SelectInputWrap}>
        <Select defaultValue={this.props.options && this.props.options[0].value} value={value && value.select} style={{ width: 120, marginRight: '4px' }}
                onChange={this.selectValueChange.bind(this)}>
          {
            this.props.options && this.props.options instanceof Array && this.props.options.map((item, index) => {
              return <Option value={item.value} key={index}>{item.label}</Option>;
            })
          }
        </Select>
        <Input placeholder={this.props.placeholder} value={value && value.input} style={{ width: this.props.toolTip ? 'calc(100% - 146px)' : 'calc(100% - 124px)' }}
               onChange={this.inputValueChange.bind(this)} />
        {
          this.props.toolTip ? <Tooltip placement="bottom" title={this.props.toolTip}>
            <Icon type="info-circle" style={{ color: '#b8c7ce', fontSize: '18px', marginLeft: '4px' }} />
          </Tooltip> : null
        }
      </div>
    );
  }
}


export default SelectInput;
