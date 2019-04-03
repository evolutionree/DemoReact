/**
 * Created by 0291 on 2018/5/14.
 */
import { Form } from 'antd';
import { connect } from 'dva';
import ExportModal from '../../../../components/ExportModal';

export default connect(
  state => {
    const { showModals, daily_entityId: entityId, tableProtocol: protocol, queries } = state.daily;
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
        dispatch({ type: 'daily/showModals', payload: '' });
      }
    };
  }
)(Form.create()(ExportModal));
