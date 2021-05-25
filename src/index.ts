import { testFreezeSurvivalForest } from "./FreezeSurvivalForest/FreezeSurvivalForest";

function start() {
  const args = process.argv.slice(2);

  /**
   * Switch out this function to test alternative scenarios
   */
  testFreezeSurvivalForest();
}

start();