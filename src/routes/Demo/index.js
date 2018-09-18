/**
 * Created by 0291 on 2018/7/31.
 */
import React, {  PureComponent } from 'react';
import _ from "lodash";

import ApprovalNotice from "./components/ApprovalNotice";
import Filtrate from './components/Filtrate';

class Demo extends PureComponent {

  render() {
    return (
     <div>
        <div style={{ width: '450px' }}>
          <ApprovalNotice title="审批" height={800} maxListLength={10} />
        </div>
        <div style={{ width: '800px' }}>
          <Filtrate />
        </div>
     </div>
    )
  }
}

export default Demo;
