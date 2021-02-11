import React, { Component } from 'react';
import Chart from "./components/chart/chart";
import Converter from "./components/conversion/converter.js";
import './App.css';

class App extends Component {
  render() {
    let converter = <Converter />;
    let chart = <Chart />;
        return(
          <div className="App">
            {converter}
            {chart}
         </div> 
        );
  }
}  

export default App;