import React from 'react';
import { connect } from 'dva';
import { Button, Icon, Input, Form, Select, Radio } from 'antd';
import Page from '../../../components/Page';
import styles from './BackFillRule.less';
import { uuid } from '../../../utils/index';
import MappingRelation from './MappingRelation';

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};

class BackFillRule extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      data: [{
        id: '12',
        name: '客户回填规则',
        status: '',
        children: '客户回填规则'
      }]
    };
  }
  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  addRule = () => {
    const { data } = this.state;
    this.setState({
      data: [...data, {
        id: 'add' + uuid(),
        name: '',
        status: 'edit',
        children: 'add' + uuid()
      }]
    });
  }

  editRule = (item) => {
    const { data } = this.state;
    const newData = data.map(dataItem => {
      if (dataItem.id === item.id) {
        dataItem.status = 'edit';
      }
      return dataItem;
    });
    this.setState({
      data: newData
    });
  }

  checkRule = (item) => {
    const { data } = this.state;
    const newData = data.map(dataItem => {
      if (dataItem.id === item.id) {
        dataItem.status = '';
      }
      return dataItem;
    });
    this.setState({
      data: newData
    });
  }

  delRule = (item) => {
    const { data } = this.state;
    const newData = data.filter(dataItem => {
      return dataItem.id !== item.id;
    });
    this.setState({
      data: newData
    });
  }

  inputChangeHandler = (item, e) => {
    const { data } = this.state;
    const newData = data.map(dataItem => {
      if (dataItem.id === item.id) {
        dataItem.name = e.target.value;
      }
      return dataItem;
    });
    this.setState({
      data: newData
    });
  }

  showChildPanel = () => {

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  render() {
    const { data } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Page title="回填规则" contentStyle={contentStyle}>
        <div className={styles.backFillRuleWrap}>
          <div className={styles.leftWrap}>
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={styles.subtitle}>规则</span>
              </div>
              <div className={styles.body}>
                <ul>
                  {
                    data instanceof Array && data.map(item => {
                      return (
                        item.status === 'edit' ? <li className={styles.editLi} key={item.id}>
                          <Input value={item.name} onChange={this.inputChangeHandler.bind(this, item)} />
                          <div>
                            <Icon type="check" style={{ fontSize: '18px', color: '#a2a2a2' }} onClick={this.checkRule.bind(this, item)} />
                            <Icon type="delete" style={{ fontSize: '18px', color: '#a2a2a2' }} onClick={this.delRule.bind(this, item)} />
                          </div>
                        </li> : <li key={item.id} onDoubleClick={this.editRule.bind(this, item)} onClick={this.showChildPanel}>{item.name}</li>
                      );
                    })
                  }
                </ul>
              </div>
              <div className={styles.footer}>
                <Icon type="plus" style={{ fontSize: '26px', color: '#a2a2a2' }} onClick={this.addRule} />
              </div>
            </div>
          </div>
          <div className={styles.rightWrap}>
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={styles.subtitle}>销售回填规则</span>
                <Button onClick={this.handleSubmit}>保存</Button>
              </div>
              <div className={styles.body}>
                <Form>
                  <Form.Item
                    label="填入业务对象"
                  >
                    {getFieldDecorator('note', {
                      rules: [{ required: true, message: 'Please input your note!' }]
                    })(
                      <Select
                        placeholder="Select a option and change input text above"
                        onChange={this.handleSelectChange}
                        style={{ width: '300px' }}
                      >
                        <Select.Option value="male">male</Select.Option>
                        <Select.Option value="female">female</Select.Option>
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item
                    label="字段填写方式"
                  >
                    {getFieldDecorator('radio-group', {
                      rules: [{ required: true, message: 'Please input your note!' }],
                      initialValue: 'a'
                    })(
                      <Radio.Group>
                        <Radio value="a">覆盖已填字段</Radio>
                        <Radio value="b">跳过已填字段</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                  <Form.Item
                    label="字段映射关系"
                  >
                    {getFieldDecorator('relation')(
                      <MappingRelation />
                    )}
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

const WrappedApp = Form.create()(BackFillRule);
export default WrappedApp;
