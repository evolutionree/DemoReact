import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Spin, message, Select } from 'antd';
import Page from '../../components/Page';
import ParamsBoard from '../../components/ParamsBoard/ParamsBoard';
import { queryDicTypes, queryDicOptions, saveDicOption, delDicOption, orderDicOptions } from '../../services/dictionary';

const Option = Select.Option;

class DicPage extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dicTypes: [],
      selectedDicType: '',
      dicOptions: []
    };
  }

  componentDidMount() {
    this.fetchDicTypes();
  }

  onCreate = data => {
    const params = {
      datavalue: data.dataval,
      dictypeid: +this.state.selectedDicType,
      dicid: ''
    };
    this.showLoading();
    saveDicOption(params).then(result => {
      this.hideLoading();
      this.fetchDicOptions(this.state.selectedDicType);
    }, err => {
      this.hideLoading();
      message.error(err.message || '保存失败');
    });
  };

  onUpdate = data => {
    const params = {
      dictypeid: +this.state.selectedDicType,
      datavalue: data.dataval,
      dicid: data.dicid
    };
    this.showLoading();
    saveDicOption(params).then(result => {
      this.hideLoading();
      this.fetchDicOptions(this.state.selectedDicType);
    }, err => {
      this.hideLoading();
      message.error(err.message || '保存失败');
    });
  };

  onDel = data => {
    this.showLoading();
    delDicOption(data.dicid).then(result => {
      this.hideLoading();
      this.fetchDicOptions(this.state.selectedDicType);
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };
  onOrderDown = (data, index) => {
    const params = this.state.dicOptions.map((item, i) => {
      return item;
    });
    let x,
      y;
    x = index;
    y = index + 1;
    params.splice(x, 1, ...params.splice(y, 1, params[x]));
    this.showLoading();
    orderDicOptions(params).then(result => {
      this.hideLoading();
      this.fetchDicOptions(this.state.selectedDicType);
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };
  onOrderUp = (data, index) => {
    const params = this.state.dicOptions.map((item, i) => {
      return item;
    });
    let x,
      y;
    x = index - 1;
    y = index;
    params.splice(x, 1, ...params.splice(y, 1, params[x]));
    this.showLoading();
    orderDicOptions(params).then(result => {
      this.hideLoading();
      this.fetchDicOptions(this.state.selectedDicType);
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };

  onDicTypeChange = val => {
    this.setState({ selectedDicType: val });
    this.fetchDicOptions(val);
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
      this.setState({
        dicTypes: result.data.fielddictype.map(item => ({
          id: item.dictypeid + '',
          name: item.dictypename
        }))
      });
      this.onDicTypeChange(result.data.fielddictype[0].dictypeid + '');
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };

  fetchDicOptions = (dictypeid) => {
    this.showLoading();
    queryDicOptions(dictypeid).then(result => {
      this.hideLoading();
      this.setState({ dicOptions: result.data.fielddictypevalue });
    }, err => {
      this.hideLoading();
      message.error(err.message || '获取字典失败');
    });
  };

  render() {
    const fields = [{
      key: 'dataval',
      name: '字典参数'
    }];
    return (
      <Spin spinning={this.state.loading}>
        <Page title="字典参数">
          <ParamsBoard
            toolbarNode={(
              <Select value={this.state.selectedDicType} onChange={this.onDicTypeChange} style={{ minWidth: '120px' }}>
                {this.state.dicTypes.map(t => (
                  <Option value={t.id} key={t.id}>{t.name}</Option>
                ))}
              </Select>
            )}
            items={this.state.dicOptions}
            fields={fields}
            itemKey="groupId"
            onCreate={this.onCreate}
            onUpdate={this.onUpdate}
            onDel={this.onDel}
            onOrderDown={this.onOrderDown}
            onOrderUp={this.onOrderUp}
            showAdd={this.props.checkFunc('DictionaryParamAdd')}
            showEdit={() => this.props.checkFunc('DictionaryParamEdit')}
            showDel={() => this.props.checkFunc('DictionaryParamDelete')}
            showOrder={() => this.props.checkFunc('DictionaryParamOrderBy')}
          />
        </Page>
      </Spin>
    );
  }
}

export default DicPage;
