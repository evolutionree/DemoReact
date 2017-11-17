import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import styles from './RichEditorInForm.less';
import request from '../utils/request';

class RichEditorInForm extends React.Component {
  static propTypes = {
    value: React.PropTypes.object, // instance of EditorState
    onChange: React.PropTypes.func,
    loading: React.PropTypes.bool,
    token: React.PropTypes.string
  };
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onEditorStateChange = (editorState) => {
    this.props.onChange(editorState);
  };

  uploadCallback = (file) => {
    return new Promise(
      (resolve, reject) => {
        // const fd = new FormData();
        // fd.append('filename', file.name);
        // fd.append('data', file);
        // request('/api/fileservice/upload', {
        //   method: 'post',
        //   body: fd
        // }).then(result => {
        //   debugger;
        //   const imgLink = `/api/fileservice/read?fileid=${result.data}`;
        //   resolve({ data: { link: imgLink } });
        // });

        const fileObj = file; // 获取文件对象
        const FileController = '/api/fileservice/upload';
        // FormData 对象
        const form = new FormData();
        form.append('data', fileObj);
        form.append('filename', file.name);
        // XMLHttpRequest 对象
        const xhr = new XMLHttpRequest();
        xhr.open('post', FileController, true);
        xhr.setRequestHeader('Authorization', `Bearer ${this.props.token}`);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const fileId = JSON.parse(xhr.responseText).data;
            const imgLink = `/api/fileservice/read?fileid=${fileId}`;
            resolve({ data: { link: imgLink } });
          }
        };
        xhr.send(form);
      }
    );
  };

  render() {
    let editorState = this.props.value;
    if (!this.props.value) {
      editorState = EditorState.createEmpty();
    }
    return (
      <Spin spinning={this.props.loading}>
        {this.props.loading ?
          (<div className={styles.wrap}>loading...</div>) :
          <Editor
            wrapperClassName={styles.wrap}
            editorClassName={styles.editor}
            toolbarClassName={styles.toolbar}
            editorState={editorState}
            onEditorStateChange={this.onEditorStateChange}
            toolbar={{ image: { uploadCallback: this.uploadCallback } }}
          />}
      </Spin>
    );
  }
}

export default connect(state => state.app)(RichEditorInForm);
