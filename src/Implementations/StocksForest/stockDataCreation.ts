import {aggregateMonthlyDataFromDates} from "../../Util/util";

const createDelta = (dataIdx: number, dataPoints: any, attributeKey: string) => {
  return (parseFloat(dataPoints[dataIdx][attributeKey]) - parseFloat(dataPoints[dataIdx - 1][attributeKey])).toFixed(3);
};
const createDeltaDef = (dataIdx: number, dataPoints: any, attributeKey: string) => {
  if (dataIdx == 0) {
    return "0.0";
  }
  return (parseFloat(dataPoints[dataIdx][attributeKey]) - parseFloat(dataPoints[dataIdx - 1][attributeKey])).toFixed(3);
};
const createDeltaPer = (dataIdx: number, dataPoints: any, attributeKey: string, multiplier: number = 1.0) => {
  if (dataIdx == 0) {
    return "0.0";
  }
  return (multiplier * (parseFloat(dataPoints[dataIdx][attributeKey]) - parseFloat(dataPoints[dataIdx - 1][attributeKey])) / parseFloat(dataPoints[dataIdx - 1][attributeKey])).toFixed(3);
};

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
          "deltaPrice": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "SP500");
          },
          "deltaPerPrice": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaPer(dataIdx, dataPoints, "SP500", 100);
          },
          "deltaEarnings": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "Earnings");
          },
          "deltaPerEarnings": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaPer(dataIdx, dataPoints, "Earnings", 100);
          },
          "deltaCPI": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "Consumer Price Index");
          },
          "deltaPerCPI": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaPer(dataIdx, dataPoints, "Consumer Price Index", 100);
          },
          "deltaRealDividend": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "Real Dividend");
          },
          "deltaPerRealDividend": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaPer(dataIdx, dataPoints, "Real Dividend", 100);
          },
        }},
        {name: 'Stock/fed_funds', map: {
          "FEDFUNDS": "fedFunds",
          "deltaFedFunds": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "FEDFUNDS");
          }
        }},
        {name: 'Stock/un_rate', map: {
          "UNRATE": "unemRate",
          "deltaUnemRate": (dataPoint: any, dataIdx: number, dataPoints: any[]) => {
            return createDeltaDef(dataIdx, dataPoints, "UNRATE");
          }
        }},
    ],
    'Stock/aggregated'
  );
};