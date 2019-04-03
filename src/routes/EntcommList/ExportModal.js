/**
 * Created by 0291 on 2018/5/14.
 */
import { Form } from 'antd';
import { connect } from 'dva';
import ExportModal from '../../components/ExportModal';

export default connect(
  state => {
    const { showModals, entityId, protocol, queries } = state.entcommList;
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
        dispatch({ type: 'entcommList/showModals', payload: '' });
      }
    };
  }
)(Form.create()(ExportModal));
