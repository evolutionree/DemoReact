import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import styles from './styles.less';

const TemplateTitle = ({ value, onChange }) => (
  <Input
    type="text"
    maxLength={200}
    placeholder="请输入提醒消息标题"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

class EntityMessageTemplate extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.string,
    onTitleChange: PropTypes.func,
    onContentChange: PropTypes.func,
    fields: PropTypes.array
  };
  static defaultProps = {
    title: '',
    content: '',
    fields: []
  };

  textarea = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  insertField = field => {
    const elem = this.textarea;
    const myValue = '{' + field.displayname + '}';
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

    this.props.onContentChange(elem.value);
  };

  render() {
    const { title, content, onTitleChange, onContentChange, fields } = this.props;
    // 实体中除头像、分组、图片、附件的其他字段
    const supportFields = fields.filter(field => [15, 20, 22, 23].indexOf(field.controltype) === -1);
    return (
      <div>
        <TemplateTitle value={title} onChange={onTitleChange} />
        <div className={styles.contentwrap}>
          <textarea
            className="ant-input"
            rows="10"
            ref={ref => this.textarea = ref}
            maxLength={1000}
            placeholder="请编写提醒消息模板。如：{商机名称}即将于{商机有效期}到期，请留意。"
            value={content}
            onChange={e => onContentChange(e.target.value)}
          />
          <ul className={styles.list}>
            {supportFields.map(field => (
              <li
                key={field.fieldname}
                onClick={this.insertField.bind(this, field)}
              >
                {field.displayname}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default EntityMessageTemplate;
