import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message } from 'antd';
import Page from '../../components/Page';
//import ParamsList from './component/ParamsList';
import styles from './index.less';
import classnames from 'classnames';
import { hashHistory } from 'react-router';


const FormItem = Form.Item;


let fields = [{
  key: 'stagename',
  name: '阶段名称',
  link: true,
  maxLength: 10
},{
  key: 'winrate',
  name: 'winrate'
}];

function DicPage({
                     form: {
                       getFieldDecorator,
                       validateFields,
                       resetFields
                     },
                     handleSubmit,
                     changeTypeHandler,
                     navList,
                     currentActiveId
                   }) {
  const addParams = (e) => {
    e.preventDefault();
    validateFields((err, fieldsValue) => {
      if (err) {
        return;
      } else {
        resetFields(); //清空表单数据
        handleSubmit(fieldsValue);
      }
    });
  };


  return (
    <Page title="字典参数" >
      <div className={styles.leftNav}>
        <ul className={styles.businessList}>
          {
            navList.map((item, index) => {
              const cls = classnames({
                [styles.businessLiActive]: currentActiveId == item.id  //当前商机
              });
              return <li key={item.id} className={cls} onClick={changeTypeHandler.bind(this, item.id)}>{item.text}</li>;
            })
          }
        </ul>
      </div>
      <div className={styles.rightList} style={{ width: 'calc(100% - 280px)' }}>
        <div>
          <Form layout="inline" onSubmit={addParams}>
            <FormItem>
              {getFieldDecorator('stageName', {
                initialValue: '',
                validateTrigger: 'onChange',
                rules: [{ required: true, message: '销售阶段名称不能为空' },
                  { pattern: new RegExp(/^.{1,10}$/), message: '请输入10个以内的字符' }]
              })(
                <Input placeholder='请输入销售阶段名称' />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('winRate', {
                initialValue: '',
                validateTrigger: 'onChange',
                rules: [{ required: true, message: '赢率不能为空' },
                  { pattern: new RegExp(/^[1-9][0-9]{0,1}$/), message: '请输入1-99的整数' }]
              })(
                <Input placeholder='请输入赢率' style={{ width: 130 }} />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit">添加</Button>
            </FormItem>
          </Form>
        </div>
        {/*<ParamsList*/}
          {/*items={noOrderSaleStage}*/}
          {/*fields={fields}*/}
          {/*itemKey="groupId"*/}
          {/*onClick={(item) => { paramsClickHandler(currentActiveId, item) }}*/}
          {/*onOrderUp={stageOrderBy.bind(this, 'up')}*/}
          {/*onOrderDown={stageOrderBy.bind(this, 'down')}*/}
          {/*onSwitch={onSwitch}*/}
          {/*onUpdate={onUpdate}*/}
          {/*onDel={onDel}*/}
          {/*showEdit={() => checkFunc('SalesstageSettingEdit')}*/}
          {/*showSwitch={() => checkFunc('SalesstageSettingDisabled')}*/}
          {/*showOrder={() => checkFunc('SalesstageSettingOrder')}*/}
        {/*/>*/}
      </div>
    </Page>
  );
}

const DicPageWrap = Form.create()(DicPage);
export default connect(
  state => state.dic,
  dispatch => {
    return {
      changeTypeHandler: () => {

      }
    };
  }
)(DicPageWrap);
