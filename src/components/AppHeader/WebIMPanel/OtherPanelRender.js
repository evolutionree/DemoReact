/**
 * Created by 0291 on 2018/6/20.
 */
import React, { Component } from 'react';

import IMPanel from './OtherPanel/IMPanel';
import PersonalDetail from './OtherPanel/PersonalDetail';
import OriginGroup from './OtherPanel/OriginGroup';
import GroupIMPanel from './OtherPanel/GroupIMPanel';

function presetProps(props, WrappedComponent) {
  return class NewComponent extends Component {
    render() {
      return (
        <WrappedComponent
          {...props}
          {...this.props}
        />
      );
    }
  };
}

// const UserSingleSelectModal = presetProps({
//   multiple: false,
//   isRequiredSelect: true
// }, UserSelectModal);

export const OtherPanelRender = {
  IMPanel: IMPanel,
  PersonalDetail: PersonalDetail,
  OriginGroup: OriginGroup,
  GroupIMPanel: GroupIMPanel
};
