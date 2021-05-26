import { testFreezeSurvivalForest, buildFreezeSurvivalForest, consumeFreezeSurvivalForest } from "./FreezeSurvivalForest/FreezeSurvivalForest";

async function freeze(action: string) {
  let forest;
  if (action == "consume") {
    forest = await consumeFreezeSurvivalForest();
  } else {
    forest = buildFreezeSurvivalForest();
  }
  console.log("Created forest, now predicting results");
  testFreezeSurvivalForest(forest);
}

function start() {
  const args = process.argv.slice(2);

  const type = args[0];
  const action = args[1];

  /**
   * Switch for deterining which function to run
   */
  switch(type) {
    case 'freeze':
      freeze(action);
      break;
    default:
      freeze(action);
  }
}

start();