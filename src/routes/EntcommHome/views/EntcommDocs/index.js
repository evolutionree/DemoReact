import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Select, Button, Icon, Table, Modal, Tag } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import UploadButton from './UploadButton';
import styles from './styles.less';
import { formatFileSize } from '../../../../utils';

const Column = Table.Column;

function EntcommDocs({
  checkFunc,
  docTypes,
  currentDocType,
  list,
  currentItems,
  selectItems,
  selectDocType,
  onUpload,
  download,
  delDoc
}) {
  const getLabel = folderId => {
    const match = _.find(docTypes, ['value', folderId]);
    return match ? match.label : '';
  };
  return (
    <div>
      <Toolbar
        selectedCount={currentItems.length}
        actions={[
          { label: '下载', handler: download, single: true },
          { label: '删除', handler: delDoc, single: true, show: checkFunc('DocumentDelete') }
        ]}
      >
        <Select value={currentDocType} onChange={selectDocType} style={{ minWidth: '120px' }}>
          {docTypes.map(t => (
            <Select.Option key={t.value}>{t.label}</Select.Option>
          ))}
        </Select>
        {
          checkFunc('DocumentUpload') &&
          <UploadButton
            onUpload={onUpload}
            accept={
              `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
              .doc,.docx,application/pdf,
              application/vnd.ms-works,
              application/msword,
              application/xml-dtd,
              application/vnd.ms-excel,
              application/vnd.ms-powerpoint,
              .csv,text/html,text/plain,
              image/*`
            }>
            上传文档
         </UploadButton>
        }
      </Toolbar>
      <Table
        rowKey="documentid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentItems.map(item => item.documentid),
          onChange: (keys, items) => { selectItems(items); }
        }}
      >
        <Column
          title="全选"
          key="custom"
          render={(text, record) => (
            <div className={styles.item}>
              <div className={styles.rowone}>
                <span className={styles.title}>{record.filename}</span>
                <Tag className={styles.tag} onClick={() => { selectDocType(record.folderid); }}>{getLabel(record.folderid)}</Tag>
              </div>
              <div className={styles.rowtwo}>
                <span style={{ width: '180px' }}>上传人：{record.reccreatorname}</span>
                <span style={{ width: '200px' }}>上传时间：{record.reccreated}</span>
                <span style={{ width: '140px' }}>文件大小：{formatFileSize(record.filelength)}</span>
                <span style={{ width: '140px' }}>下载次数：{record.downloadcount}</span>
              </div>
            </div>
          )}
        />
      </Table>
    </div>
  );
}

export default connect(
  state => state.entcommDocs,
  dispatch => {
    return {
      selectItems(items) {
        dispatch({ type: 'entcommDocs/putState', payload: { currentItems: items } });
      },
      selectDocType(docType) {
        dispatch({ type: 'entcommDocs/putState', payload: { currentDocType: docType } });
        dispatch({ type: 'entcommDocs/fetchList' });
      },
      onUpload({ fileId, fileName, fileSize }) {
        dispatch({
          type: 'entcommDocs/addDoc',
          payload: { fileId, fileName, fileSize }
        });
      },
      download() {
        dispatch({ type: 'entcommDocs/download' });
      },
      delDoc() {
        Modal.confirm({
          title: '确定删除选中的文档吗？',
          onOk() {
            dispatch({ type: 'entcommDocs/delDoc' });
          }
        });
      }
    }
  }
)(EntcommDocs);
