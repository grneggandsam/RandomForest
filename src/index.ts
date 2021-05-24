import Forest from "./Forest/Forest";
import FreezeSurvivalBranchNodes from "./FreezeSurvivalForest/FreezeSurvivalBranchNodes"
import testData from "./Fixtures/testData1.json";

function start() {
  const args = process.argv.slice(2);

  console.log("Creating Forest");
  const freezeSurvivalForest = new Forest(
    testData,
    FreezeSurvivalBranchNodes,
    (dataPoint: any) => {
    return dataPoint?.survivedFreeze;
    }
  );

  freezeSurvivalForest.buildTrees();

  freezeSurvivalForest.printTrees();

  console.log("Created forest, now predicting results");
  const testDataPoint1 = {
    "crop": "corn", "variety": "agrigold", "yield": 153, "maturityDays": 91
  };
  const result = freezeSurvivalForest.makePrediction(testDataPoint1);
  console.log("Result1 is: ", result);

  const testDataPoint2 = {
    "crop": "soy", "variety": "agrigold-2", "yield": 82, "maturityDays": 68
  };
  const result2 = freezeSurvivalForest.makePrediction(testDataPoint2);
  console.log("Result2 is: ", result2);
}

start();