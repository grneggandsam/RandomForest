import {
  aggregateMonthlyDataFromDates,
  createDelta,
  spreadDeltaDefIdx,
  spreadDeltaPercentageIdx
} from "../../Util/util";

const MONTHS_BACK = 12;

export const aggregateStockData = async () => {
  aggregateMonthlyDataFromDates(
    '1987-01-01',
    '2023-10-31',
    [
      {name: 'Stock/pe_ratios', fileType: 'json', map: {
        Value: 'peRatio',
        ...spreadDeltaDefIdx("deltaPeRatio", "Value", [1, MONTHS_BACK]),
      }},
      {name: 'Stock/SP500', fileType: 'csv', map: {
        Open: 'price',
        ...spreadDeltaDefIdx("deltaPrice", "Open", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerPrice", "Open", 100, [1, MONTHS_BACK]),
        }
      },
      {name: 'Stock/sp500DividendYield', fileType: 'csv', map: {
        DividendYield: 'dividend',
        ...spreadDeltaDefIdx("deltaDividend", "DividendYield", [1, MONTHS_BACK]),
        ...spreadDeltaPercentageIdx("deltaPerDividend", "DividendYield", 100, [1, MONTHS_BACK]),
        }
      },
      {name: 'Stock/CPIAUCSL', fileType: 'csv', map: {
        CPI: 'cpi',
        ...spreadDeltaDefIdx("deltaCPI", "CPI", [1, MONTHS_BACK], -2),
        ...spreadDeltaPercentageIdx("deltaPerCPI", "CPI", 100, [1, MONTHS_BACK], -2),
        }
      },
      {name: 'Stock/fed_funds', fileType: 'json', map: {
        "FEDFUNDS": "fedFunds",
        ...spreadDeltaDefIdx("deltaFedFunds", "FEDFUNDS", [1, MONTHS_BACK], -1),
      }},
      {name: 'Stock/un_rate', fileType: 'json', map: {
        "UNRATE": "unemRate",
        ...spreadDeltaDefIdx("deltaUnemRate", "UNRATE", [1, MONTHS_BACK], -1),
      }},
      {name: 'secondary', fileType: 'json', secondary: true, map: {
        "deltaNextMonthPriceAndDiv": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if ((dataIdx + 1) < dataPoints.length) {
            return (parseFloat(dataPoints[dataIdx + 1]["price"]) - parseFloat(dataPoints[dataIdx ]["price"]) + parseFloat(dataPoints[dataIdx ]["dividend"])/12.0).toFixed(3);
          }
          return "0.0";
        },
        "percentageChange": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
          if ((dataIdx + 1) < dataPoints.length) {
            return ((parseFloat(dataPoints[dataIdx + 1]["price"]) + parseFloat(dataPoints[dataIdx ]["dividend"])/12.0) / parseFloat(dataPoints[dataIdx ]["price"])).toFixed(3);
          }
          return "1.0";
        },
      }},
    ],
    'Stock/aggregated',
    .7
  );
};