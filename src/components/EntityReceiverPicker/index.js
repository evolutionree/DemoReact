import React, { PropTypes, Component } from 'react';
import { Checkbox } from 'antd';
import _ from 'lodash';
import ReceiverPickerSingle from './ReceiverPickerSingle';

class EntityReceiverPicker extends Component {
  static propTypes = {
    fields: PropTypes.array,
    receivers: PropTypes.array,
    receiverRange: PropTypes.number,
    onReceiversChange: PropTypes.func,
    onReceiverRangeChange: PropTypes.func
  };
  static defaultProps = {
    fields: [],
    receivers: [],
    receiverRange: 0
  };

  constructor(props) {
    super(props);

    const { userReceivers, deptReceivers } = this.classifyReceivers(props.receivers);

    this.state = {
      usersChecked: !!userReceivers.length,
      deptsChecked: !!deptReceivers.length
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.receivers !== nextProps.receivers) {
      const { userReceivers, deptReceivers } = this.classifyReceivers(nextProps.receivers);
      if (userReceivers.length > 0) {
        this.setState({
          usersChecked: true
        });
      }
      if (deptReceivers.length > 0) {
        this.setState({
          deptsChecked: true
        });
      }
    }
  }

  classifyReceivers = receivers => {
    const userReceivers = receivers.filter(rec => _.includes([0, 1], rec.itemtype));
    const deptReceivers = receivers.filter(rec => _.includes([2, 3], rec.itemtype));
    return { userReceivers, deptReceivers };
  };

  onUsersCheckedChange = e => {
    const checked = e.target.checked;
    this.setState({ usersChecked: checked });
    if (!checked) {
      this.onUserReceiversChange([]);
    }
  };

  onDeptsCheckedChange = e => {
    const checked = e.target.checked;
    this.setState({ deptsChecked: checked });
    if (!checked) {
      this.onDeptReceiversChange([]);
    }
  };

  onUserReceiversChange = userReceivers => {
    const { deptReceivers } = this.classifyReceivers(this.props.receivers);
    this.props.onReceiversChange([...userReceivers, ...deptReceivers]);
  };

  onDeptReceiversChange = deptReceivers => {
    const { userReceivers } = this.classifyReceivers(this.props.receivers);
    this.props.onReceiversChange([...userReceivers, ...deptReceivers]);
  };

  render() {
    const { usersChecked, deptsChecked } = this.state;
    const { userReceivers, deptReceivers } = this.classifyReceivers(this.props.receivers);
    return (
      <div>
        <Checkbox checked={usersChecked} onChange={this.onUsersCheckedChange}>指定人</Checkbox>
        <ReceiverPickerSingle
          style={{ marginTop: '8px', marginBottom: '8px' }}
          types={[0, 1]}
          receivers={userReceivers}
          onReceiversChange={this.onUserReceiversChange}
          fields={this.props.fields}
          disabled={!usersChecked}
        />
        <Checkbox checked={deptsChecked} onChange={this.onDeptsCheckedChange}>指定部门</Checkbox>
        <ReceiverPickerSingle
          style={{ marginTop: '8px', marginBottom: '8px' }}
          types={[2, 3]}
          receivers={deptReceivers}
          receiverRange={this.props.receiverRange}
          onReceiversChange={this.onDeptReceiversChange}
          onReceiverRangeChange={this.props.onReceiverRangeChange}
          fields={this.props.fields}
          disabled={!deptsChecked}
        />
      </div>
    );
  }
}

export default EntityReceiverPicker;
