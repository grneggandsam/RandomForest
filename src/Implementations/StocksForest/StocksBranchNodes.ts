import { TreeNode } from "../../Tree/Tree";
import {
  spreadRandomWeightedDeltaTreeNodes,
  spreadRandomWeightedTreeNodes,
  spreadRandomWeightedTreeNodesByIdx
} from "../../Util/util";

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

const MONTHS_BACK = 12;

const increaseInPrice = new TreeNode((dataPoint: StockData) => {
  return parseFloat(dataPoint.deltaNextMonthPriceAndDiv) > 0;
}, "increaseInPrice");

const decreaseInPrice = new TreeNode((dataPoint: StockData) => {
  return parseFloat(dataPoint.deltaNextMonthPriceAndDiv) < 0;
}, "decreaseInPrice");

const alwaysInvest = new TreeNode((dataPoint: StockData, weights: number[]) => {
  return Math.random() < weights[0];
}, "alwaysInvest");

const neverInvest = new TreeNode((dataPoint: StockData, weights: number[]) => {
  return Math.random() > weights[0];
}, "neverInvest");

export const getStocksBranchNodes = (data: any[]): TreeNode[] => {
  return [
    ...spreadRandomWeightedTreeNodes(data, 3, 'peRatio'),
    ...spreadRandomWeightedTreeNodesByIdx(data, 3, 'deltaPeRatio', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaPrice', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaPerPrice', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaEarnings', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaPerEarnings', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaPerCPI', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaRealDividend', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaPerRealDividend', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodes(data, 5, 'fedFunds'),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaFedFunds', [1, MONTHS_BACK]),
    ...spreadRandomWeightedTreeNodes(data, 5, 'unemRate'),
    ...spreadRandomWeightedTreeNodesByIdx(data, 5, 'deltaUnemRate', [1, MONTHS_BACK])
    // alwaysInvest,
    // neverInvest,
    // decreaseInPrice,
    // increaseInPrice,
  ];
};
