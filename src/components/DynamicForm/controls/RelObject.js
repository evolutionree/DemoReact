import React from 'react';
import { createNormalInput } from './utils';


class RelObject extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      title: ''
    };
  }

  setValue = val => {
    //this.props.onChange(val, true);
  };

  setTitle = (name) => { //操作对应的数据源表单项后  调用该方法  设置 显示值
    this.setState({
      title: name
    });
  }

  onCheckChange = (e) => {
    this.props.onChange(e.target.checked);
  };

  render() {
    const { value_name } = this.props; //编辑页 数据源不允许修改  直接取value_name值
    return (
      <div className="ant-input" style={{
        cursor: 'not-allowed',
        backgroundColor: 'rgb(247, 247, 247)',
        color: 'rgba(0, 0, 0, 0.5)'
      }}>{value_name || this.state.title}</div>
    );
  }
}

RelObject.AdvanceSearch = createNormalInput('text');

export default RelObject;
