/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import styles from './styles.less';
import examplecss from './example-styles.less';
import Basic from './Test2.js';

class Demo extends React.PureComponent {
  static defaultProps = {

  };

  constructor(props) {
    super(props);
  }


  render() {
    return (
     <Basic />
    );
  }
}

export default Demo;
