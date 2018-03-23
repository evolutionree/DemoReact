/**
 * Created by 0291 on 2018/3/23.
 */
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { Table, Icon, Divider } from 'antd';
import Styles from './index.less';
import classnames from 'classnames';

class FoldTable extends Component {
  static propTypes = {
    title: PropTypes.string,
    columns: PropTypes.array,
    dataSource: PropTypes.array
  };
  static defaultProps = {
    fold: false
  };

  constructor(props) {
    super(props);
    this.state = {
      fold: this.props.fold
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }

  foldHandler = () => {
    this.setState({
      fold: !this.state.fold
    });
  }

  render() {
    const iconStyle = this.state.fold ? { transform: 'rotate(180deg)' } : {};

    return (
      <div style={{ marginTop: '10px' }}>
        <div className={Styles.header}>
          <span>{this.props.title}</span>
          <div onClick={this.foldHandler}>
            <i style={{ ...iconStyle }}></i>
          </div>
        </div>
        <div className={Styles.body} style={{ display: this.state.fold ? 'none' : 'block' }}>
          <Table columns={this.props.columns} dataSource={this.props.dataSource} bordered={false} pagination={false} />
        </div>
      </div>
    );
  }
}


export default FoldTable;
