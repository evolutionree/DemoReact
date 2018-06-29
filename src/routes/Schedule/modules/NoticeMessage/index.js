import React, { PropTypes, Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import { getvertionmsglist } from '../../../../services/schedule';

class NoticeMessage extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      pageIndex: 1,
      hasMore: true
    };
  }

  componentDidMount() {
    if (this.props.visible) {
      this.queryList(1);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.state.list.length && this.state.hasMore) {
      this.queryList(1);
    }
  }

  queryList(pageIndex) {
    const params = {
      Direction: 0, //以版本号为基线，向前或者向后取值，-1为取小于RecVersion的数据，0为全量，1为取大于RecVersion的数据
      MsgGroupIds: [1005],
      PageSize: 20,
      RecVersion: 0
    }
    this.setState({ loading: true });
    getvertionmsglist(params).then(result => {

    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取数据失败');
    });
  }

  render() {
    return (
      <div>NoticeMessage</div>
    );
  }
}

export default connect(
  state => {
    const { activeModule } = state.schedule;
    return {
      visible: activeModule === 'notice'
    };
  }
)(NoticeMessage);

