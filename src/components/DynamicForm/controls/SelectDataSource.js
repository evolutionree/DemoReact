import React, { PropTypes } from 'react';
import { hashHistory } from 'react-router';
import { Icon, message, Select } from 'antd';
import { is } from 'immutable';
import classnames from 'classnames';
import DataSourceSelectModal from './DataSourceSelectModal';
import styles from './SelectUser.less';
import { checkHasPermission } from '../../../services/entcomm';
import { queryDataSourceData } from '../../../services/datasource';
import _ from 'lodash';
import { getIntlText } from '../../UKComponent/Form/IntlText';

const Option = Select.Option;

class SelectDataSource extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // JSON格式, { id, name }
    // value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    dataSource: PropTypes.shape({
      sourceId: PropTypes.string,
      type: PropTypes.string
    }),
    designateDataSource: PropTypes.object,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    dataRange: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      options: [],
      refEntity: '',
      refEntityName: '',
      searchKey: ''
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  setValue = val => {
    if (!val || !Array.isArray(val)) {
      this.props.onChange('', true);
      return;
    }
    const name = val.map(item => item.name).join(',');
    const id = val.map(item => item.id).join(',');
    const _val = id ? JSON.stringify({ name, id }) : '';
    this.props.onChange(_val, true);
  };

  handleOk = (arrIdName) => {
    this.hideModal();
    const id = arrIdName.map(obj => obj.id).join(',');
    const name = arrIdName.map(obj => obj.name).join(',');
    const updateValue = id ? JSON.stringify({ id, name }) : '';
    this.props.onChange(updateValue);
    this.changeWithName(id, name);
  };

  showModal = () => {
    if (this.props.isReadOnly === 1) return;
    if (this.props.onFocus) {
      this.props.onFocus();
    }
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  parseValue = () => {
    const { value } = this.props;
    if (!value) return { text: '', array: [] };
    try {
      const { id, name } = typeof value === 'string' ? JSON.parse(value) : value;
      const arrIdName = [];
      if (id) {
        const arrId = id.split(',');
        const arrName = name.split(',');
        arrId.forEach((item, index) => {
          arrIdName.push({
            id: item,
            name: arrName[index]
          });
        });
      }
      return {
        text: name,
        array: arrIdName
      };
    } catch (e) {
      console.error(e);
      return { text: '', array: [] };
    }
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  selectChange = (options, value) => {
    const selectData = options instanceof Array && options.filter(item => value && value.indexOf(item.id) > -1);
    const id = selectData.map(obj => obj.id).join(',');
    const name = selectData.map(obj => obj.name).join(',');
    const updateValue = id ? JSON.stringify({ id, name }) : '';
    this.props.onChange(updateValue);
    this.changeWithName(id, name);
    this.setState({
      searchKey: ''
    });
  }

  changeWithName = (id, name) => {
    if (this.props.onChangeWithName) {
      this.props.onChangeWithName({
        value: id,
        value_name: name
      });
    }
  }

  queryOptions = (searchKey) => {
    this.setState({ loading: true, searchKey });
    const params = {
      sourceId: this.props.dataSource && this.props.dataSource.sourceId,
      keyword: searchKey,
      pageSize: 10,
      pageIndex: 1,
      queryData: []
    };
    const { designateDataSource } = this.props;
    if (designateDataSource && typeof designateDataSource === 'object') {
      Object.keys(designateDataSource).forEach(key => {
        params.queryData.push({
          [key]: designateDataSource[key],
          islike: 0
        });
      });
    }
    queryDataSourceData(params).then(result => {
      let options = result.data.page;
      const { text, array } = this.parseValue();
      options = _.uniqBy(_.concat(array, options), 'id');
      this.setState({ loading: false, options });
    }, err => {
      this.setState({ loading: false });
      console.error(err.message || '加载数据失败');
    });
  }

  render() {
    let { options, searchKey } = this.state;
    const isReadOnly = this.props.isReadOnly === 1;
    const { text, array } = this.parseValue();
    const value = array.map(item => item.id);
    options = _.uniqBy(_.concat(array, options), 'id');

    if (searchKey === '' && array.length) {
      options = options.filter(item => {
        return value.indexOf(item.id) > -1;
      });
    } else if (searchKey === '' && !array.length) {
      options = [];
    }

    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: isReadOnly
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && text !== undefined && this.props.isReadOnly !== 1
    }]);

    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div className={styles.inputSelectWrap}>
          <Select onChange={this.selectChange.bind(this, options)}
            onSearch={this.queryOptions}
            placeholder={this.props.placeholder}
            disabled={isReadOnly}
            mode={this.props.multiple === 1 ? 'multiple' : null}
            value={value}
            allowClear
            showSearch
          >
            {
              options instanceof Array && options.map(item => {
                return <Option key={item.id}>{item.name}</Option>;
              })
            }
          </Select>
          <div className={classnames(styles.openModal, { [styles.openModalDisabled]: isReadOnly })} onClick={this.showModal}>
            <Icon type="plus-square" />
          </div>
        </div>
        <DataSourceSelectModal
          visible={this.state.modalVisible}
          designateDataSource={this.props.designateDataSource}
          selected={array}
          allowadd={this.props.allowadd}
          sourceId={this.props.dataSource && this.props.dataSource.sourceId}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
        />
      </div>
    );
  }
}

SelectDataSource.View = ({ value, value_name, dataSource }) => {
  const dataSourceRelEntityId = dataSource && dataSource.entityId;
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  if (!dataSourceRelEntityId) { // 没有数据源关联实体id entityid，以普通文本显示
    const text = value_name !== undefined ? value_name : value;
    return <div className={styles.dataSourceViewWrap}>{text ? (text + '') : emptyText}</div>;
  }

  if (!value || !value_name) return <div className={styles.dataSourceViewWrap}>{emptyText}</div>;
  const linkUrl = `#/entcomm/${dataSourceRelEntityId}/${value.id}`;

  function redirect() {
    checkHasPermission({
      entityid: dataSourceRelEntityId,
      recid: value.id
    }).then(result => {
      if (result.data === '0') {
        message.error('您没有权限查看该数据');
      } else if (result.data === '2') {
        message.error('该数据已删除，无法查看');
      } else {
        window.open(linkUrl, '_blank');
        // hashHistory.push(linkUrl);
      }
    }, err => {
      message.error('获取超时，请检查网络!');
    });
  }

  return (
    <div className={styles.dataSourceViewWrap}>
      <a href="javascript:;" onClick={redirect}>{value_name}</a>
    </div>
  );
};

export default SelectDataSource;
