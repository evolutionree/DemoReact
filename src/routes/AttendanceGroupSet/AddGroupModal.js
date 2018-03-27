/**
 * Created by 0291 on 2018/3/5.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message } from 'antd';
import AddForm from './AddForm';
import { connect } from 'dva';

const defaultFormValue = {
  workdayset: {
    monschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    tuesschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    wednesschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    thursschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    frischedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    saturschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    },
    sunschedule: {
      checkbox: 0,
      class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9'
    }
  },
  otherdayset: {
    specworkdayset: [{ date: '2018-01-01', class: '81f58fa9-f6ad-43b8-ad2a-4139d6861dc9' }],
    ondutyset: []
  },
  addressset: {
    location: null,
    fencing: ''
  }
};

class AddGroupModal extends Component {
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
    newFormData.workdayset = {
      monschedule: formData.monschedule,
      tuesschedule: formData.tuesschedule,
      wednesschedule: formData.wednesschedule,
      thursschedule: formData.thursschedule,
      frischedule: formData.frischedule,
      saturschedule: formData.saturschedule,
      sunschedule: formData.sunschedule
    };
    newFormData.otherdayset = {
      specworkdayset: formData.specworkdayset,
      ondutyset: formData.ondutyset
    };
    newFormData.addressset = {
      location: formData.location,
      fencing: formData.fencing
    };
    return newFormData;
  }

  handleOk = () => {
    console.log(JSON.stringify(this.state.FormValue));
    this.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const submitData = {
        ...values,
        ...values.workdayset,
        ...values.otherdayset,
        ...values.addressset,
        attendancetype: values.attendancetype ? 1 : 0
      };
      delete submitData.workdayset;
      delete submitData.otherdayset;
      delete submitData.addressset;

      const params = {
        typeid: this.props.entityId,
        fieldData: submitData
      };

      this.props.submit(params, this.props.showModals);
    });
  };


  render() {
    const { visible, cancel } = this.props;
    return (
      <Modal
        title="考勤组设置"
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
      >
        <AddForm ref={form => { this.form = form; }} value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityId, formData } = state.attendanceGroupSet;
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
        dispatch({ type: 'attendanceGroupSet/showModals', payload: '' });
      },
      submit(submitData, submitType) {
        if (submitType === 'add') {
          dispatch({ type: 'attendanceGroupSet/add', payload: submitData });
        } else {
          dispatch({ type: 'attendanceClassSet/edit', payload: submitData });
        }
      }
    };
  }
)(AddGroupModal);
