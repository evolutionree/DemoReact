/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import ScheduleForm from './ScheduleForm';
import TaskForm from './TaskForm';
import classnames from 'classnames';
import Styles from './index.less';

class FormModal extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      titleNodeData: [{ name: '日程', active: true }, { name: '任务', active: false }],
      FormValue: {}
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }

  changeTitleNodeActive(name) {
    const newTitleNodeData = this.state.titleNodeData.map((item) => {
      if (item.name === name) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
    this.setState({
      titleNodeData: newTitleNodeData
    });
  }

  submit() {
    const titleNodeData = this.state.titleNodeData;
    if (titleNodeData[0].active) {
      this.ScheduleFormRef.getWrappedInstance().validateFields((err, fieldsValue) => {
        console.log(fieldsValue)
      });
    } else {
      this.TaskFormRef.getWrappedInstance().validateFields((err, fieldsValue) => {
        console.log(fieldsValue)
      });
    }
  }

  render() {
    const titleNodeData = this.state.titleNodeData;
    const titleNode = titleNodeData.map((item, index) => {
      const cls = classnames({ [Styles.active]: item.active })
      return <span key={index} onClick={this.changeTitleNodeActive.bind(this, item.name)} className={cls}>{item.name}</span>;
    })
    return (
      <Modal title={<div className={Styles.formModalHeader}>{titleNode}</div>}
             wrapClassName="formModalWrap"
             visible={this.props.showModals === 'formModal'}
             onOk={this.submit.bind(this)}
             onCancel={this.props.closeFormModal}
             >
        {
          titleNodeData[0].active ? <ScheduleForm ref={(ref) => { this.ScheduleFormRef = ref }}
                                                  value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} /> : null
        }
        {
          titleNodeData[1].active ? <TaskForm ref={(ref) => { this.TaskFormRef = ref }}
                                              value={this.state.FormValue}
                                              onChange={(formValue) => { this.setState({ FormValue: formValue }) }} /> : null
        }
      </Modal>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      closeFormModal() {
        dispatch({ type: 'schedule/putState', payload: { showModals: '' } });
      }
    };
  }
)(FormModal);
