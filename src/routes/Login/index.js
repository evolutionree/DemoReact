import { connect } from 'dva';
import LoginPage from './LoginPage';

export default connect(
  state => state.app,
  dispatch => {
    return {
      login(data) {
        dispatch({ type: 'app/login', payload: data });
      }
    };
  }
)(LoginPage);
