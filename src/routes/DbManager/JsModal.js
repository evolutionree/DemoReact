/**
 * Created by 0291 on 2017/12/15.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Radio, message } from 'antd';
import _ from 'lodash';
import CodeEditor from '../../components/CodeEditor';

const FormItem = Form.Item;

class JsModal extends Component {
  static propTypes = {};
  static defaultProps = {

  };


  constructor(props) {
    super(props);
    this.state = {
      expandJS: this.props.JsData
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      expandJS: nextProps.JsData
    });
  }

  handleSubmit = () => {
    this.props.save && this.props.save(this.state.expandJS);
  };

  onExpandJSChange = val => {
    this.setState({ expandJS: val });
  };

  render() {
    const { showInfoModals, cancel } = this.props;
    const title = showInfoModals === 'editDataJs' ? '编辑初始化数据脚本' : '查看初始化结构脚本';
    const props = {};
    if (showInfoModals === 'viewStructureJs') {
      props.footer = null;
    }

    return (
      <Modal
        visible={/editDataJs/.test(showInfoModals) || /viewStructureJs/.test(showInfoModals)}
        title={title}
        onCancel={cancel}
        onOk={this.handleSubmit}
        wrapClassName="code-editor-modal"
        {...props}
      >
        <CodeEditor
          value={this.state.expandJS}
          onChange={this.onExpandJSChange}
          readOnly={showInfoModals === 'editDataJs' ? false : true}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showInfoModals, currItem, JsData } = state.dbmanager;
    return {
      showInfoModals: showInfoModals,
      currItem: currItem,
      JsData
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dbmanager/showInfoModals', payload: '' });
      },
      save(data) {
        dispatch({ type: 'dbmanager/saveobjectsql', payload: data });
      }
    };
  }
)(JsModal);
