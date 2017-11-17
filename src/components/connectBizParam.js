import React from 'react';
import { query } from '../services/entity';

export default function connectBizParam(bizParamKey, OriginalComponent) {
  return class connected extends React.Component {
    state = {
      bizParam: null
    };
    constructor(props) {
      super(props);
      query({
        pageIndex: 1,
        pageSize: 999,
        status: 1,
        typeId: -1,
        entityName: ''
      }).then(result => {
        return result.data.pagedata;
      }).then(options => {
        this.setState({ bizParam: options });
      });
    }
    componentWillReceiveProps() {
      // debugger;
      // setTimeout(() => {
      //   this.setState({
      //     bizParam: [{
      //       value: '10000',
      //       label: '客户实体'
      //     }]
      //   });
      // }, 1000);
    }
    render() {
      return <OriginalComponent {...this.props} bizParam={this.state.bizParam} />;
    }
  };
}
