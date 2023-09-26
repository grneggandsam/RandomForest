import Forest from "../../Forest/Forest";
import { StockData, getStocksBranchNodes } from "./StocksBranchNodes";
import testData from "../../Fixtures/Stock/aggregated.json";

/**
 * This is a scheme to determine whether one should invest in the S&P500 index for a given month.
 * We are training with data from 1988-01-01 to 2018-01-01 (30 years). Over that time frame, investing
 * in the index would go from 250.5 to 2664.34. Dividends add another 519.88, resulting in a final value
 * of 3184.22 if 250.50 was initially invested. This is an Annual Rate of Return of 8.84%
 *
 * The maximum possible gain (avoiding investing in all possible months of loss) would end in a value of 6738.35.
 * This would be a maximum possible Annual Rate of Return of 11.6%
 *
 * The goal of this exercise is to find out how to get as close to maximum Rate of Returns while avoiding
 * over-correcting as possible. So far, I have generated models which get 30% there (returning 9.67%)
 */


export const buildStockForest = async () => {
  console.log("Creating Forest");
  const stockForest = getStockForest();

  stockForest.plantTrees(testData, getStocksBranchNodes(testData));

  await stockForest.saveForest(`${process.cwd()}/SavedForests`, "stockForest.json");
  return stockForest;
};

export const consumeStockForest = async (name: string = 'stockForest') => {
  const stockForest = getStockForest();
  await stockForest.loadForest(`${process.cwd()}/SavedForests`, `${name}.json`, getStocksBranchNodes(testData));
  return stockForest;
};

export const consumeStockBestTree = async () => {
  const stockForest = getStockForest();
  await stockForest.loadForest(`${process.cwd()}/SavedForests`, "stockForestBestTree.json", getStocksBranchNodes(testData));
  return stockForest;
};

export const getStockForest = () => {
  return new Forest(
    (dataPoint: StockData) => {
      return parseFloat(dataPoint.deltaNextMonthPriceAndDiv) > 0;
    }, {
      numTrees: 50,
      treeDepth: 14,
      trainingPercent: .25,
      randomFeaturePercent: .8,
      threshold: .20
    }
  );
};

export { aggregateStockData } from './stockDataCreation';