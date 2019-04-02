import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Select, Button, Table, Modal, message } from 'antd';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './Knowledge.less';
import UploadButton from './UploadButton';
import { formatFileSize } from '../../utils';
import { downloadFile } from '../../utils/ukUtil';

const Option = Select.Option;
const Column = Table.Column;

function UserList({
  folder,
  queries,
  total,
  list,
  currentItems,
  search,
  onUpload,
  onDownload,
  del,
  selectItems,
  checkFunc
}) {
  const currentFolder = _.find(folder, ['folderid', queries.folderId]);
  return (
    <div className={styles.rightContent}>
      <div className={styles.subtitle}>{currentFolder && currentFolder.foldername}</div>
      <Toolbar
        selectedCount={currentItems.length}
        actions={[
          { label: '删除', handler: del, show: checkFunc('FileDelete') }
        ]}
      >
        {
          checkFunc('FileUpload') &&
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
              .csv,text/html,text/plain`
            }>
            上传文档
         </UploadButton>
        }

        <Toolbar.Right>
          <Search
            value={queries.searchkey}
            onSearch={search.bind(null, 'searchkey')}
            placeholder="请输入文档名称"
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="documentid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentItems.map(item => item.documentid),
          onChange: (keys, items) => { selectItems(items); }
        }}
        pagination={{
          total,
          current: +queries.pageIndex,
          pageSize: +queries.pageSize,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (page, size) => { search('pageSize', size); }
        }}
      >
        <Column title="文档名称" dataIndex="filename" key="filename" render={(val, record) => (
          checkFunc('FileDownload')
            ? <a onClick={onDownload.bind(null, record.documentid, record.fileid)}>{val}</a>
            : <span>{val}</span>
        )} />
        <Column title="目录" dataIndex="foldername" key="foldername" />

        <Column title="下载次数" dataIndex="downloadcount" key="downloadcount" />
        <Column title="大小" dataIndex="filelength" key="filelength" render={(val) => formatFileSize(val)} />
        <Column title="创建人" dataIndex="reccreatorname" key="reccreatorname" />
        <Column title="创建时间" dataIndex="reccreated" key="reccreated" />
        <Column
          title="操作"
          key="operation"
          render={(val, record) => (
            checkFunc('FileDownload')
              ? <a onClick={onDownload.bind(null, record.documentid, record.fileid)}>下载</a>
              : <span>下载</span>
          )}
        />
      </Table>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  return state.knowledge;
}
function mapDispatchToProps(dispatch, { location }) {
  const { pathname, query } = location;
  return {
    search: (key, value) => {
      dispatch({ type: 'knowledge/search', payload: { [key]: value } });
    },
    onUpload: ({ fileId, fileName, fileSize }) => {
      dispatch({
        type: 'knowledge/addFile',
        payload: {
          fileId,
          fileName,
          fileSize
        }
      });
    },
    onDownload: (documentId, fileid) => {
      dispatch({ type: 'knowledge/onDownload', payload: documentId });
      downloadFile(`/api/fileservice/download?fileid=${fileid}`);
    },
    del: () => {
      Modal.confirm({
        title: '确定删除选中的文档吗？',
        onOk() {
          dispatch({ type: 'knowledge/delFiles' });
        }
      });
    },
    selectItems: (items) => {
      dispatch({ type: 'knowledge/putState', payload: { currentItems: items } });
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserList);
