/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Row, Col } from 'antd';
import { query as queryEntities } from '../../../services/entity';
import SchemeSelect from './SchemeSelect';
import Styles from './RelTable.less';

const FormItem = Form.Item;
const Option = Select.Option;

class RelTable extends Component {
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

  onOk = () => {

  };


  render() {
    const data = [{
      relObj: '1',
      jilian: true,
      same: true
    }, {
      relObj: '1',
      jilian: true,
      same: true
    }];
    return (
      <div className={Styles.Wrap}>
        <Row className={Styles.Header}>
          <Col span={8}>选择对象</Col>
          <Col span={8}>级联</Col>
          <Col span={8}>相同数据</Col>
        </Row>
        {
          data.map((item, index) => {
            return (
              <Row className={Styles.body}>
                <Col span={8}><SchemeSelect /></Col>
                <Col span={8}><Checkbox /></Col>
                <Col span={8}><Checkbox /></Col>
              </Row>
            );
          })
        }
        <Row>
          <Col span={8}><a href=":javascript">添加</a></Col>
          <Col span={8}><a href=":javascript">全选</a></Col>
          <Col span={8}><a href=":javascript">取消全选</a></Col>
        </Row>
      </div>
    );
  }
}

export default RelTable;
