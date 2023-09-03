import { testFreezeSurvivalForest, buildFreezeSurvivalForest, consumeFreezeSurvivalForest } from "./Implementations/FreezeSurvivalForest/FreezeSurvivalForest";
import {
  aggregateStockData,
} from "./Implementations/StocksForest/StocksForest";
import {
  testConsumeStockForest,
  testBuildStockForest,
  printStockForest,
  testConsumeStockBestTree, evolveStockForest
} from "./Implementations/StocksForest/test"
import { convertDataFromCSV } from "./Util/util";

async function freeze(action: string) {
  let forest;
  if (action == "consume") {
    forest = await consumeFreezeSurvivalForest();
  } else {
    forest = await buildFreezeSurvivalForest();
  }
  console.log("Created forest, now predicting results");
  testFreezeSurvivalForest(forest);
}

function stocks(action: string, option?: string) {
  switch(action) {
    case "consume":
      testConsumeStockForest(option);
      break;
    case "consume-best":
      testConsumeStockBestTree();
      break;
    case "aggregate":
      aggregateStockData();
      break;
    case "print":
      printStockForest();
      break;
    case "evolve":
      evolveStockForest();
      break;
    default:
      testBuildStockForest();
      break;
  }
}

function start() {
  const args = process.argv.slice(2);

  const type = args[0];
  const action = args[1];
  const option = args[2];

  /**
   * Switch for determining which function to run
   */
  switch(type) {
    case 'freeze':
      freeze(action);
      break;
    case 'stocks':
      stocks(action, option);
      break;
    case 'convert':
      convertDataFromCSV(action);
      break;
    default:
      freeze(action);
  }
}

start();