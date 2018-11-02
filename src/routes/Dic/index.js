import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Select, Modal } from 'antd';
import Page from '../../components/Page';
import DragList from '../../components/UKComponent/Data/DragList';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import IntlText from '../../components/UKComponent/Form/IntlText';
import { IntlInputRequireValidator } from '../../utils/validator';
import FormModal from './FormModal';
import styles from './index.less';
import classnames from 'classnames';

const FormItem = Form.Item;

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

  function edit(editIndex, editData) {
    dispatch({ type: 'dic/putState', payload: { showModals: 'edit', editData: editData } });
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

  function listSortEnd(list) {
    dispatch({ type: 'dic/orderby', payload: list });
  }

  let span = 8;
  if (extConfig && extConfig instanceof Object) {
    let extConfigLength = Object.keys(extConfig).length;
    span = parseInt(24 / (3 + extConfigLength));
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
      delayDrag: true,
      span: span,
      render: (text, rowData, rowIndex) => {
        return <IntlText value={text} value_lang={rowData.dataval_lang} />;
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
            return text;
          }
        });
    }
  }

  column.push({
    key: 'operate',
    name: '操作',
    span: span,
    delayDrag: true,
    render: (text, rowData, rowIndex) => {
      return (
        <div>
          <a style={{ marginRight: '10px' }} onClick={edit.bind(this, rowIndex, rowData)}>编辑</a>
          <a onClick={del.bind(this, rowData)}>删除</a>
        </div>
      );
    }
  })


  return (
    <Page title='字典参数' >
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
              {getFieldDecorator('dataval_lang', {
                initialValue: '',
                validateTrigger: 'onChange',
                rules: [
                  { required: true, message: '字典值不能为空' },
                  { validator: IntlInputRequireValidator }
                ]
              })(
                <IntlInput placeholder='请输入字典值' maxLength="30" className={styles.intlInput} />
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
      <FormModal />
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
