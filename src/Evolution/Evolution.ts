import Forest from "../Forest/Forest";
import { TreeNode } from "../Tree/Tree";

interface Options {
  generations?: number;
  testPerformance?: (forest: Forest) => number;
  saveForest?: (forest: Forest) => Promise<void>;
}

class Evolution {
  baseForest: Forest;
  data: any[];
  getBranchNodes: (data: any[]) => TreeNode[];
  generations: number;
  testPerformance: (forest: Forest) => number;
  saveForest: (forest: Forest) => Promise<void>;
  currentGeneration?: Forest;
  lastGeneration?: Forest;

  constructor(baseForest: Forest, data: any[], getBranchNodes: (data: any[]) => TreeNode[], options: Options = {}) {
    this.baseForest = baseForest;
    this.data = data;
    this.getBranchNodes = getBranchNodes;
    const {
      generations = 10,
      testPerformance = (forest) => forest.score ?? 0,
      saveForest = async (forest) => {},
    } = options;
    this.generations = generations;
    this.testPerformance = testPerformance;
    this.saveForest = saveForest;
  }

  async evolve(quiet: boolean = true): Promise<Forest | undefined> {
    for (let i = 0; i < this.generations; i++) {
      if (!quiet) {
        console.log('Creating generation: ', i + 1);
      }
      this.createNewGeneration(quiet);
    }

    if (!quiet) {
      console.log('Done evolving!')
    }
    // Now save last generation if its best
    if (this.lastGeneration && this.saveForest) {
      await this.saveForest(this.lastGeneration);
    }
    return this.lastGeneration;
  }

  createNewGeneration(quiet: boolean = true) {
    // TODO: Maybe remove this qualifier with proper algorithm
    if ((this.lastGeneration?.score ?? 0) < (this.currentGeneration?.score ?? 0)) {
      this.lastGeneration = this.currentGeneration;
    }
    this.currentGeneration = this.baseForest.clone();
    this.currentGeneration.plantTrees(this.data, this.getBranchNodes(this.data));
    this.currentGeneration.score = this.testPerformance(this.currentGeneration);
    if (!quiet) {
      console.log('New Generation Score: ', this.currentGeneration.score)
    }
  }
}

export default Evolution;
