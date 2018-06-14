/**
 * Created by 0291 on 2018/6/14.
 */
import React from 'react';
import { Modal, Col, Row, Icon, message, Form, Input, Radio } from 'antd';
import SelectUser from '../../components/DynamicForm/controls/SelectUser';
import { connect } from 'dva';
import _ from 'lodash';

const FormItem = Form.Item;

const RadioGroup = Radio.Group;

class DataTransferModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    modalPending: React.PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    modalPending: false
  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.props.form.resetFields();
    }
  }

  handleOk = () => {
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const selectSchemeObj = _.find(this.props.schemelist, (item, index) => index === values.fieldid);

      let submitData = {
        newuserid: values.newuserid,
        fieldid: selectSchemeObj.fieldid,
        schemeid: selectSchemeObj.schemeid,
        entityid: this.props.entityId
      };
      if (this.props.currItems.length > 0) { //选择某几行数据后 通过点击 【转移】按钮  弹出的窗口
        submitData.recids = this.props.currItems.map(item => item.recid).join(',');
      } else { //列表上方的【转移】Button点击  弹出的窗口
        let listQueryParams = {
          viewType: 0,
          searchOrder: '',
          ...this.props.queries
        };
        delete listQueryParams.keyword;
        submitData.datafilter = listQueryParams;
      }

      this.props.onOk && this.props.onOk(submitData);
    });
  };

  render() {
    const { visible, onCancel, modalPending, entityName, schemelist, currItems } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={'转移' + entityName}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={modalPending}
      >
        <Form>
          <FormItem
            label="转移数据的范围"
          >
            {getFieldDecorator('range', {
              initialValue: currItems.length > 0 ? 1 : 2
            })(
              <RadioGroup disabled>
                <Radio value={1}>已选中的数据</Radio>
                <Radio value={2}>列表全部数据</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            label="选择要转移的客户字段"
          >
            {getFieldDecorator('fieldid', {
              initialValue: schemelist.length > 0 ? 0 : '',
              rules: [{
                required: true, message: '请选择要转移的客户字段'
              }]
            })(
              <RadioGroup>
                {
                  schemelist.map((item, index) => {
                    const showTitle = item.schemename ? `${item.fieldname}-${item.schemename}` : item.fieldname;
                    return <Radio value={index} key={index}>{showTitle}</Radio>;
                  })
                }
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            label="选择新的用户"
          >
            {getFieldDecorator('newuserid', {
              initialValue: '',
              rules: [{
                required: true, message: '请选择新的用户'
              }]
            })(
              <SelectUser />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending, schemelist, entityName, currItems, queries, entityId } = state.entcommList;
    return {
      visible: /datatransfer/.test(showModals),
      modalPending,
      schemelist,
      entityName,
      currItems,
      queries,
      entityId
    };
  },
  dispatch => {
    return {
      onOk(submitData) {
        dispatch({ type: 'entcommList/datatransfer', payload: submitData });
      },
      onCancel() {
        dispatch({ type: 'entcommList/showModals', payload: '' });
      }
    };
  }
)(Form.create()(DataTransferModal));
