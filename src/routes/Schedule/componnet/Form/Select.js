/**
 * Created by 0291 on 2017/12/28.
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

  handleChange() {

  }

  render() {
    return (
      <div className={Styles.SelectInputWrap}>
        <Select defaultValue={this.props.options && this.props.options[0].value} style={{ width: this.props.toolTip ? 'calc(100% - 26px)' : '100%', marginRight: '4px' }} onChange={this.handleChange.bind(this)}>
          {
            this.props.options && this.props.options instanceof Array && this.props.options.map((item, index) => {
              return <Option value={item.value} key={index}>{item.label}</Option>;
            })
          }
        </Select>
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
