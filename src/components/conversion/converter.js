import React, {useState, useEffect } from "react";
import CurrencyLayerClient from "currencylayer-client"
import converter from "./converter.css";

class Converter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      result: null,
      baseCurrency: "EUR",
      targetCurrency: "CHF",
      amount: 1,
      targetCurrencies: [],
      baseCurrencies: []
    };
  }

  componentDidMount() {
    // Source and target currency hard coded as we have only 3 currency to consider
    // Otherwise we can have list of values and filter based on our requirement

    const targetCurrency = [];
    targetCurrency.push("USD");
    targetCurrency.push("CHF");

    const baseCurrency = [];
    baseCurrency.push("EUR");

    this.setState({ targetCurrencies: targetCurrency });
    this.setState({ baseCurrencies: baseCurrency });
  }

  convertHandler = () => {
    if (!isNaN(this.state.amount)) {
    // Initialize CurrencyLayerClient with access key
    let client = new CurrencyLayerClient({ apiKey: process.env.REACT_APP_API_KEY })

    // Invocation of the live end point of CurrencyLayer API
    client.live()
      .then(liveResponse => {

        let rate = null;

        if (this.state.targetCurrency !== "CHF") {
          // when target currency is USD, we have to devide 1 by USDEUR from response
          rate = (1 / liveResponse.quotes.USDEUR);
        }
        else {
          // when target currency is CHF, first we have to devide USDEUR by USDCHF.  
          // Then we have to devide 1 by the result
          rate = (liveResponse.quotes.USDCHF / liveResponse.quotes.USDEUR);
        }

        const result = this.state.amount * rate;
        this.setState({ result: result.toFixed(6) });
      })
      .catch((error => {
        console.error(error);
      }));

    }
    else {
      this.setState({ result: "Only number can be converted!" });
    }
  };

  selectHandler = event => {
    if (event.target.name === "base") {
      this.setState({ baseCurrency: event.target.value });
    } else {
      if (event.target.name === "target") {
        this.setState({ targetCurrency: event.target.value });
      }
    }
  };

  render() {
    return (
      <div className="Converter">
        <h2>
          <span>Currency Converter </span>
        </h2>
        <div className="From">
          <input
            name="amount"
            type="text"
            value={this.state.amount}
            onChange={event => this.setState({ amount: event.target.value })}
          />
          <select
            name="base"
            onChange={event => this.selectHandler(event)}
            value={this.state.baseCurrency}
          >
            {this.state.baseCurrencies.map(cur => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
          <select
            name="target"
            onChange={event => this.selectHandler(event)}
            value={this.state.targetCurrency}
          >
            {this.state.targetCurrencies.map(cur => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
          <button onClick={this.convertHandler}>Convert</button>
          {this.state.result && <h3>{this.state.result}</h3>}
        </div>

      </div>
    );
  }
}

export default Converter;