import Tree from "../Tree/Tree";
import { randomSubselection } from "../Util/util";

const standardOptions = {
  numTrees: 1000,
  treeDepth: 150,
  trainingPercent: .1,
  randomFeaturePercent: .7,
  threshold: .1
};

class Forest {
  numTrees: number;
  treeDepth: number;
  trainingPercent: number;
  threshold: number;
  randomFeaturePercent: number;
  hasDesiredAttribute: any;
  trainingData: any[];
  branchingNodes: any[];
  trees: Tree[] = [];

  constructor(trainingData: any[], branchingNodes: any[], hasDesiredAttribute: any, options: any = standardOptions) {
    this.trainingData = trainingData;
    this.branchingNodes = branchingNodes;
    this.hasDesiredAttribute = hasDesiredAttribute;
    this.numTrees = options.numTrees;
    this.treeDepth = options.treeDepth;
    this.trainingPercent = options.trainingPercent;
    this.threshold = options.threshold;
    this.randomFeaturePercent = options.randomFeaturePercent;
  }

  buildTrees() {
    console.log("Building Trees");
    for(let i=0; i < this.numTrees; i++) {
      this.trees.push(new Tree(
        this.branchingNodes,
        randomSubselection(this.trainingData, this.trainingPercent),
        this.hasDesiredAttribute,
        {
          randomFeaturePercent: this.randomFeaturePercent,
          treeDepth: this.treeDepth,
          threshold: this.threshold
        }
        ));
    }
  }

  makePrediction(dataPoint: any): boolean {
    /**
     * Gather votes from all trees in the forest
     */
    let trueVotes = 0;
    this.trees.forEach(tree => {
      trueVotes += tree.classify(dataPoint) ? 1 : 0;
    });

    console.log("True votes: ", trueVotes);
    console.log("False votes: ", this.trees.length - trueVotes);

    /**
     * Determine which answer gets majority vote
     */
    return trueVotes > (this.trees.length / 2);
  }

  printTrees() {
    console.log("printing trees: ");
    this.trees.forEach(tree => {
      tree.printTree();
    });
  }
}

export default Forest;