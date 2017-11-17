import React from 'react';
import { connect } from 'dva';
import { Button, Radio, message } from 'antd';
import * as _ from 'lodash';
import FilterConfigBoard, { ruleListToItems } from '../../components/FilterConfigBoard';
import Page from '../../components/Page';
import EntityReceiverPicker from '../../components/EntityReceiverPicker';
import EntityMessageTemplate from '../../components/EntityMessageTemplate';
import DynamicFieldUpdater from '../../components/DynamicForm/DynamicFieldUpdater';
import styles from './styles.less';

function ReminderDetail({
  collectorId,
  collectorName,
  collectorDetail,
  entityFields,
  ruleList,
  ruleSet,
  receivers,
  receiverRange,
  messageTemplateTitle,
  messageTemplateContent,
  updateFields,
  shouldSendMessage,
  putState,
  save
}) {
  function bindChange(key) {
    return val => putState({ [key]: val });
  }
  function fixUpdateFields(upFields, allFields) {
    return (upFields || []).map(field => {
      const match = _.find(allFields, ['fieldid', field.fieldid]);
      if (!match) return field;
      if (match.controltype === 18 && field.fieldvalue && typeof field.fieldvalue !== 'string') {
        return { ...field, fieldvalue: JSON.stringify(field.fieldvalue) };
      }
      return field;
    });
  }
  function saveData() {
    if (!validate()) return;
    const data = {
      entityid: collectorDetail.entityid,
      content: shouldSendMessage ? messageTemplateContent : '',
      contentparam: shouldSendMessage ? getParamFromContent(messageTemplateContent) : '',
      receiver: shouldSendMessage ? receivers : [],
      receiverrange: receiverRange,
      reminderid: collectorId,
      ruleitems: ruleListToItems(ruleList, formattedFields, collectorDetail.entityid),
      rulename: '',
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      title: shouldSendMessage ? messageTemplateTitle : '',
      updatefield: updateFields,
      typeid: 1
    };

    data.updatefield = fixUpdateFields(data.updatefield, entityFields);

    save(data);
  }

  function validate() {
    if (!filterConfigBoardRef.validate()) {
      return false;
    }
    if (shouldSendMessage && !receivers.length) {
      message.error('请设置提醒消息发送人');
      return false;
    }
    if (shouldSendMessage && !messageTemplateTitle) {
      message.error('请设置提醒消息标题');
      return false;
    }
    const contentError = shouldSendMessage && validateContent(messageTemplateContent);
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
    <Page title={'回收规则 - ' + collectorName} goBackPath="collector-list" showGoBack>
      <div style={{ width: '650px', position: 'relative' }}>
        <Button onClick={saveData} style={{ position: 'absolute', top: '15px', right: '20px' }}>保存</Button>
        <div className={styles.step}>
          <div className={styles.steptitle}>设置回收数据</div>
          <FilterConfigBoard
            entityId={collectorDetail && collectorDetail.entityid}
            ref={ref => filterConfigBoardRef = ref}
            allFields={formattedFields}
            ruleList={ruleList}
            ruleSet={ruleSet}
            onRulesChange={bindChange('ruleList')}
            onRuleSetChange={bindChange('ruleSet')}
          />
          <div style={{ marginTop: '15px' }}>
            <span style={{ marginRight: '10px' }}>回收之后进行提醒？</span>
            <Radio.Group value={shouldSendMessage} onChange={e => bindChange('shouldSendMessage')(e.target.value)}>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </div>
        </div>
        {shouldSendMessage && <div className={styles.step}>
          <div className={styles.steptitle}>设置消息接收人</div>
          <EntityReceiverPicker
            className={styles.stepcontent}
            fields={entityFields}
            receivers={receivers}
            receiverRange={receiverRange}
            onReceiversChange={bindChange('receivers')}
            onReceiverRangeChange={bindChange('receiverRange')}
          />
        </div>}
        {shouldSendMessage && <div className={styles.step}>
          <div className={styles.steptitle}>设置消息模板</div>
          <EntityMessageTemplate
            className={styles.stepcontent}
            fields={entityFields}
            title={messageTemplateTitle}
            content={messageTemplateContent}
            onTitleChange={bindChange('messageTemplateTitle')}
            onContentChange={bindChange('messageTemplateContent')}
          />
        </div>}
        <div className={styles.step} style={{ marginBottom: '50px' }}>
          <div className={styles.steptitle}>回收执行修改数据属性</div>
          <DynamicFieldUpdater
            allFields={entityFields}
            updateFields={updateFields}
            onUpdateFieldsChange={bindChange('updateFields')}
          />
        </div>
      </div>
    </Page>
  );
}

export default connect(
  state => state.collectorDetail,
  dispatch => {
    return {
      putState(payload) {
        dispatch({ type: 'collectorDetail/putState', payload });
      },
      save(data) {
        dispatch({ type: 'collectorDetail/save', payload: data });
      }
    };
  }
)(ReminderDetail);
