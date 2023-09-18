import Forest from "../../Forest/Forest";
import testData from "../../Fixtures/Stock/aggregated.json";
import { buildStockForest, consumeStockBestTree, consumeStockForest, getStockForest } from "./StocksForest";
import { TreeNode } from "../../Tree/Tree";
import Evolution from "../../Evolution/Evolution";
import {getStocksBranchNodes} from "./StocksBranchNodes";



export const createSortedBranchArray = ((branchFuncMap: any, branchingNodes: TreeNode[]) => {
  const branchMap: any = {};
  branchingNodes.forEach((bn: TreeNode) => {
    if (bn.name) {
      branchMap[bn.name] = 0;
    }
  });
  return Object.keys(branchMap).map((name) => {
    return {name, count: branchFuncMap[name] ?? 0 }
  }).sort((itemA, itemB) => itemB.count - itemA.count);
});

export const testBuildStockForest = async () => {
  const ogForest = await buildStockForest();
  console.log("Created forest, now predicting results");
  const branchArr = createSortedBranchArray(ogForest.branchFuncMap, ogForest?.branchingNodes ?? []);
  console.log('Branching Arr: ', branchArr);

  const forest = await consumeStockForest();
  testStockForest(forest);
};

export const testPerformance = (stockForest: Forest) => {
  let forestScore = 0;
  let marketScore = 0;
  testData.forEach((dataPoint, dataPointIdx) => {
    const result = stockForest.getPercentage(dataPoint, testData, dataPointIdx);
    if (result > .5) {
      forestScore += parseFloat(dataPoint.deltaNextMonthPriceAndDiv);
    }
    marketScore += parseFloat(dataPoint.deltaNextMonthPriceAndDiv);
  });
  return {forestScore, marketScore};
};

export const testStockForest = (stockForest: Forest) => {
  const performanceResult = testPerformance(stockForest);
  const branchArr = createSortedBranchArray(stockForest.branchFuncUseMap, stockForest?.branchingNodes ?? []);

  console.log('Performance Result: ', performanceResult);
  console.log('Compared to Market: ', (performanceResult.forestScore + 963.36) / (performanceResult.marketScore + 963.36));

  stockForest.testTreesInDataset(testData, (dataPoint) => {
    return parseFloat(dataPoint.deltaNextMonthPriceAndDiv);
  });


  stockForest.saveTreeByIndex(`${process.cwd()}/SavedForests`, "stockForestBestTree.json", 0);


  const testDataPoint1 = {
    "peRatio": "26.8",
    "realPrice": "1558.63",
    "dividend": "16.14",
    "realDividend": "24.65",
    "price": "1020.64",
    "earnings": "38.09",
    "cpi": "163.6",
    "nextMonthPrice": "1032.47",
    "deltaNextMonthPrice": "11.830",
    "deltaNextMonthPriceAndDiv": "13.175",
    "deltaPrice": "-53.980",
    "deltaPerPrice": "-0.050",
    "deltaEarnings": "-0.290",
    "deltaPerEarnings": "-0.008",
    "deltaCPI": "0.200",
    "deltaPerCPI": "0.001",
    "deltaRealDividend": "0.060",
    "deltaPerRealDividend": "0.002",
    "fedFunds": "5.51",
    "deltaFedFunds": "-0.040",
    "unemRate": "4.6",
    "deltaUnemRate": "0.100",
    "date": "1998-09-01"
  };
  const result = stockForest.makePrediction(testDataPoint1);
  console.log("Result1 is (should be true): ", result);

  const testDataPoint2 = {
    "peRatio": "34.99",
    "realPrice": "1038.55",
    "dividend": "28.54",
    "realDividend": "33.57",
    "price": "883.04",
    "earnings": "25.24",
    "cpi": "212.43",
    "nextMonthPrice": "877.56",
    "deltaNextMonthPrice": "-5.480",
    "deltaNextMonthPriceAndDiv": "-3.102",
    "deltaPrice": "-85.760",
    "deltaPerPrice": "-0.089",
    "deltaEarnings": "-10.350",
    "deltaPerEarnings": "-0.291",
    "deltaCPI": "-4.140",
    "deltaPerCPI": "-0.019",
    "deltaRealDividend": "0.470",
    "deltaPerRealDividend": "0.014",
    "fedFunds": "0.39",
    "deltaFedFunds": "-0.580",
    "unemRate": "6.8",
    "deltaUnemRate": "0.300",
    "date": "2008-11-01"
  };
  const result2 = stockForest.makePrediction(testDataPoint2);
  console.log("Result2 is (should be false): ", result2);


  const testDataPoint3 = {
    "peRatio": "24.25",
    "realPrice": "2700.13",
    "dividend": "48.93",
    "realDividend": "49.59",
    "price": "2664.34",
    "earnings": "109.88",
    "cpi": "246.52",
    "nextMonthPrice": "2789.8",
    "deltaNextMonthPrice": "125.460",
    "deltaNextMonthPriceAndDiv": "129.538",
    "deltaPrice": "70.730",
    "deltaPerPrice": "0.027",
    "deltaEarnings": "0.930",
    "deltaPerEarnings": "0.009",
    "deltaCPI": "-0.150",
    "deltaPerCPI": "-0.001",
    "deltaRealDividend": "0.290",
    "deltaPerRealDividend": "0.006",
    "fedFunds": "1.30",
    "deltaFedFunds": "0.140",
    "unemRate": "4.1",
    "deltaUnemRate": "-0.100",
    "date": "2017-12-01"
  };
  const result3 = stockForest.makePrediction(testDataPoint3);
  console.log("Result3 is (should be true): ", result3);


  const testDataPointToday = {
    "peRatio": "23.46",
    "realPrice": "4507.66",
    "dividend": "67.619",
    "dividendPer": "0.015",
    "realDividend": "67.619",
    "deltaRealDividend": "0.0",
    "deltaPerRealDividend": "0.0",
    "price": "4507.66",
    "deltaPrice": "-58.09",
    "deltaPerPrice": "-0.013",
    "earnings": "175.15",
    "deltaEarnings": "0.810",
    "deltaPerEarnings": "0.005",
    "cpi": "305.691",
    "deltaCPI": "0.582",
    "deltaPerCPI": "0.001",
    "fedFunds": "5.33",
    "deltaFedFunds": "0.210",
    "unemRate": "3.8",
    "deltaUnemRate": "0.3",
    "date": "2023-08-31"
  };
  const result4 = stockForest.makePrediction(testDataPointToday);
  console.log("Should invest Today: ", result4);
};

