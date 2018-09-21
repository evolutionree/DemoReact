/**
 * Created by 0291 on 2018/7/31.
 */
import React, {  PureComponent } from 'react';
import _ from "lodash";

import ApprovalNotice from "../Desk/components/ApprovalNotice";
import Filtrate from '../Desk/components/Filtrate';

class Demo extends PureComponent {

  render() {
    return (
     <div>
        <div style={{ width: '880px' }}>
          <Filtrate height={660} filtrateScrollId='filtrateScroll' />
        </div>
        <div style={{ width: '450px' }}>
          <ApprovalNotice title="审批" height={800} maxListLength={10} />
        </div>
     </div>
    )
  }
}

export default Demo;
