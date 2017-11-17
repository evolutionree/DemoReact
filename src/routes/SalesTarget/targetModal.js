/**
 * Created by 0291 on 2017/8/8.
 */
import React from 'react';
import { Modal, Col, Row, Icon, message, Form, Input, InputNumber, Select } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './salesTarget.less';
import DataGrid from './component/DataGrid.jsx';
import HeaderModel from './component/HeaderModel';

const FormItem = Form.Item;
const Option = Select.Option;

function Target({
                      visible,
                      onCancel,
                      isgroup,
                      targetData,
                      targetDataVisible,
                  form: {
                    getFieldDecorator,
                    validateFields,
                    resetFields
                  },
                  datacursor,
                  targetDataChangeHandler,
                  changeNormtypeid,
                  handleOk
                    }) {
  const changeTargetValue = (quarterIndex, rowIndex, value) => {
    const mouthIndex = ((quarterIndex - 1) * 3) + (rowIndex + 1);
    targetData[mouthTargetField[mouthIndex - 1]] = value;
    targetData[mouthTargetField[mouthIndex - 1]] = targetData[mouthTargetField[mouthIndex - 1]] ? targetData[mouthTargetField[mouthIndex - 1]] : 0;
      let yearsum = 0;
    for (let i = 0; i < 12; i++) {
      yearsum += targetData[mouthTargetField[i]] * 1;
    }
    targetData.yearsum = (yearsum * 1).toFixed(4);
    targetDataChangeHandler(targetData);
  };

  const blurTargetValue = (quarterIndex, rowIndex, value) => {
    const mouthIndex = ((quarterIndex - 1) * 3) + (rowIndex + 1);
    targetData[mouthTargetField[mouthIndex - 1]] = (targetData[mouthTargetField[mouthIndex - 1]] * 1).toFixed(4);
    targetDataChangeHandler(targetData);
  };

  const mouthTargetField = ['jancount', 'febcount', 'marcount', 'aprcount', 'maycount', 'juncount', 'julcount', 'augcount', 'sepcount', 'octcount', 'novcount', 'deccount'];

  let totalDataSource = [];
  let dataSource = [];
  for (let i = 1; i < 13; i++) {
    const item = isgroup === 1 ? {
      mouth: targetData.year + '-' + i,
      number: targetData[mouthTargetField[i - 1]],
      targetSum: targetData[mouthTargetField[i - 1] + '_sum']
    } : {
      mouth: targetData.year + '-' + i,
      number: targetData[mouthTargetField[i - 1]]
    }
    dataSource.push(item);
    if (i % 3 === 0) {
      totalDataSource.push(dataSource);
      dataSource = [];
    }
  }


  const nameArray = ['第一季度', '第二季度', '第三季度', '第四季度'];
  let columns = [];
  for (let i = 1; i < 5; i++) {
    let quarterYearTarget = 0;
    for (let j = 0; j < 3; j++) {
      quarterYearTarget += (targetData[mouthTargetField[((i - 1) * 3) + j]] * 1);
    }
    quarterYearTarget = (quarterYearTarget * 1).toFixed(4);

    const item = isgroup === 1 ? [
      new HeaderModel(nameArray[i - 1], 'mouth'),
      new HeaderModel(<InputNumber style={{ width: 140 }} disabled={true} value={quarterYearTarget} />, 'number', (text, recored, index) => {
        return <InputNumber style={{ width: 140 }} max={9999999999999} min={0} disabled={targetDataVisible[((i - 1) * 3) + index].value === 'true' ? false : true} value={text} onChange={changeTargetValue.bind(this, i, index)} onBlur={blurTargetValue.bind(this, i, index)} />;
      }),
      new HeaderModel('已分配目标合计', 'targetSum', (text, recored, index) => {
        return <InputNumber style={{ width: 140 }} value={text} disabled={true} />;
      })
    ] : [
      new HeaderModel(nameArray[i - 1], 'mouth'),
      new HeaderModel(<InputNumber style={{ width: 140 }} disabled={true} value={quarterYearTarget} />, 'number', (text, recored, index) => {
        return <InputNumber style={{ width: 140 }} max={9999999999999} min={0} disabled={targetDataVisible[((i - 1) * 3) + index].value === 'true' ? false : true} value={text} onChange={changeTargetValue.bind(this, i, index)} onBlur={blurTargetValue.bind(this, i, index)} />;
      })
    ]

    columns.push(item);
  }


  let renderHtml = [];
  for ( let i = 0; i < columns.length; i++) {
    renderHtml.push(
      <div style={{ width: isgroup === 1 ? 450 : 350, display: 'inline-block', margin: '0px 10px 20px 0' }} key={i + 'grid'}>
        <DataGrid
          columns={columns[i]}
          dataSource={totalDataSource[i]}
          pagination={false}
          rowSelection={false}
          rowKey='mouth'
        />
      </div>
    )
  }

  const formItemLayout = {

  };

  return (
    <Modal
      title="编辑目标"
      width={isgroup === 1 ? 990 : 790}
      visible={visible}
      onOk={handleOk.bind(this, targetData)}
      onCancel={onCancel}
      wrapClassName={styles.targetModal}
    >
      <div>
        <Form layout="inline">
          <Row>
            <Col span={12}>
              <FormItem
                label="名称"
                {...formItemLayout}
              >
                {getFieldDecorator('recname', {
                  initialValue: ''
                })(
                  <Input disabled={true} />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="销售指标"
                {...formItemLayout}
              >
                {getFieldDecorator('normtypeid', {
                  initialValue: '',
                })(
                  <Select onChange={changeNormtypeid.bind(this, targetData)}>
                    {
                      datacursor.map((item) => {
                        return <Option key={item.normtypeid} value={item.normtypeid}>{item.normtypename}</Option>;
                      })
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={`${targetData.year}年度目标`}
                {...formItemLayout}
              >
                {getFieldDecorator('yeartarget', {
                  initialValue: ''
                })(
                  <Input disabled={true} />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="各月份分配目标合计"
              >
                {getFieldDecorator('yearsum', {
                  initialValue: ''
                })(
                  <Input disabled={true} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <div style={{ padding: '10px 0 6px 14px', textAlign: 'left', fontSize: '14px', color: '#999999' }}>注：表格中所有金额单位为：万元；数量单位为：个</div>
      {
        renderHtml
      }
    </Modal>
  )
}


const TargetModal = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  }
})(Target);

export default connect(
  state => {
    const { showModals, targetData, params, datacursor, targetDataVisible } = state.salesTarget;
    return {
      visible: /target/.test(showModals),
      targetData: {
        ...targetData,
        year: params.year
      },
      value: { ...targetData },
      datacursor,
      targetDataVisible
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'salesTarget/showModal', payload: '' });
      },
      handleOk(submitData) {
        dispatch({ type: 'salesTarget/savetarget', payload: submitData });
      },
      targetDataChangeHandler(targetData) {
        dispatch({ type: 'salesTarget/targetDataChange', payload: targetData });
      },
      changeNormtypeid(targetData, value) {
        Modal.confirm({
          content: '切换“销售指标”后,当前填充的数据将会被清空,确定继续吗?',
          onOk() {
            dispatch({ type: 'salesTarget/normtypeidChange', payload: value });
          },
          onCancel() {
            dispatch({ type: 'salesTarget/targetDataChange', payload: targetData });
          }
        });
      }
    };
  }
)(TargetModal);
