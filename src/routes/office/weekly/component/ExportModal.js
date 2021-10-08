/**
 * Created by 0291 on 2018/5/14.
 */
import { Form } from 'antd';
import { connect } from 'dva';
import ExportModal from '../../../../components/ExportModal';
import { getDateString } from '../../../../utils';

export default connect(
  state => {
      const { showModals, entityId, tableProtocol: protocol, queries } = state.weekly;
      var searchData = {}
      var extraData = {}
      if(state.weekly.allWeeklySearchData.fromdate && state.weekly.allWeeklySearchData.todate){
         var begindate = getDateString(state.weekly.allWeeklySearchData.fromdate, -6);
         searchData["reportdate"] = begindate + "," + state.weekly.allWeeklySearchData.todate;
      } else if(state.weekly.allWeeklySearchData.fromdate && !state.weekly.allWeeklySearchData.todate){
         var begindate = getDateString(state.weekly.allWeeklySearchData.fromdate, -6);
         searchData["reportdate"] = begindate;
      }else if(state.weekly.allWeeklySearchData.fromdate && !state.weekly.allWeeklySearchData.todate){
         searchData["reportdate"] = state.weekly.allWeeklySearchData.todate;
      }
      if(state.weekly.allWeeklySearchData.reccreator){
         searchData["reccreator"] = state.weekly.allWeeklySearchData.reccreator;
      }
      if(state.weekly.allWeeklySearchData.dept){
         extraData["dept"] = state.weekly.allWeeklySearchData.dept;
      }
      return {
        visible: /export/.test(showModals),
        entityId,
        protocol,
        queries: {...queries, searchData: searchData, extraData: extraData, menuid: "0ad557e0-c709-447e-bf85-89455ec9ae1b"},
        
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
