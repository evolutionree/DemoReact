/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { Input, Row, Col } from 'antd';
import Styles from './DataTable.less';

const columns = ['extfield1', 'extfield2', 'extfield3', 'extfield4', 'extfield5'];

class DataTable extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  inputChange = (key, e) => {
    const itemValue = this.props.value || {};
    itemValue[key] = e.target.value;
    this.props.onChange && this.props.onChange(itemValue);
  }

  render() {
    const itemValue = this.props.value || {};
    return (
      <div className={Styles.Wrap}>
        <Row className={Styles.Header}>
          <Col span={12}>存储名称</Col>
          <Col span={12}>显示名称</Col>
        </Row>
        {
          columns.map((item, index) => {
            return (
              <Row className={Styles.body} key={index}>
                <Col span={12}>{item}</Col>
                <Col span={12}><Input value={itemValue[item]} onChange={this.inputChange.bind(this, item)} placeholder="请输入显示名称" /></Col>
              </Row>
            );
          })
        }
      </div>
    );
  }
}

export default DataTable;
