import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Spin, message } from 'antd';
import Page from '../../components/Page';
import ParamsBoard from '../../components/ParamsBoard/ParamsBoard';
import { queryDicTypes, saveDicType, delDicType } from '../../services/dictionary';

class DicPage extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dicTypes: []
    };
  }

  componentDidMount() {
    this.fetchDicTypes();
  }

  onCreate = data => {
    const params = {
      dictypename: data.dictypename
    };
    this.showLoading();
    saveDicType(params).then(result => {
      this.hideLoading();
      this.fetchDicTypes();
    }, err => {
      this.hideLoading();
      message.error(err.message || '保存失败');
    });
  };

  onUpdate = data => {
    const params = {
      dictypeid: data.dictypeid,
      dictypename: data.dictypename
    };
    this.showLoading();
    saveDicType(params).then(result => {
      this.hideLoading();
      this.fetchDicTypes();
    }, err => {
      this.hideLoading();
      message.error(err.message || '保存失败');
    });
  };

  onDel = data => {
    this.showLoading();
    delDicType(data.dictypeid).then(result => {
      this.hideLoading();
      this.fetchDicTypes();
    }, err => {
      this.hideLoading();
      message.error(err.message || '删除失败');
    });
  };

  showLoading = () => {
    this.setState({ loading: true });
  };

  hideLoading = () => {
    this.setState({ loading: false });
  };

  fetchDicTypes = () => {
    this.showLoading();
    queryDicTypes().then(result => {
      this.hideLoading();
      this.setState({ dicTypes: result.data.fielddictype });
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };

  render() {
    const fields = [{
      key: 'dictypename',
      name: '字典名称'
    }];
    return (
      <Spin spinning={this.state.loading}>
        <Page title="字典分类">
          <ParamsBoard
            items={this.state.dicTypes}
            fields={fields}
            itemKey="groupId"
            onCreate={this.onCreate}
            onUpdate={this.onUpdate}
            onDel={this.onDel}
            showAdd={this.props.checkFunc('DictionaryTypeAdd')}
            showEdit={() => this.props.checkFunc('DictionaryTypeEdit')}
            showDel={() => this.props.checkFunc('DictionaryTypeDelete')}
          />
        </Page>
      </Spin>
    );
  }
}

export default DicPage;
