import { TreeNode } from "../Tree/Tree";

interface SeedData {
  crop: string;
  variety: string;
  yield: number;
  maturityDays: number;
  survivedFreeze: boolean;
}

const isCorn = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.crop == "corn";
}, "isCorn");
const isFreshuns = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.variety == "freshuns";
}, "isFreshuns");
const isAgrigold = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.variety == "agrigold";
}, "isAgrigold");
const isAgrigold1 = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.variety == "agrigold1";
}, "isAgrigold1");
const isAgrigold2 = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.variety == "agrigold2";
}, "isAgrigold2");
const lowYield = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.yield < 86;
}, "lowYield");
const medYield1 = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.yield >= 86 && dataPoint.yield < 100;
}, "medYield1");
const medYield2 = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.yield >= 100 && dataPoint.yield < 164;
}, "medYield2");
const highYield = new TreeNode((dataPoint: SeedData) => {
  return dataPoint.yield >= 164;
}, "highYield");

const freezeSurvivalBranchNodes: TreeNode[] = [
  isCorn, isFreshuns, isAgrigold, isAgrigold1, isAgrigold2, lowYield, medYield1, medYield2, highYield
];

export default freezeSurvivalBranchNodes;