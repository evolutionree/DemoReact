import React from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import _ from 'lodash';
import FilterConfigBoard, { ruleListToItems } from '../../components/FilterConfigBoard';
import Page from '../../components/Page';
import EntityReceiverPicker from '../../components/EntityReceiverPicker';
import EntityMessageTemplate from '../../components/EntityMessageTemplate';
import styles from './styles.less';

function ReminderDetail({
  reminderId,
  reminderName,
  reminderDetail,
  entityFields,
  ruleList,
  ruleSet,
  receivers,
  receiverRange,
  messageTemplateTitle,
  messageTemplateContent,
  putState,
  save
}) {
  function bindChange(key) {
    return val => putState({ [key]: val });
  }
  function saveData() {
    if (!validate()) return;
    const data = {
      entityid: reminderDetail.entityid,
      content: messageTemplateContent,
      contentparam: getParamFromContent(messageTemplateContent),
      receiver: receivers,
      receiverrange: receiverRange,
      reminderid: reminderId,
      ruleitems: ruleListToItems(ruleList, formattedFields, reminderDetail.entityid),
      rulename: '',
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      title: messageTemplateTitle,
      typeid: 0
    };
    save(data);
  }

  function validate() {
    if (!filterConfigBoardRef.validate()) {
      return false;
    }
    if (!receivers.length) {
      message.error('请设置提醒消息发送人');
      return false;
    }
    if (!messageTemplateTitle) {
      message.error('请设置提醒消息标题');
      return false;
    }
    const contentError = validateContent(messageTemplateContent);
    if (contentError) {
      message.error(contentError);
      return false;
    }
    return true;
  }
  function validateContent(content) {
    if (!content) {
      return '请填写提醒消息模板';
    }
    //检查内容格式
    const checkBracesNestedReg = /({[^}]*{+)|(({[^{}]*}[^{}]+)+})/;
    const checkMissingRightBraceReg = /{[^}]*$/;
    const checkMissingLeftBraceReg = /^[^{]*}/;
    if (checkBracesNestedReg.test(content)
      || checkMissingLeftBraceReg.test(content)
      || checkMissingRightBraceReg.test(content)) {
      return '提醒消息模板格式有误，请检查';
    }
    //匹配参数
    const matchBracePairsReg = /{[^}]+}/g;
    const matches = content.match(matchBracePairsReg);
    let isAllMatchExistInContentParam = true;
    if (matches) {
      matches.forEach(match => {
        const fieldLabel = match.slice(1, -1);
        const field = _.find(entityFields, item => item.displayname === fieldLabel);
        if (!field) {
          isAllMatchExistInContentParam = false;
        }
      });

      if (!isAllMatchExistInContentParam) {
        return '提醒模板存在不匹配的参数，请检查';
      }
    }
  }
  function getParamFromContent(content) {
    let result = '';
    //匹配参数
    const matchBracePairsReg = /{[^}]+}/g;
    const matches = content.match(matchBracePairsReg);
    if (matches) {
      matches.forEach(match => {
        const fieldLabel = match.slice(1, -1);
        const field = _.find(entityFields, item => item.displayname === fieldLabel);
        result += ',' + field.controltype + '@' + field.fieldname;
      });
      result = result.slice(1);
    }
    return result;
  }
  let filterConfigBoardRef;
  const formattedFields = entityFields.map(f => ({
    controlType: f.controltype,
    fieldLabel: f.displayname,
    fieldId: f.fieldid,
    recStatus: f.recstatus,
    fieldConfig: f.fieldconfig
  }));
  return (
    <Page title={'提醒设置 - ' + reminderName} goBackPath="reminder-list" showGoBack>
      <div style={{ width: '650px', position: 'relative' }}>
        <Button onClick={saveData} style={{ position: 'absolute', top: '15px', right: '20px' }}>保存</Button>
        <div className={styles.step}>
          <div className={styles.steptitle}>第一步：设置提醒数据</div>
          <FilterConfigBoard
            entityId={reminderDetail && reminderDetail.entityid}
            ref={ref => filterConfigBoardRef = ref}
            allFields={formattedFields}
            ruleList={ruleList}
            ruleSet={ruleSet}
            onRulesChange={bindChange('ruleList')}
            onRuleSetChange={bindChange('ruleSet')}
          />
        </div>
        <div className={styles.step}>
          <div className={styles.steptitle}>第二步：设置提醒消息发送人</div>
          <EntityReceiverPicker
            className={styles.stepcontent}
            fields={entityFields}
            receivers={receivers}
            receiverRange={receiverRange}
            onReceiversChange={bindChange('receivers')}
            onReceiverRangeChange={bindChange('receiverRange')}
          />
        </div>
        <div className={styles.step}>
          <div className={styles.steptitle}>第三步：设置提醒消息模板</div>
          <EntityMessageTemplate
            className={styles.stepcontent}
            fields={entityFields}
            title={messageTemplateTitle}
            content={messageTemplateContent}
            onTitleChange={bindChange('messageTemplateTitle')}
            onContentChange={bindChange('messageTemplateContent')}
          />
        </div>
      </div>
    </Page>
  );
}

export default connect(
  state => state.reminderDetail,
  dispatch => {
    return {
      putState(payload) {
        dispatch({ type: 'reminderDetail/putState', payload });
      },
      save(data) {
        dispatch({ type: 'reminderDetail/save', payload: data });
      }
    };
  }
)(ReminderDetail);
