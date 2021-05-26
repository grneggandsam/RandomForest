import Forest from "../Forest/Forest";
import FreezeSurvivalBranchNodes from "./FreezeSurvivalBranchNodes";
import testData from "../Fixtures/testData1.json";

export const buildFreezeSurvivalForest = () => {
  console.log("Creating Forest");
  const freezeSurvivalForest = getFreezeSurvivalForest();

  freezeSurvivalForest.plantTrees(testData, FreezeSurvivalBranchNodes);

  freezeSurvivalForest.saveForest(`${process.cwd()}/SavedForests`, "freezeSurvivalForest");
  return freezeSurvivalForest;
};

export const consumeFreezeSurvivalForest = async () => {
  const freezeSurvivalForest = getFreezeSurvivalForest();

  await freezeSurvivalForest.loadForest(`${process.cwd()}/SavedForests`, "freezeSurvivalForest", FreezeSurvivalBranchNodes);
  return freezeSurvivalForest;
};

export const testFreezeSurvivalForest = (freezeSurvivalForest: Forest) => {
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
};

export const getFreezeSurvivalForest = () => {
  return new Forest(
    (dataPoint: any) => {
      return dataPoint?.survivedFreeze;
    }
  );
};