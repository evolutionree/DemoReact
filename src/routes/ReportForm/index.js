/**
 * Created by 0291 on 2018/6/15.
 */
import { connect } from 'dva';
import ReportForm from './ReportForm';

export default connect(state => {
  return { ...state.reportForm, siderFold: state.app.siderFold };
})(ReportForm);
