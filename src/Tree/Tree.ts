import { randomSubselection } from "../Util/util";

class LeafNode {
  isTrue: boolean;

  constructor(isTrue: boolean) {
    this.isTrue = isTrue;
  }

  classify() {
    return this.isTrue;
  }
}

export class TreeNode {
  name?: string;
  decisionFunction: any;
  trueNode?: TreeNode | LeafNode;
  falseNode?: TreeNode | LeafNode;

  constructor(decisionFunction: any, name?: string) {
    this.name = name;
    this.decisionFunction = decisionFunction;
  }

  classify(dataPoint: any): any {
    /**
     * Check for issues
     */
    if (!this.trueNode || !this.falseNode) {
      throw("Incomplete Tree: nodes aren't built out");
    }
    return this.decisionFunction(dataPoint) ? this.trueNode.classify(dataPoint) : this.falseNode.classify(dataPoint);
  }
}

interface TreeOptions {
  treeDepth: number;
  threshold: number;
  randomFeaturePercent: number;
}

const standardOptions = {
  treeDepth: 15,
  threshold: .1,
  randomFeaturePercent: 1
};

class Tree {
  treeDepth: number;
  threshold: number;
  randomFeaturePercent: number;
  hasDesiredAttribute: any;
  rootNode: TreeNode;
  branchingNodes: TreeNode[];

  constructor(branchingNodes: TreeNode[], data: any[], hasDesiredAttribute: any, options: any = standardOptions) {
    const treeOptions = { ...standardOptions, options };
    this.treeDepth = treeOptions.treeDepth;
    this.threshold = treeOptions.threshold;
    this.randomFeaturePercent = treeOptions.randomFeaturePercent;
    this.hasDesiredAttribute = hasDesiredAttribute;
    this.branchingNodes = branchingNodes;
    /**
     * Choose root node first
     */
    this.rootNode = this.createTreeNode(branchingNodes, data);

    /**
     * Run recursive function to create branches
     */
    this.createBranches(this.rootNode, data, 1);
  }

  /**
   * Determine branches based on percentage correct
   * @param node
   * @param data
   * @param curDepth
   */
  createBranches(node: TreeNode, data: any[], curDepth: number) {
    let leftData: any[] = [];
    let rightData: any[] = [];
    data.forEach(point => {
      if (node.decisionFunction(point)) {
        leftData.push(point)
      } else {
        rightData.push(point);
      }
    });

    /**
     * Now determine if left or right gives more desirable results
     */
    const leftWins = leftData.filter(point => this.hasDesiredAttribute(point)).length;
    const leftLosses = leftData.length - leftWins;
    const rightWins = rightData.filter(point => this.hasDesiredAttribute(point)).length;
    const rightLosses = rightData.length = rightWins;
    const gLeft = this.giniImpurity(leftWins, leftLosses);
    const gRight = this.giniImpurity(rightWins, rightLosses);

    /**
     * End conditions
     */
    if (curDepth >= this.treeDepth || (gLeft < this.threshold && gRight < this.threshold)) {
      if (leftWins / leftData.length >= rightWins / rightData.length) {
        /**
         * Left is true predictor
         */
        node.trueNode = new LeafNode(true);
        node.falseNode = new LeafNode(false);
      } else {
        /**
         * Right is true predictor
         */
        node.trueNode = new LeafNode(false);
        node.falseNode = new LeafNode(true);
      }
      return;
    }
    /**
     * Check thresholds for continuing on only one branch
     */
    if (gLeft < this.threshold) {
      if (leftWins > leftLosses) {
        node.trueNode = new LeafNode(true);
      } else {
        node.trueNode = new LeafNode(false);
      }
      this.branch(node, rightData, false, curDepth + 1);
      return;
    }
    if (gRight < this.threshold) {
      if (rightWins > rightLosses) {
        node.falseNode = new LeafNode(true);
      } else {
        node.falseNode = new LeafNode(false);
      }
      this.branch(node, leftData, true, curDepth + 1);
      return;
    }

    /**
     * Recursively Create new nodes if no end condition
     */
    this.branch(node, leftData, true, curDepth + 1);
    this.branch(node, rightData, false, curDepth + 1);
  }

  /**
   * Predicts the class (true or false) given a data point
   * @param dataPoint
   */
  classify(dataPoint: any) {
    return this.rootNode.classify(dataPoint);
  }

  /**
   * Creates a branch off of the original node with a subset of data to
   * the left or the right
   * @param originalNode
   * @param data
   * @param toLeft
   * @param depth
   */
  branch(originalNode: TreeNode, data: any[], toLeft: boolean, depth: number) {
    const newNode = this.createTreeNode(randomSubselection(this.branchingNodes, this.randomFeaturePercent), data);
    if (toLeft) {
      originalNode.trueNode = newNode;
    } else {
      originalNode.falseNode = newNode;
    }
    this.createBranches(newNode, data, depth);
  }

  /**
   * Determines the best branching node to use based on gini impurity
   * and creates a new TreeNode from it
   * @param branchingNodes
   * @param data
   */
  createTreeNode(branchingNodes: TreeNode[], data: any[]) {
    let minNodeIndex = 0;
    let impurity = 1;
    const nodeImpurities = branchingNodes.map(node => this.nodeGiniImpurity(node, data));
    nodeImpurities.forEach((nodeImpurity, index) => {
      if (nodeImpurity < impurity) {
        impurity = nodeImpurity;
        minNodeIndex = index;
      }
    });
    const nodeClone = branchingNodes[minNodeIndex];
    return new TreeNode(nodeClone.decisionFunction, nodeClone.name);
  }

  nodeGiniImpurity(node: TreeNode, data: any[]) {
    let leftData: any[] = [];
    let rightData: any[] = [];
    data.forEach(point => {
      if (node.decisionFunction(point)) {
        leftData.push(point)
      } else {
        rightData.push(point);
      }
    });
    const leftWins = leftData.filter(point => this.hasDesiredAttribute(point)).length;
    const leftLosses = leftData.length - leftWins;
    const rightWins = rightData.filter(point => this.hasDesiredAttribute(point)).length;
    const rightLosses = rightData.length = rightWins;
    return this.averageGiniImpurity(leftWins, leftLosses, rightWins, rightLosses);
  }

  averageGiniImpurity(leftWins: number, leftLosses: number, rightWins: number, rightLosses: number) {
    const gLeft = this.giniImpurity(leftWins, leftLosses);
    const gRight = this.giniImpurity(rightWins, rightLosses);
    const total = leftWins + leftLosses + rightWins + rightLosses;
    return gLeft * ((leftWins + leftLosses) / total) + gRight * ((rightWins + rightLosses) / total);
  }

  /**
   * Calculate gini
   * @param p1 count for win class after split
   * @param p2 count for loss class after split
   */
  giniImpurity(p1: number, p2: number) {
    const total = p1 + p2;
    return 1 - ((p1 / total)^2 + (p2 / total)^2);
  }

  printTree() {
    /**
     * Create a JSON for nodes
     */
    const jsonTree = this.rootNode;
    /**
     * Stringify JSON
     */
    console.log(JSON.stringify(jsonTree));
  }
}

export default Tree;