export const testConsumeStockForest = async (filename: string | undefined) => {
  const forest = await consumeStockForest(filename);
  console.log("Consumed forest, now predicting results");
  await testStockForest(forest);
};

export const testConsumeStockBestTree = async () => {
  const forest = await consumeStockBestTree();
  console.log("Consumed best tree, now predicting results");
  await testStockForest(forest);
};

export const printStockForest = async () => {
  const forest = await consumeStockForest();
  console.log("Consumed forest, now printing it");
  forest.printTrees();
};

export const evolveStockForest = async () => {
  const forest = getStockForest();
  const evolution = new Evolution(forest, testData, getStocksBranchNodes, {
    generations: 100,
    testPerformance: (currentForest) => {
      const { forestScore } = testPerformance(currentForest);
      return forestScore;
    },
  });
  console.log('Evolving Stock Forests');

  const resultForest = await evolution.evolve(false);
  if (!resultForest) {
    console.error("SOMETHING WENT WRONG!");
    return;
  }
  console.log('Result Forest Score: ', resultForest?.score);
  testStockForest(resultForest);

  console.log('Loading the current best stock forest');
  try {
    const currentBest = await consumeStockForest('bestStockForest');
    if (!currentBest) {
      console.log('No current best saved, saving!');
      await resultForest.saveForest(`${process.cwd()}/SavedForests`, "bestStockForest.json");
      return;
    }
    console.log('Testing performance of current best stock forest');
    const currentBestPerformance = testPerformance(currentBest);
    console.log('Current bestStockForest score: ', currentBestPerformance.forestScore);
    if (currentBestPerformance.forestScore < (resultForest?.score ?? 0)) {
      console.log('Result is better, saving as best');
      await resultForest.saveForest(`${process.cwd()}/SavedForests`, "bestStockForest.json");
    }
  } catch (e) {
    console.log('Error loading current best. Saving!');
    await resultForest.saveForest(`${process.cwd()}/SavedForests`, "bestStockForest.json");
  }
};