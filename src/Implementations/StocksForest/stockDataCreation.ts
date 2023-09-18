import {
  aggregateMonthlyDataFromDates,
  createDelta,
  spreadDeltaDefIdx,
  spreadDeltaPercentageIdx
} from "../../Util/util";

const MONTHS_BACK = 6;

export const aggregateStockData = async () => {
  aggregateMonthlyDataFromDates(
    '1988-01-01',
    '2018-01-01',
    [
      {name: 'Stock/pe_ratios', map: {
        Value: 'peRatio',
        "deltaPeRatio": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if (dataIdx > 0) {
            return createDelta(dataIdx, dataPoints, "Value");
          }
          return "0.0";
        },
        ...spreadDeltaDefIdx("deltaPeRatio", "Value", [1, MONTHS_BACK]),
      }},
      {name: 'Stock/data_csv', map: {
        "Real Price": 'realPrice',
        "Dividend": 'dividend',
        "Real Dividend": 'realDividend',
        "SP500": 'price',
        "Earnings": 'earnings',
        "Consumer Price Index": 'cpi',
        "nextMonthPrice": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if ((dataIdx + 1) < dataPoints.length) {
            return dataPoints[dataIdx + 1]["SP500"];
          }
          return "0.0";
        },
        "deltaNextMonthPrice": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if ((dataIdx + 1) < dataPoints.length) {
            return (parseFloat(dataPoints[dataIdx + 1]["SP500"]) - parseFloat(dataPoints[dataIdx ]["SP500"])).toFixed(3);
          }
          return "0.0";
        },
        "deltaNextMonthPriceAndDiv": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if ((dataIdx + 1) < dataPoints.length) {
            return (parseFloat(dataPoints[dataIdx + 1]["SP500"]) - parseFloat(dataPoints[dataIdx ]["SP500"]) + parseFloat(dataPoints[dataIdx ]["Dividend"])/12.0).toFixed(3);
          }
          return "0.0";
        },
        ...spreadDeltaDefIdx("deltaPrice", "SP500", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerPrice", "SP500", 100, [1, MONTHS_BACK]),
        ...spreadDeltaDefIdx("deltaEarnings", "Earnings", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerEarnings", "Earnings", 100, [1, MONTHS_BACK]),
        ...spreadDeltaDefIdx("deltaCPI", "Consumer Price Index", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerCPI", "Consumer Price Index", 100, [1, MONTHS_BACK]),
        ...spreadDeltaDefIdx("deltaRealDividend", "Real Dividend", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerRealDividend", "Real Dividend", 100, [1, MONTHS_BACK]),
        }
      },
      {name: 'Stock/fed_funds', map: {
        "FEDFUNDS": "fedFunds",
        ...spreadDeltaDefIdx("deltaFedFunds", "FEDFUNDS", [1, MONTHS_BACK]),
      }},
      {name: 'Stock/un_rate', map: {
        "UNRATE": "unemRate",
        ...spreadDeltaDefIdx("deltaUnemRate", "UNRATE", [1, MONTHS_BACK]),
      }},
    ],
    'Stock/aggregated'
  );
};