/**
 * Created by 0291 on 2017/7/25.
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message } from 'antd';
import Page from '../../../components/Page';
import ParamsList from './component/ParamsList';
import styles from './index.less';
import classnames from 'classnames';
import { hashHistory } from 'react-router';
import IntlInput from '../../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../../components/UKComponent/Form/IntlText';
import { IntlInputRequireValidator } from '../../../utils/validator';


const FormItem = Form.Item;


let fields = [{
  key: 'stagename',
  name: '阶段名称',
  link: true,
  maxLength: 10,
  intl: true
}, {
  key: 'winrate',
  name: 'winrate'
}];

function SaleStage({
  form: {
    getFieldDecorator,
    validateFields,
    resetFields
  },
  handleSubmit,
  changeTypeHandler,
  higthGradeChangeHandler,
  paramsClickHandler,
  orderbysalesstage,
  onSwitch,
  onDel,
  onUpdate,

  btnLoading,
  businessType,
  businessTypeActiveId,
  highsetting,
  salesstage,
  checkFunc
}) {

  fields[0].link = highsetting === 1 && checkFunc('SalesstageSettingEdit');
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

  const stageOrderBy = (type, item, index) => {
    let params = noOrderSaleStage.map((stageList, i) => {
      return stageList.salesstageid;
    });
    let x, y;
    if (type === 'up') {
      x = index - 1;
      y = index;
    } else {
      x = index;
      y = index + 1;
    }
    params.splice(x, 1, ...params.splice(y, 1, params[x]));
    hasOrderSaleStage.map((item) => {
      params.push(item.salesstageid);
    });
    orderbysalesstage(params.join(','));
  }

  const noOrderSaleStage = salesstage.filter((item) => {
    return item.stagename !== '赢单' && item.stagename !== '输单';
  });


  const hasOrderSaleStage = salesstage.filter((item) => {
    return item.stagename === '赢单' || item.stagename === '输单';
  })

  return (
    <Page title="销售阶段设定" >
      <div className={styles.leftNav}>
        <ul className={styles.businessList}>
          {
            businessType.map((item, index) => {
              const cls = classnames({
                [styles.businessLiActive]: businessTypeActiveId === item.categoryid  //当前商机
              });
              return <li key={item.categoryid} className={cls} onClick={changeTypeHandler.bind(this, item.categoryid)}>{getIntlText('categoryname', item)}</li>
            })
          }
        </ul>
      </div>
      <div className={styles.rightList} style={{ width: 'calc(100% - 280px)' }}>
        <div>
          <Form layout="inline" style={{ display: checkFunc('SalesstageSettingAdd') ? 'inline-block' : 'none' }} onSubmit={addParams}>
            <FormItem>
              {getFieldDecorator('stageName_lang', {
                initialValue: '',
                validateTrigger: 'onChange',
                rules: [{
                  validator: IntlInputRequireValidator
                }]
              })(
                <IntlInput placeholder='请输入销售阶段名称' />
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
              <Button type="primary" htmlType="submit" loading={btnLoading}>添加</Button>
            </FormItem>
          </Form>
          <Checkbox
            onChange={higthGradeChangeHandler}
            checked={highsetting === 1}
            disabled={!checkFunc('SalesstageSetting')}
            className={styles.hightGradeCheck}>
            开启高级设置
          </Checkbox>
        </div>
        <ParamsList
          items={noOrderSaleStage}
          fields={fields}
          itemKey="groupId"
          onClick={(item) => { paramsClickHandler(businessTypeActiveId, item) }}
          onOrderUp={stageOrderBy.bind(this, 'up')}
          onOrderDown={stageOrderBy.bind(this, 'down')}
          onSwitch={onSwitch}
          onUpdate={onUpdate}
          onDel={onDel}
          showEdit={() => checkFunc('SalesstageSettingEdit')}
          showSwitch={() => checkFunc('SalesstageSettingDisabled')}
          showOrder={() => checkFunc('SalesstageSettingOrder')}
        />
        <ul className={styles.list}>
          {
            hasOrderSaleStage.map((item, index) => {
              return (
                <li className={styles.row} key={'add' + index}>
                  <span className={styles.order}>{noOrderSaleStage.length + index + 1}</span>
                  {
                    fields.map((field) => {
                      return (
                        <div key={field.key} className={styles.text}><span>{item[field.key]}</span></div>
                      )
                    })
                  }
                </li>
              )
            })
          }
        </ul>
      </div>
    </Page>
  );
}

const SaleStageWrap = Form.create()(SaleStage);
export default connect(
  state => state.saleStage,
  dispatch => {
    return {
      handleSubmit(params) {
        dispatch({ type: 'saleStage/addSalesStage', payload: params });
      },
      changeTypeHandler(categoryid) {
        dispatch({ type: 'saleStage/changeType', payload: categoryid });
        dispatch({ type: 'saleStage/querySalesStage', payload: {} });
      },
      higthGradeChangeHandler(e) {
        dispatch({ type: 'saleStage/higthGradeChange', payload: e.target.checked });
      },
      paramsClickHandler(businessTypeActiveId, item) {
        hashHistory.push('/salestage/detail?busintypeid=' + businessTypeActiveId + '&salesstageid=' + item.salesstageid);
      },
      orderbysalesstage(params) {
        dispatch({ type: 'saleStage/orderBySalesStage', payload: params });
      },
      onSwitch(item) {
        dispatch({ type: 'saleStage/switchSalesStage', payload: item });
      },
      onUpdate(item) {
        if (item.winrate < 1 || item.winrate > 99) {
          message.warning('盈率范围为1 - 99');
          return false;
        }
        dispatch({ type: 'saleStage/updateSalesStage', payload: item });
      },
      onDel(item) {
        dispatch({ type: 'saleStage/deleteSalesStage', payload: item });
      }
    }
  }
)(SaleStageWrap);
