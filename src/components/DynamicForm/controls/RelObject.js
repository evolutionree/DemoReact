import React from 'react';

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

  getValue = () => {
    const { value_name } = this.props;
    const showTitle = value_name || this.state.title;
    return showTitle;
  }

  render() {
    const { value_name } = this.props; //编辑页 数据源不允许修改  直接取value_name值
    const showTitle = value_name || this.state.title;
    return (
      <div style={{ height: '32px' }}>
        <div className="ant-input" title={showTitle} style={{
          cursor: 'not-allowed',
          backgroundColor: 'rgb(247, 247, 247)',
          color: 'rgba(0, 0, 0, 0.5)',
          height: '32px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>{showTitle}</div>
      </div>
    );
  }
}

RelObject.AdvanceSearch = RelObject;

export default RelObject;
