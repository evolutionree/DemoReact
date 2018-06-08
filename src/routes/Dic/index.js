import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message, Select, Row, Col } from 'antd';
import Page from '../../components/Page';
import DragList from './DragList';
import styles from './index.less';
import classnames from 'classnames';


const FormItem = Form.Item;
const Option = Select.Option;

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
                   dispatch,
                   dicTypes,
                     navList,
                     currentActiveId,
                   handleSubmit,
                   changeTypeHandler,
                   dicdata,
                   currentDicType,
                   extConfig
                   }) {
  const addParams = (e) => {
    e.preventDefault();
    validateFields((err, fieldsValue) => {
      if (err) {
        return;
      } else {
        handleSubmit(fieldsValue);
        resetFields(); //清空表单数据
      }
    });
  };

  function handleChange(value) {
    dispatch({ type: 'dic/changeDicType', payload: value });
  }

  let span = 6;
  if (extConfig && extConfig instanceof Object) {
    let extConfigLength = Object.keys(extConfig).length;
    span = 24 / (3 + extConfigLength);
  }
  const column = [
    {
      key: 'dataid',
      name: '字典ID',
      span: span,
      maxLength: 10
    },
    {
      key: 'dataval',
      name: '字典值',
      span: span,
      maxLength: 10
    }
  ];
  if (extConfig && extConfig instanceof Object){
    let index = 1;
    for (let key in extConfig) {
        column.push({
          key: key,
          name: '扩展字段' + index,
          span: span,
          maxLength: 10
        });
        index ++;
    }
  }
  column.push({
    key: 'operate',
    name: '操作',
    span: span,
    maxLength: 10
  })

  console.log(column)

  return (
    <Page title="字典参数" >
      <div>
        <Select
          showSearch
          style={{ width: 200 }}
          onChange={handleChange}
          value={currentDicType}
        >
          {
            dicTypes instanceof Array && dicTypes.map((item, index) => {
              return <Option value={item.dictypeid} key={index}>{item.dictypename}</Option>;
            })
          }
        </Select>
        <div style={{ display: 'inline-block' }}>
          <Form layout="inline" onSubmit={addParams}>
            <FormItem>
              {getFieldDecorator('stageName', {
                initialValue: '',
                validateTrigger: 'onChange',
                rules: [{ required: true, message: '字典值不能为空' },
                  { pattern: new RegExp(/^.{1,10}$/), message: '请输入10个以内的字符' }]
              })(
                <Input placeholder='请输入字典值' />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit">添加</Button>
            </FormItem>
          </Form>
        </div>
      </div>
      <div className={styles.leftNav} style={{ display: currentActiveId ? 'block' : 'none' }}>
        <ul className={styles.navList}>
          {
            navList instanceof Array && navList.map((item, index) => {
              const cls = classnames({
                [styles.navListActive]: currentActiveId === item.dicid  //当前商机
              });
              return <li key={item.dicid} className={cls} onClick={changeTypeHandler.bind(this, item.dicid)}>{item.dataval}</li>;
            })
          }
        </ul>
      </div>
      <div className={styles.rightList} style={{ paddingLeft: currentActiveId ? '274px' : 0 }}>
        {
          currentActiveId ? <DragList dataSource={dicdata[currentActiveId]} column={column} /> : <DragList dataSource={dicdata} column={column} />
        }
      </div>
    </Page>
  );
}

const DicPageWrap = Form.create()(DicPage);
export default connect(
  state => state.dic,
  dispatch => {
    return {
      changeTypeHandler: (newActiveId) => {
        dispatch({ type: 'dic/changeType', payload: newActiveId });
      },
      dispatch
    };
  }
)(DicPageWrap);
