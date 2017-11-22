/**
 * Created by 0291 on 2017/11/7.
 */
import React, { Component } from 'react';
import ListInput from './multipleInput';
import NormalInput from './normalInput';
import { connect } from 'dva';

class Form extends Component {
  static propTypes = {
    model: React.PropTypes.array.isRequired
  };
  static defaultProps = {
    model: []
  };

  constructor(props) {
    super(props);
    this.state = {
      model: this.props.model,
      updateFocus: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      model: nextProps.model
    });

    if (JSON.stringify(this.state.model) !== JSON.stringify(nextProps.model)) {
      this.setState({
        updateFocus: true
      });
    }
  }

  componentDidMount() {
    if (this.state.model && this.state.model instanceof Array && this.state.model.length > 0) {
      setTimeout(() => {
        this.refs[this.state.model[0].name].refs.wrappedInstance.inputFocus();
      }, 3000);
    }
  }

  componentDidUpdate() {
    if (this.state.updateFocus) {
      if (this.state.model && this.state.model instanceof Array && this.state.model.length > 0) {
        this.refs[this.state.model[0].name].refs.wrappedInstance.inputFocus();
      }
      this.setState({
        updateFocus: false
      });
    }
  }

  getData() {
    let returnData = {};
    for (let v in this.refs) {
      returnData[v] = this.refs[v].refs.wrappedInstance.getData();
    }
    return returnData;
  }

  changeFormData(name, data) { //更新最新的表单数据到Modal State中
    const editEmailFormData = this.props.editEmailFormData || {};
    const newEditEmailFormData = {
      ...editEmailFormData,
      [name]: data
    };

    this.props.dispatch({ type: 'mails/putState', payload: { editEmailFormData: newEditEmailFormData } });
  }

  focusHandler(name) { //监听用户最后一次焦点在哪个输入框中
    this.props.dispatch({ type: 'mails/putState', payload: { focusTargetName: name } });
  }

  blurHandler(name) {
    //this.props.dispatch({ type: 'mails/putState', payload: { focusTargetName: '' } });
  }

  render() {
    const editEmailFormData = this.props.editEmailFormData;

    return (
      <div>
        {
          this.state.model && this.state.model instanceof Array && this.state.model.map((item, index) => {
            if (item.type === 'multipleInput') {
              return (
                <ListInput label={item.label}
                           changeData={this.changeFormData.bind(this, item.name)}
                           onFocus={this.focusHandler.bind(this, item.name)}
                           onBlur={this.blurHandler.bind(this, item.name)}
                           ref={item.name} key={index} data={(editEmailFormData && editEmailFormData[item.name]) || []} />
              );
            } else if (item.type === 'normalInput') {
              return <NormalInput label={item.label}
                                  changeData={this.changeFormData.bind(this, item.name)}
                                  ref={item.name} key={index} data={(editEmailFormData && editEmailFormData[item.name]) || ''} />;
            }
          })
        }
      </div>
    );
  }
}

export default connect(
  state => {
    return { ...state.mails };
  }
)(Form);
