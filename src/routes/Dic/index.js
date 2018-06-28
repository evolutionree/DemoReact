import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message, Select, Row, Col, Modal } from 'antd';
import Page from '../../components/Page';
import DragList from '../../components/UKComponent/Data/DragList';
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
                   dicTypes, //所有字典类型
                   navList,  //字典类型的父级
                   currentActiveId, //当前选择的字典类型的父级
                   dicdata, //字典值列表
                   currentDicType, //当前字典类型
                   extConfig, //字典类型的扩展字段
                   currentEditRowIndex, //哪一行在进行编辑操作
                   handleSubmit, //新增字典值
                   changeTypeHandler //切换显示字典类型的父级
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

  function search(value) {
    dispatch({ type: 'dic/changeDicType', payload: value });
  }

  function changeCurrentEditRowIndex(editIndex) {
    dispatch({ type: 'dic/putState', payload: { currentEditRowIndex: editIndex } });
  }

  function del(rowData) {
    Modal.confirm({
      title: '确定删除该数据吗?',
      content: '',
      onOk: () => {
        dispatch({ type: 'dic/del', payload: rowData.dicid });
      },
      onCancel() {}
    });
  }

  function update(rowData) {
    let newExtConfig = {};
    if (extConfig && extConfig instanceof Object) {
      for (let key in extConfig) {
        newExtConfig[key] = window[rowData.dicid + 'extfieldRef' + key].refs.input.value;
      }
    }

    dispatch({ type: 'dic/update', payload: {
      ...rowData,
      dataval: window[rowData.dicid + 'InputRef'].refs.input.value,
      ...newExtConfig
    } });
  }


  function listSortEnd(list) {
    dispatch({ type: 'dic/orderby', payload: list });
  }

  let span = 8;
  if (extConfig && extConfig instanceof Object) {
    let extConfigLength = Object.keys(extConfig).length;
    span = 24 / (3 + extConfigLength);
  }
  const column = [
    {
      key: 'recorder',
      name: '序号',
      span: span
    },
    {
      key: 'dataval',
      name: '字典值',
      span: span,
      render: (text, rowData, rowIndex) => {
        if (currentEditRowIndex === rowIndex) {
          return (
            <Input defaultValue={text} ref={ref => window[rowData.dicid + 'InputRef'] = ref} />
          );
        } else {
          return text;
        }
      }
    }
  ];
  if (extConfig && extConfig instanceof Object) {
    for (let key in extConfig) {
        column.push({
          key: key,
          name: extConfig[key],
          span: span,
          render: (text, rowData, rowIndex) => {
            if (currentEditRowIndex === rowIndex) {
              return (
                <Input defaultValue={text} ref={ref => window[rowData.dicid + 'extfieldRef' + key] = ref} />
              );
            } else {
              return text;
            }
          }
        });
    }
  }

  column.push({
    key: 'operate',
    name: '操作',
    span: span,
    render: (text, rowData, rowIndex) => {
      return (
        <div>
          {
            currentEditRowIndex === rowIndex ? (
              <a style={{ marginRight: '10px' }} onClick={update.bind(this, rowData, rowIndex)}>保存</a>
            ) : (
              <a style={{ marginRight: '10px' }} onClick={changeCurrentEditRowIndex.bind(this, rowIndex)}>编辑</a>
            )
          }
          <a onClick={del.bind(this, rowData)}>删除</a>
        </div>
      );
    }
  })


  return (
    <Page title="字典参数" >
      <div className={styles.Header}>
        <Select
          showSearch
          style={{ width: 200, float: 'left' }}
          onChange={search}
          value={currentDicType}
        >
          {
            dicTypes instanceof Array && dicTypes.map((item, index) => {
              return <Option value={item.dictypeid} key={index}>{item.dictypename}</Option>;
            })
          }
        </Select>
        <div className={styles.formWrap}>
          <Form layout="inline" onSubmit={addParams}>
            <FormItem>
              {getFieldDecorator('dataval', {
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
      <div style={{ paddingLeft: currentActiveId ? '258px' : 0 }}>
        {
          currentActiveId ? <DragList dataSource={dicdata[currentActiveId]}
                                      column={column}
                                      onSortEnd={listSortEnd}
                                      delayDragColumn={['operate']} /> : <DragList dataSource={dicdata} column={column} onSortEnd={listSortEnd} delayDragColumn={['operate']} />
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
      handleSubmit: (submitData) => {
        dispatch({ type: 'dic/add', payload: submitData });
      },
      dispatch
    };
  }
)(DicPageWrap);
