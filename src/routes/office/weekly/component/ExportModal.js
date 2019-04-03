/**
 * Created by 0291 on 2018/5/14.
 */
import { Form } from 'antd';
import { connect } from 'dva';
import ExportModal from '../../../../components/ExportModal';

export default connect(
  state => {
    const { showModals, entityId, tableProtocol: protocol, queries } = state.weekly;
    return {
      visible: /export/.test(showModals),
      entityId,
      protocol,
      queries
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'weekly/showModals', payload: '' });
      }
    };
  }
)(Form.create()(ExportModal));
