/**
 * Created by 0291 on 2018/5/22.
 */
import React, { PropTypes, Component } from 'react';
import styles from './TextAreaTemplate.less';

class TextAreaTemplate extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    fields: PropTypes.array
  };
  static defaultProps = {
    fields: []
  };

  textarea = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  insertField = field => {
    const elem = this.textarea;
    const myValue = '{' + field + '}';
    if (document.selection) {
      elem.focus();
      const sel = document.selection.createRange();
      sel.text = myValue;
      elem.focus();
    } else if (elem.selectionStart || elem.selectionStart == '0') {
      const startPos = elem.selectionStart;
      const endPos = elem.selectionEnd;
      const scrollTop = elem.scrollTop;
      elem.value = elem.value.substring(0, startPos) + myValue + elem.value.substring(endPos, elem.value.length);
      elem.focus();
      elem.selectionStart = startPos + myValue.length;
      elem.selectionEnd = startPos + myValue.length;
      elem.scrollTop = scrollTop;
    } else {
      elem.value += myValue;
      elem.focus();
    }

    this.props.onChange(elem.value);
  };

  render() {
    const { value, onChange, fields } = this.props;
    // 实体中除头像、分组、图片、附件的其他字段
    return (
      <div>
        <div className={styles.contentwrap}>
          <textarea
            className="ant-input"
            rows="10"
            ref={ref => this.textarea = ref}
            maxLength={1000}
            placeholder={this.props.placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <ul className={styles.list}>
            {fields.map((field, index) => (
              <li
                key={index}
                onClick={this.insertField.bind(this, field)}
              >
                {field}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default TextAreaTemplate;
