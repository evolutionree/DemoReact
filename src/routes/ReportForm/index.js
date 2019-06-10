/**
 * Created by 0291 on 2018/6/15.
 */
import { connect } from 'dva'
import ReportForm from './ReportForm'

const NAMESPACE = 'reportForm'

export default connect(
  state => ({
    ...state.reportForm,
    siderFold: state.app.siderFold
  }),
  dispatch => ({
    handleSelectTree (checkedKeys) {
      dispatch({ type: `${NAMESPACE}/handleSelectTree`, payload: checkedKeys })
    }
  })
)(ReportForm)
