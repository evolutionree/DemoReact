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
      model: this.props.model
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      model: nextProps.model
    });
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    // if (this.props.model && this.props.model instanceof Array && this.props.model.length > 0) {
    //   this.refs[this.props.model[0].name].inputFocus();
    // }
  }

  getData() {
    let returnData = {};
    for (let v in this.refs) {
      returnData[v] = this.refs[v].getData();
    }
    return returnData;
  }

  changeFormData(name, data) {
    const editEmailFormData = this.props.editEmailFormData || {};
    const newEditEmailFormData = {
      ...editEmailFormData,
      [name]: data
    };

    console.log(JSON.stringify(newEditEmailFormData))
    this.props.dispatch({ type: 'mails/putState', payload: {editEmailFormData: newEditEmailFormData} })
  }

  render() {
    const editEmailFormData = this.props.editEmailFormData;

    return (
      <div>
        {
          this.state.model && this.state.model instanceof Array && this.state.model.map((item, index) => {
            if (item.type === 'multipleInput') {
              return <ListInput label={item.label}
                                changeData={this.changeFormData.bind(this, item.name)}
                                ref={item.name} key={index} data={(editEmailFormData && editEmailFormData[item.name]) || []} />;
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
  },
  dispatch => {
    return {
      dispatch
    }
  }
)(Form);
