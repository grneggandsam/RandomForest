import { TreeNode } from "../../Tree/Tree";
import { spreadRandomWeightedTreeNodes } from "../../Util/util";

/**
 * The "branch nodes" are essentially a set of functions which can be used to make decisions.
 */

export interface StockData {
  price: string;
  nextMonthPrice: string;
  deltaNextMonthPrice: string;
  deltaNextMonthPriceAndDiv: string;
  dividend: string;
  peRatio: string;
  deltaPeRatio: string;
  earnings: string;
  cpi: string;
  realPrice: string;
  date: string;
  deltaPrice: string;
  deltaPerPrice: string;
  deltaEarnings: string;
  deltaPerEarnings: string;
  deltaCPI: string;
  deltaPerCPI: string;
  deltaRealDividend: string;
  deltaPerRealDividend: string;
}

const increaseInPrice = new TreeNode((dataPoint: StockData) => {
  return parseFloat(dataPoint.deltaNextMonthPriceAndDiv) > 0;
}, "increaseInPrice");

const decreaseInPrice = new TreeNode((dataPoint: StockData) => {
  return parseFloat(dataPoint.deltaNextMonthPriceAndDiv) < 0;
}, "decreaseInPrice");

const alwaysInvest = new TreeNode((dataPoint: StockData, weight: number) => {
  return Math.random() < weight;
}, "alwaysInvest");

const neverInvest = new TreeNode((dataPoint: StockData, weight: number) => {
  return Math.random() > weight;
}, "neverInvest");

export const getStocksBranchNodes = (data: StockData[]): TreeNode[] => {
  return [
    ...spreadRandomWeightedTreeNodes(data, 3, 'peRatio'),
    ...spreadRandomWeightedTreeNodes(data, 3, 'deltaPeRatio'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaPrice'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaPerPrice'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaEarnings'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaPerEarnings'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaPerCPI'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaRealDividend'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaPerRealDividend'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'fedFunds'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaFedFunds'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'unemRate'),
    ...spreadRandomWeightedTreeNodes(data, 5, 'deltaUnemRate'),
    // alwaysInvest,
    // neverInvest,
    // decreaseInPrice,
    // increaseInPrice,
  ];
};
