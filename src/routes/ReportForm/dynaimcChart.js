/**
 * Created by 0291 on 2018/7/17.
 */
import React, { PropTypes, Component } from 'react';
import ReportForm from './ReportForm';

class DynamicChart extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { location } = this.props;
    const pathReg = /^\/dynamicchart\/([^/]+)/;
    const match = location.pathname.match(pathReg);

    let reportId = '';
    if (match) {
      reportId = match[1];
    };

    let params = {};
    for(let key in location.query) {
      params['@' + key] = location.query[key];
    }

    return reportId ? (
      <ReportForm
        reportId={reportId}
        injectedParams={{ ...params }}
      />
    ) : null;
  }
}

export default DynamicChart;
