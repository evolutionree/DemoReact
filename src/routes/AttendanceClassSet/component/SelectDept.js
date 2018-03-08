/**
 * Created by 0291 on 2018/3/7.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import ComplexForm from '../../../components/ComplexForm';
import Styles from './SelectDept.less';

class SelectDept extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  showModal = () => {
    this.setState({
      visible: true
    });
  }

  confirm = () => {
    this.ComplexFormRef.validateFields((err, values) => {
      if (err) return;
      console.log(JSON.stringify(values));
      this.props.onChange(values);
    });
  }

  render() {
    let text = 'test';
    const cls = classnames([Styles.wrap, {
      [Styles.empty]: !text,
      [Styles.disabled]: this.props.isReadOnly === 1
    }]);

    const iconCls = classnames([Styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [Styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);


    const value = {
      "DeptSelect":[
        {
          "name":"蓝帆医疗股份有限公司",
          "id":"36f80e4c-e5f9-42df-b734-b3c2a84d6a6c"
        },
        {
          "name":"销售一",
          "id":"d3024f5f-1435-41dd-8e36-040d5898b9e9"
        },
        {
          "name":"金牌A代理团队",
          "id":"7a37d752-faf9-4880-b83c-6fe1619c92f2"
        },
        {
          "name":"精英团队",
          "id":"6ae590fd-6157-43c7-84b9-d24ec5ba4f8d"
        },
        {
          "name":"测试1",
          "id":"528fccc0-df28-430a-8677-e1d5a1e8c3d6"
        },
        {
          "name":"测试停用团队",
          "id":"570155b9-8998-4a33-9d97-d23601564202"
        },
        {
          "name":"test",
          "id":"f8ed23ed-daf8-425d-9ce2-2dbae1659235"
        },
        {
          "name":"技术团队子1",
          "id":"514b5607-3e10-4845-acf4-e746fcce355b"
        }
      ],
      "UserSelect":[
        {
          "name":"asdasd",
          "id":216,
          "deptname":"蓝帆医疗"
        }
      ]
    };
    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div
          className="ant-input"
          onClick={this.showModal}
          title={text}
        >
          {text || this.props.placeholder}
          <Icon type="close-circle" className={iconCls} onClick={this.iconClearHandler} />
        </div>
        <Modal
          title="请选择考勤人员"
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={() => {}}
        >
          <ComplexForm ref={(ref) => this.ComplexFormRef = ref}
                       model={[{ label: '选择团队', name: 'DeptSelect', childrenType: 'DeptSelect' }, { label: '选择人员', name: 'UserSelect', childrenType: 'UserSelect' }]}
                       value={value}
          />
        </Modal>
      </div>
    );
  }
}

export default SelectDept;
