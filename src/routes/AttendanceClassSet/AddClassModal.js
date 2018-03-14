/**
 * Created by 0291 on 2018/3/5.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message } from 'antd';
import AddForm from './AddForm';
import { connect } from 'dva';

const defaultFormValue = {
  recname: '',
  workTime: {
    startworktime: '',
    offworktime: ''
  },
  restTime: {
    hasresttime: 0,
    startresttime: '',
    endresttime: ''
  },
  flexTime: {
    hasflextime: 0,
    flextime: ''
  },
  earlysign: '',
  latestsign: ''
};

class AddClassModal extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      FormValue: this.props.formData ? this.getTransformFormData(this.props.formData) : defaultFormValue
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      FormValue: nextProps.formData ? this.getTransformFormData(nextProps.formData) : defaultFormValue
    });
  }

  getTransformFormData (formData) {
    let newFormData = {
      ...formData
    };
    newFormData.workTime = {
      startworktime: formData.startworktime,
      offworktime: formData.offworktime
    };
    newFormData.restTime = {
      hasresttime: formData.hasresttime,
      startresttime: formData.startresttime,
      endresttime: formData.endresttime
    };
    newFormData.flexTime = {
      hasflextime: formData.hasflextime,
      flextime: formData.flextime
    };
    return newFormData;
  }

  handleOk = () => {
    this.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const submitData = {
        ...values,
        ...values.workTime,
        ...values.restTime,
        ...values.flexTime
      };
      delete submitData.workTime;
      delete submitData.restTime;
      delete submitData.flexTime;

      const params = {
        typeid: this.props.entityId,
        fieldData: submitData
      };
      this.setState({ confirmLoading: true });
      this.props.submit(params, this.props.showModals);
    });
  };


  render() {
    const { showModals, visible, cancel } = this.props;
    return (
      <Modal
        title={showModals === 'add' ? '新增班次' : '编辑班次'}
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
        width={550}
      >
        <AddForm ref={form => { this.form = form; }} value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityId, formData } = state.attendanceClassSet;
    return {
      visible: /edit|add/.test(showModals),
      showModals: showModals,
      entityId,
      formData
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'attendanceClassSet/showModals', payload: '' });
      },
      submit(submitData, submitType) {
        if (submitType === 'add') {
          dispatch({ type: 'attendanceClassSet/add', payload: submitData });
        } else {
          dispatch({ type: 'attendanceClassSet/edit', payload: submitData });
        }
      }
    };
  }
)(AddClassModal);
