/**
 * Created by 0291 on 2017/7/26.
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, Modal, Icon, Select } from 'antd';
import Page from '../../../components/Page';
import classnames from 'classnames';
import styles from './detailSet.less';
import KeyInfoModal from './KeyInfoModal';
import DetailParamsList from './component/DetailParamsList';

const FormItem = Form.Item;
const Option = Select.Option;

function DetailSet({
                     form: {
                       getFieldDecorator,
                       validateFields,
                       resetFields
                     },
                     showModals,
                     salesstageevent,
                     salesstageoppinfo,
                     salesstagedynentity,
                     keyInfo,
                     customFormDataSource,
                     location,
                     addAssign,
                     onCancel,
                     showModal,
                     delAssign,
                     updateAssign,
                     customFormSelectHandler,
                     delKeyInfo
                   }) {

  const formItemLayout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 8 }
  };

  const formTailLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8, offset: 4 }
  };


  let fields = [{
    key: 'eventname',
    name: '阶段名称',
    maxLength: 20
  }];
  const handleOk = (e) => {
    e.preventDefault();
    validateFields((err, fieldsValue) => {
      if (err) {
        return;
      } else {
        addAssign(fieldsValue);
      }
    });
  }

  const showAssignModal = () => {
    resetFields(); //清空表单数据
    showModal('addAssign');
  }


  return (
    <Page title="推进条件设定"
          showGoBack
          goBackPath={'/salestage?busintypeid='+ location.query.busintypeid}>
      <div className={styles.listContent}>
        <Button onClick={showAssignModal}>添加阶段任务</Button>
        <div>
          <DetailParamsList
            items={salesstageevent}
            fields={fields}
            itemKey="groupId"
            onDel={delAssign}
            onUpdate={updateAssign}
          />
        </div>
      </div>
      <div className={styles.listContent}>
        <Button onClick={showModal.bind(this, 'addKeyInfo')}>添加关键信息</Button>
        <div>
          <ul className={styles.keyInfoWrap}>
            {
              salesstageoppinfo.map((item, index) => {
                return (
                  <li key={index}>
                    <span title={item.fieldlabel}>{item.fieldlabel}</span>
                    <Icon type="close" onClick={delKeyInfo.bind(this, item.fieldid)} />
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
      <div className={styles.listContent}>
        <Button>添加自定义表单</Button>
        <div>
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="请选择自定义表单"
            optionFilterProp="children"
            allowClear={true}
            onChange={customFormSelectHandler}
            filterOption={(inputValue, option) => option.props.children.indexOf(inputValue) >= 0}
            value={salesstagedynentity.length > 0 ? salesstagedynentity[0].relentityid : ''}
          >
            <Option value="">无</Option>
            {
              customFormDataSource.map((item) => {
                return <Option key={item.entityid} value={item.entityid}>{item.entityname}</Option>
              })
            }
          </Select>
        </div>
      </div>
      <Modal
        title="添加阶段任务"
        visible={/addAssign/.test(showModals)}
        onOk={handleOk}
        onCancel={onCancel}
      >
        <Form>
          <FormItem {...formItemLayout} label="阶段任务名称">
            {getFieldDecorator('eventName', {
              initialValue: '',
              validateTrigger: 'onChange',
              rules: [{ required: true, message: `不能为空` },
                { pattern: new RegExp(/^.{1,20}$/), message: '请输入20个以内的字符' }]
            })(
              <Input />
            )}
          </FormItem>
          <FormItem {...formTailLayout}>
            {getFieldDecorator('isNeedUpFile', {
              initialValue: '',
              validateTrigger: 'onChange',
              valuePropName: 'checked',
              rules: []
            })(
              <Checkbox>上传文档</Checkbox>
            )}
          </FormItem>
        </Form>
      </Modal>
      <KeyInfoModal visible={/addKeyInfo/.test(showModals)} keyInfo={keyInfo} />
    </Page>
  );
}


const DetailSetWrap = Form.create()(DetailSet);
export default connect(
  state => state.saleStageDetailSet,
  dispatch => {
    return {
      addAssign(submitData) {
        dispatch({ type: 'saleStageDetailSet/addAssign', payload: submitData });
      },
      onCancel() {
        dispatch({ type: 'saleStageDetailSet/showModal', payload: '' });
      },
      showModal(type) {
        dispatch({ type: 'saleStageDetailSet/showModal', payload: type });
        if (type === 'addKeyInfo') { //查询关联商机字段信息
          dispatch({ type: 'saleStageDetailSet/querysalesstageinfofields', payload: {}});
        }
      },

      delAssign(item) {
        dispatch({ type: 'saleStageDetailSet/delAssign', payload: item });
      },
      updateAssign(item) {
        dispatch({ type: 'saleStageDetailSet/updateAssign', payload: item });
      },
      customFormSelectHandler(relEntityId) {
        dispatch({ type: 'saleStageDetailSet/customFormSelect', payload: relEntityId });
      },
      delKeyInfo(delfield) {
        dispatch({ type: 'saleStageDetailSet/delKeyInfo', payload: delfield });
      }
    }
  }
)(DetailSetWrap);
