/**
 * Created by 0291 on 2018/5/11.
 */
import React from 'react';
import { Table, Checkbox, Icon } from 'antd';
import Styles from './ConfigTable.less';

function ConfigTable({
                             list = [],
                       columns = [],
                       addRow = true,
                        title,
  rowKey = 'key',
                       add
                           }) {

  let tableData = list.map((item, index) => {
    return {
      ...item,
      key: index
    };
  });

  return (
    <div>
      {
        title && (
          <div className={Styles.title}>
            {
              title
            }
          </div>
        )
      }
      <Table
        bordered
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey={rowKey}
        // rowKey={(record) => (record.fieldid + record.typeid)}
      />
      <div className={Styles.addRow} style={{ display: addRow ? 'block' : 'none' }} onClick={() => add && add()} >
        <Icon type="plus-circle-o" style={{ fontSize: 24, color: '#a8a8a8', cursor: 'pointer' }} title="点击添加一行" />
      </div>
    </div>
  );
}

export default ConfigTable;
