import React, { PropTypes, Component } from 'react';
import { Modal, message, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import DepartmentSelect from '../../components/DepartmentSelect';
const { MonthPicker } = DatePicker;

const monthFormat = 'YYYY-MM';
class ChangeDeptModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      deptId: undefined,
      deptName: undefined,
      effectivedate: moment(new Date().getFullYear() + '-'+ (new Date().getMonth() + 1), monthFormat),
      openKey: new Date().getTime()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        deptId: nextProps.deptId,
        openKey: new Date().getTime()
      });
    }
  }

  onOk = () => {
    const { deptId, effectivedate } = this.state;
    if (!deptId) {
      message.error('请选择部门');
      return;
    }

    if (deptId === this.props.user.deptid) {
      message.warning('当前账号已属于所选团队组织,不能转移');
      return;
    }

    Modal.confirm({
      title: '确定把选中的人员转换到【' + this.state.deptName + '】？',
      onOk: () => {
        this.props.onOk(deptId, effectivedate.format('YYYY-MM'));
      }
    });
  };

  render() {
    const disabledDate = (current) => {
      // Can not select days before today and today
      return current.valueOf() < moment(new Date().getFullYear()-1+ '-' + (new Date().getMonth()+1)) || current.valueOf() > moment((new Date().getFullYear() ) + '-' + (new Date().getMonth() + 1));
    };
    return (
      <Modal
        title="转换团队"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
      >
        <div style={{ marginBottom: '10px' }}>
          <label style={{ paddingRight: '20px' }}>生效月份:</label>
          <MonthPicker value={this.state.effectivedate} disabledDate={disabledDate} format={monthFormat} onChange={effectivedate => this.setState({ effectivedate })} />
        </div>
        <DepartmentSelect
          key={this.state.openKey}
          value={this.state.deptId}
          onChange={(deptId, deptName) => this.setState({ deptId, deptName })}
          width="100%"
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { currentItems, showModals, modalPending } = state.structure;
    const user = currentItems[0];
    return {
      visible: /changeDept/.test(showModals),
      deptId: user && user.deptid,
      user: user,
      modalPending
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'structure/showModals', payload: '' });
      },
      onOk(deptId, effectivedate) {
        dispatch({ type: 'structure/changeUserDept', payload: { deptId, effectivedate } });
      }
    };
  }
)(ChangeDeptModal);
