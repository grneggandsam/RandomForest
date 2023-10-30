import Forest from "../../Forest/Forest";
import testData from "../../Fixtures/Stock/aggregated-test.json";
import trainData from "../../Fixtures/Stock/aggregated-test.json";
import fullData from "../../Fixtures/Stock/aggregated.json";
import { buildStockForest, consumeStockBestTree, consumeStockForest, getStockForest } from "./StocksForest";
import { TreeNode } from "../../Tree/Tree";
import Evolution from "../../Evolution/Evolution";
import {getStocksBranchNodes} from "./StocksBranchNodes";
import { saveJsonAsCSV } from "../../Util/util";

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

export const testPerformance = (stockForest: Forest, generateAnalysis = false, dataSet = testData) => {
  let forestScore = 100;
  let marketScore = 100;
  const analysisData: any[] = [];
  const snpData: any[] = [];
  const compData: any[] = [];
  dataSet.forEach((dataPoint: any, dataPointIdx) => {
    const result = stockForest.getPercentage(dataPoint, dataSet, dataPointIdx);
    if (result > .5) {
      forestScore *= parseFloat(dataPoint.percentageChange);
    }
    marketScore *= parseFloat(dataPoint.percentageChange);
    analysisData.push({ date: dataPoint.date, result });
    snpData.push({ date: dataPoint.date, value: dataPoint.price });
    compData.push({ date: dataPoint.date, marketScore, forestScore });
  });
  if (generateAnalysis) {
    console.log('Analysis Data: ', analysisData);
    saveJsonAsCSV(analysisData, `${process.cwd()}/SavedForests/StockForestAnalysis.csv`);
    saveJsonAsCSV(snpData, `${process.cwd()}/SavedForests/S&PAnalysis.csv`);
    saveJsonAsCSV(compData, `${process.cwd()}/SavedForests/CompAnalysis.csv`);
  }
  return {forestScore, marketScore};
};

export const testStockForest = (stockForest: Forest, generateAnalysis = false) => {
  const performanceResult = testPerformance(stockForest, generateAnalysis, fullData);
  const branchArr = createSortedBranchArray(stockForest.branchFuncUseMap, stockForest?.branchingNodes ?? []);

  console.log('Performance Result: ', performanceResult);
  console.log('Compared to Market: ', performanceResult.forestScore / performanceResult.marketScore);

  stockForest.testTreesInDataset(testData, (dataPoint) => {
    return parseFloat(dataPoint.deltaNextMonthPriceAndDiv);
  });


  stockForest.saveTreeByIndex(`${process.cwd()}/SavedForests`, "stockForestBestTree.json", 0);

  const result = stockForest.makePrediction(fullData[128]);
  console.log("Result1 is (should be true): ", result);

  const result2 = stockForest.makePrediction(fullData[250]);
  console.log("Result2 is (should be false): ", result2);

  const result3 = stockForest.makePrediction(fullData[359]);
  console.log("Result3 is (should be true): ", result3);


  const testDataPointToday = fullData[fullData.length - 1];
  const result4 = stockForest.makePrediction(testDataPointToday);
  console.log(`Should invest Today ${testDataPointToday.date}: `, result4);
};

export const testConsumeStockForest = async (filename: string | undefined) => {
  const forest = await consumeStockForest(filename);
  console.log("Consumed forest, now predicting results");
  await testStockForest(forest, false);
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
  const evolution = new Evolution(forest, trainData, getStocksBranchNodes, {
    generations: 4000,
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