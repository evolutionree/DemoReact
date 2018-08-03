/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import { connect } from 'dva';
import RightLayout from './RightLayout.js';
import LeftLayout from './LeftLayout.js';
import mainstyles from './main.less';
import styles from './styles.less';

class Desk extends React.PureComponent {
  static defaultProps = {

  };

  constructor(props) {
    super(props);
  }


  render() {
    console.log(this.props.leftComponent)
    return (
     <div className={styles.deskWrap}>
       <div className={styles.leftWrap}>
         <LeftLayout layout={this.props.leftComponent} />
       </div>
       <div className={styles.rightWrap}>
         <RightLayout layout={this.props.leftComponent} />
       </div>
     </div>
    );
  }
}

export default connect(
  state => state.desk,
  dispatch => {

  }
)(Desk);
