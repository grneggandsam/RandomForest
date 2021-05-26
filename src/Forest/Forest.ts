import Tree from "../Tree/Tree";
import { randomSubselection } from "../Util/util";
import fs from "fs";
import path from "path";

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
  trainingData?: any[];
  branchingNodes?: any[];
  trees: Tree[] = [];

  constructor(hasDesiredAttribute: any, options: any = standardOptions) {
    this.hasDesiredAttribute = hasDesiredAttribute;
    this.numTrees = options.numTrees;
    this.treeDepth = options.treeDepth;
    this.trainingPercent = options.trainingPercent;
    this.threshold = options.threshold;
    this.randomFeaturePercent = options.randomFeaturePercent;
  }

  plantTrees(trainingData: any[], branchingNodes: any[]) {
    this.trainingData = trainingData;
    this.branchingNodes = branchingNodes;
    console.log("Planting Trees");
    for(let i=0; i < this.numTrees; i++) {
      const newTree = new Tree(
        this.hasDesiredAttribute,
        {
          randomFeaturePercent: this.randomFeaturePercent,
          treeDepth: this.treeDepth,
          threshold: this.threshold
        }
      );
      newTree.grow(this.branchingNodes, randomSubselection(this.trainingData, this.trainingPercent));
      this.trees.push(newTree);
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

  /**
   * Simply prints the human-readable version of the JSON blob of the trees
   */
  printTrees() {
    console.log("printing trees: ");
    this.trees.forEach(tree => {
      tree.printTree();
    });
  }
  
  saveForest(filePath: string, fileName: string = "forest.json") {
    const encodedForest = this.trees.map(tree => tree.encodeTree());
    const stringifiedForest = JSON.stringify(encodedForest);

    fs.writeFile(`${filePath}/${fileName}`, stringifiedForest, err => {
      if (err) {
        throw(err);
      }
    })
  }
  
  async loadForest(filePath: string, fileName: string = "forest.json", branchingNodes: any[]) {
    return new Promise((resolve, reject) => {
      this.branchingNodes = branchingNodes;
      fs.readFile(`${filePath}/${fileName}`, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        }
        const jsonForest = JSON.parse(data);
        jsonForest.forEach((encodedTree: any) => {
          const newTree = new Tree(
            this.hasDesiredAttribute,
            {
              randomFeaturePercent: this.randomFeaturePercent,
              treeDepth: this.treeDepth,
              threshold: this.threshold
            }
          );
          newTree.decodeTree(branchingNodes, encodedTree);
          this.trees.push(newTree);
        });
        resolve(this);
      })
    });
  }
}

export default Forest;