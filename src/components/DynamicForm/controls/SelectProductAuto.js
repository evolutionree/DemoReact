import React, { PropTypes, Component } from 'react';
import SelectProduct from './SelectProduct';
import SelectProductBigData from './SelectProductBigData';
import connectBasicData from "../../../models/connectBasicData";

class SelectProductAuto extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>SelectProductAuto</div>
    );
  }
}

export default connectBasicData('productsRaw', SelectProductAuto);

