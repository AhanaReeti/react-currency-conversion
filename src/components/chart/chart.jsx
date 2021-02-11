import React from 'react';
import Chip from '@material-ui/core/Chip';
import { Line } from 'react-chartjs-2';
import Moment from 'react-moment';
import moment from 'moment';
import CurrencyLayerClient from "currencylayer-client";
import './chart.scss';

const colors = ['lightgreen', 'pink'];

const dataSetOpts = {
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBackgroundColor: '#fff',
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    responsive: true
}

class Chart extends React.Component {

    constructor(props) {
        super(props);
        const baseCurrencies = ["EUR"];
        this.state = {
            baseCurrencies: baseCurrencies,
            selectedBaseCurrency: baseCurrencies[0],
            targetCurrencies: [],
            selectedTargetCurrencies: new Map(),
            conversionRates: {},
            chartData: {}
        };
    }

    componentDidMount() {
        this.retrieveHistoricalConversionRates();
    }

    selectBaseCurrency(ccy) {
        this.setState({
            selectedBaseCurrency: ccy,
            selectedTargetCurrencies: new Map(),
            chartData: {}
        }, () => this.retrieveHistoricalConversionRates());
    }

    selectTargetCurrency(targetCurrency) {

        this.setState(prevState => {
            let targetCurrencies = new Map(prevState.selectedTargetCurrencies);
            (targetCurrencies.has(targetCurrency)) ? targetCurrencies.delete(targetCurrency) : targetCurrencies.set(targetCurrency, 1);
            const chart = this.getDataSets(
                this.state.conversionRates
                , this.state.selectedBaseCurrency
                , [...targetCurrencies.keys()])
            return {
                selectedTargetCurrencies: targetCurrencies,
                chartData: chart
            };
        });
    }

    getDataSets(rates, baseCurrency, targetCurrencies) {
        return {
            labels: rates.data.ratesByBaseCurrency[0].timeseries.map(t => "" + moment(t.date).format("MMM DD")),
            datasets: targetCurrencies.map((targetCurrency) => {
                const dIndex = rates.data.ratesByBaseCurrency.findIndex(d => d.targetCurrency === targetCurrency);
                return {
                    ...dataSetOpts,
                    label: baseCurrency + ' / ' + targetCurrency,
                    borderColor: colors[dIndex],
                    pointBorderColor: colors[dIndex],
                    data: rates.data.ratesByBaseCurrency[dIndex].timeseries.map(t => t.rate)
                };
            }
            )
        };
    }

  async retrieveHistoricalConversionRates() {

        let client = new CurrencyLayerClient({ apiKey: process.env.REACT_APP_API_KEY })

        let historyDuration = 14

        const currentMoment = moment().subtract(historyDuration, 'days');
        const endMoment = moment().add(0, 'days');

        let usdRates = [];
        let chfRates = [];

        while (currentMoment.isBefore(endMoment, 'day')) {
            let date = currentMoment.format('YYYY-MM-DD');

          await client.historical({ date: date, currencies: 'EUR,CHF' })
                .then(historicalResponse => {

                    let rate = 1 / historicalResponse.quotes.USDEUR;
                    usdRates.push({ date, rate });

                    rate = historicalResponse.quotes.USDCHF / historicalResponse.quotes.USDEUR;
                    chfRates.push({ date, rate });
                })
                .catch((error => {
                    console.error(error);
                }));

            currentMoment.add(1, 'days');
        }

        this.setState({
            targetCurrencies: ["USD", "CHF"],
            conversionRates: {
                data: {
                    ratesByBaseCurrency: [{ targetCurrency: "USD", timeseries: usdRates },
                    { targetCurrency: "CHF", timeseries: chfRates }]
                }
            }
        });

    }

    render() {
        return <div className='rate-data'>
            <div className='rate-selector'>
                <h4>Source currency</h4>
                <div>
                    {this.state.baseCurrencies
                        .map(currency => {
                            let opts = {
                                key: currency,
                                label: currency,
                                color: (currency === this.state.selectedBaseCurrency) ? 'primary' : 'default'
                            }
                            return <Chip {...opts} onClick={() => this.selectBaseCurrency(currency)} />;
                        })}
                </div>

                <h4>Target currency</h4>

                <div>
                    {this.state.targetCurrencies
                        .map((targetCurrency, index) => {
                            let opts = {
                                key: targetCurrency,
                                label: targetCurrency,
                                color: 'default',
                                style: (this.state.selectedTargetCurrencies.has(targetCurrency)) ? { backgroundColor: colors[index] } : {},
                            }
                            return <Chip {...opts} onClick={() => this.selectTargetCurrency(targetCurrency)} />;
                        })}
                </div>
            </div>
            <div className='chart'>
                <Line height={100} data={this.state.chartData} />
            </div>
        </div>

    }
}

export default Chart;