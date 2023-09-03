import Tree, {TreeNode} from "../Tree/Tree";
import { randomSubselection } from "../Util/util";
import fs from "fs";

interface ForestOptions {
  numTrees: number
  treeDepth: number
  trainingPercent: number
  randomFeaturePercent: number
  threshold: number
}

const standardOptions: ForestOptions = {
  numTrees: 1000,
  treeDepth: 15,
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
  branchingNodes?: TreeNode[];
  trees: Tree[] = [];
  branchFuncMap: any = {};
  branchFuncUseMap: any = {};
  score?: number;

  constructor(hasDesiredAttribute: any, options: ForestOptions = standardOptions) {
    this.hasDesiredAttribute = hasDesiredAttribute;
    this.numTrees = options.numTrees;
    this.treeDepth = options.treeDepth;
    this.trainingPercent = options.trainingPercent;
    this.threshold = options.threshold;
    this.randomFeaturePercent = options.randomFeaturePercent;
  }

  plantTrees(trainingData: any[], branchingNodes: TreeNode[]) {
    this.trainingData = trainingData;
    branchingNodes = this._indexBranchingNodes(branchingNodes);
    this.branchingNodes = branchingNodes;
    for(let i=0; i < this.numTrees; i++) {
      const newTree = new Tree(
        this.hasDesiredAttribute,
        {
          randomFeaturePercent: this.randomFeaturePercent,
          treeDepth: this.treeDepth,
          threshold: this.threshold
        }
      );
      const treeFuncUseMap = newTree.grow(this.branchingNodes, randomSubselection(this.trainingData, this.trainingPercent));
      Object.entries(treeFuncUseMap).forEach(([funcKey, funcCount]) => {
        if (!this.branchFuncMap[funcKey]) {
          this.branchFuncMap[funcKey] = 0;
        }
        this.branchFuncMap[funcKey] += funcCount;
      });
      this.trees.push(newTree);
    }
  }

  getPercentage(dataPoint: any): number {
    let trueVotes = 0;
    this.trees.forEach(tree => {
      trueVotes += tree.classify(dataPoint) ? 1 : 0;
      this.addTreeFuncsToBranchFuncUseMap(tree);
    });

    return trueVotes / this.trees.length;
  }

  makePrediction(dataPoint: any, silent = false): boolean {
    /**
     * Gather votes from all trees in the forest
     */
    let trueVotes = 0;
    this.trees.forEach(tree => {
      trueVotes += tree.classify(dataPoint) ? 1 : 0;
      this.addTreeFuncsToBranchFuncUseMap(tree);
    });

    if (!silent) {
      console.log("True votes: ", trueVotes);
      console.log("False votes: ", this.trees.length - trueVotes);
    }

    /**
     * Determine which answer gets majority vote
     */
    return trueVotes > (this.trees.length / 2);
  }

  sortTreesByDataset(dataset: any[], pointFunction: (point: any) => number) {
    dataset.forEach(dataPoint => {
      const points = pointFunction(dataPoint);
      this.trees.forEach(tree => {
        const usePoint = tree.classify(dataPoint);
        if (usePoint) {
          tree.score += points;
        }
      });
    });

    this.trees = this.trees.sort((treeA, treeB) => {
      return treeB.score - treeA.score;
    });

  }

  testTreesInDataset(dataset: any[], pointFunction: (point: any) => number) {
    this.sortTreesByDataset(dataset, pointFunction);
    const bestTree = this.trees[0];
    const worstTree = this.trees[this.trees.length - 1];

    console.log('Best Tree Score: ', bestTree.score);
    console.log('Worst Tree Score: ', worstTree.score);
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
    return new Promise((resolve, reject) => {
      const encodedForest = this.trees.map(tree => tree.encodeTree());
      const stringifiedForest = JSON.stringify(encodedForest);

      fs.writeFile(`${filePath}/${fileName}`, stringifiedForest, err => {
        if (err) {
          reject(err);
          throw(err);
        }
        resolve(stringifiedForest);
      })
    });
  }

  saveTreeByIndex(filePath: string, fileName: string = "forest.json", treeIndex: number) {
    return new Promise((resolve, reject) => {
      const encodedForest = [this.trees[treeIndex].encodeTree()];
      const stringifiedForest = JSON.stringify(encodedForest);

      fs.writeFile(`${filePath}/${fileName}`, stringifiedForest, err => {
        if (err) {
          reject(err);
          throw(err);
        }
        resolve(stringifiedForest);
      })
    });
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

  addTreeFuncsToBranchFuncUseMap(tree: Tree) {
    Object.entries(tree.branchFuncMap).forEach(([name, count]) => {
      if (!this.branchFuncUseMap[name]) {
        this.branchFuncUseMap[name] = count;
      }
      this.branchFuncUseMap[name] += count;
    })
  }

  clone() {
    return new Forest(this.hasDesiredAttribute, {
      numTrees: this.numTrees,
      treeDepth: this.treeDepth,
      trainingPercent: this.trainingPercent,
      threshold: this.threshold,
      randomFeaturePercent: this.randomFeaturePercent,
    })
  }

  _indexBranchingNodes(branchingNodes: TreeNode[]) {
    for(let i = 0; i < branchingNodes.length; i++) {
      branchingNodes[i].index = i;
    }
    return branchingNodes;
  }
}

export default Forest;