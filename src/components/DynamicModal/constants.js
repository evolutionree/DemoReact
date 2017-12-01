import React, { Component } from 'react';

import UserSelectModal from '../DynamicForm/controls/UserSelectModal';

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

const UserSingleSelectModal = presetProps({
  multiple: false
}, UserSelectModal);

export const controlMap = {
  1: UserSingleSelectModal
};
