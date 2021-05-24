import Tree from "../Tree/Tree";

const standardOptions = {
  numTrees: 100,
  treeDepth: 15,
  trainingPercent: .3
};

class Forest {
  numTrees: number;
  treeDepth: number;
  trainingPercent: number;
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
  }

  buildTrees() {
    console.log("Building Trees");
    for(let i=0; i < this.numTrees; i++) {
      this.trees.push(new Tree(this.branchingNodes, this.grabDataSubset(), this.hasDesiredAttribute));
    }
  }

  /**
   * Method for grabbing a random subset of the data with replacement
   */
  grabDataSubset(): any[] {
    const subsetLength = Math.floor(this.trainingData.length * this.trainingPercent);
    const returnData = [];
    for(let i=0; i<subsetLength; i++) {
      const randomIndex = Math.floor(Math.random() * (this.trainingData.length - 1));
      returnData.push(this.trainingData[randomIndex]);
    }
    return returnData;
  }

  makePrediction(dataPoint: any) {
    /**
     * Gather votes from all trees in the forest
     */
    let trueVotes = 0;
    this.trees.forEach(tree => {
      trueVotes += tree.classify(dataPoint) ? 1 : 0;
    });

    /**
     * Determine which answer gets majority vote
     */
    return trueVotes > (this.trees.length / 2);
  }
}

export default Forest;