import React from 'react';
import { Input, Button } from 'antd';
import styles from './Search.less';

class Search extends React.Component {
  static propTypes = {
    placeholder: React.PropTypes.string,
    maxLength: React.PropTypes.number,
    width: React.PropTypes.string,
    onSearch: React.PropTypes.func,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    mode: React.PropTypes.oneOf(['button', 'icon'])
  };
  static defaultProps = {
    maxLength: 200,
    mode: 'button'
  };

  constructor(props) {
    super(props);
    this.state = {
      innerVal: props.value || ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const value = nextProps.value;
    this.setState({ innerVal: value ? value : '' });
  }

  handleSearch = () => {
    const { onSearch } = this.props;
    if (onSearch) onSearch(this.state.innerVal);
  };

  handleInput = (evt) => {
    this.setState({ innerVal: evt.target.value });
    this.props.onChange && this.props.onChange(evt.target.value);
  };

  handleInputKeyDown = (evt) => {
    const ENTER = 13;
    if (evt.keyCode === ENTER) {
      this.handleSearch();
    }
  };

  render() {
    const { placeholder, maxLength, width, label, mode, style } = this.props;
    return mode === 'button' ? (
      <div className={styles.search} style={width ? { width, ...style } : { ...style }}>
        <Input value={this.state.innerVal}
               onChange={this.handleInput}
               onKeyDown={this.handleInputKeyDown}
               maxLength={maxLength && maxLength + ''}
               placeholder={placeholder} />
        <Button onClick={this.handleSearch}>
          {label || '搜索'}
        </Button>
      </div>
    ) : (
      <div style={{ display: 'inline-block', verticalAlign: 'middle', width: width || '160px', ...style }}>
        <Input.Search
          value={this.state.innerVal}
          onChange={this.handleInput}
          maxLength={maxLength && maxLength + ''}
          placeholder={placeholder}
          onSearch={this.handleSearch}
        />
      </div>
    );
  }
}

export default Search;
