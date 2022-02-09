import { randomSubselection } from "../Util/util";

class LeafNode {
  isTrue: boolean;

  constructor(isTrue: boolean) {
    this.isTrue = isTrue;
  }

  classify() {
    return this.isTrue;
  }

  encode(): any {
    return {i: -1, t: this.isTrue ? 1 : 0};
  }
}

export class TreeNode {
  name?: string;
  index?: number;
  decisionFunction: any;
  trueNode?: TreeNode | LeafNode;
  falseNode?: TreeNode | LeafNode;

  constructor(decisionFunction: any, name?: string, index?: number) {
    this.name = name;
    this.index = index;
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

  encode(): any {
    return {
      i: this.index,
      l: this?.trueNode?.encode(),
      r: this?.falseNode?.encode()
    };
  }
}

interface TreeOptions {
  treeDepth: number;
  threshold: number;
  randomFeaturePercent: number;
}

/**
 * Options to use when training a tree
 * treeDepth determines the depth of the tree (how many levels of branches)
 * threshold determines how close we must be with percentages correct to terminate a branch
 * randomFeaturePercent determines what percentage of the training data each tree is trained on (when randomly grabbed)
 */
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
  rootNode?: TreeNode;
  branchingNodes?: TreeNode[];

  constructor(hasDesiredAttribute: any, options: TreeOptions = standardOptions) {
    const treeOptions = { ...standardOptions, options };
    this.treeDepth = treeOptions.treeDepth;
    this.threshold = treeOptions.threshold;
    this.randomFeaturePercent = treeOptions.randomFeaturePercent;
    this.hasDesiredAttribute = hasDesiredAttribute;
  }

  /**
   * Method to grow the tree "organically" using branching nodes and data
   */
  grow(branchingNodes: TreeNode[], data: any[]) {
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
    if (!this.rootNode) {
      throw("Root node not found. Please grow tree.");
    }
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
    return new TreeNode(nodeClone.decisionFunction, nodeClone.name, minNodeIndex);
  }

  /**
   * Method of determining which branch to take when training
   * See https://www.geeksforgeeks.org/gini-impurity-and-entropy-in-decision-tree-ml/
   * @param node
   * @param data
   */
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

  encodeTree() {
    return this?.rootNode?.encode();
  }

  /**
   * Recursive function to decode a branch given an encoding
   * @param encodedBranch
   * @param parentNode
   * @param toLeft
   */
  decodeBranch(encodedBranch: any, parentNode: TreeNode, toLeft: boolean) {
    if (!this.branchingNodes) {
      throw("Branching nodes not set before decoding");
    }
    /**
     * Determine if leaf node
     */
    if (encodedBranch.i == -1) {
      const node = new LeafNode(encodedBranch.t == 1);
      if (toLeft) {
        parentNode.trueNode = node;
      } else {
        parentNode.falseNode = node;
      }
      return;
    }
    const nodeClone = this.branchingNodes[encodedBranch.i];
    const node = new TreeNode(nodeClone.decisionFunction, nodeClone.name, encodedBranch.i);
    if (toLeft) {
      parentNode.trueNode = node;
    } else {
      parentNode.falseNode = node;
    }
    this.decodeBranch(encodedBranch.l, node, true);
    this.decodeBranch(encodedBranch.r, node, false);
  }

  /**
   * Function for interpreting the forest created by the training algorithm
   * @param branchingNodes
   * @param encodedTree
   */
  decodeTree(branchingNodes: TreeNode[], encodedTree: any) {
    this.branchingNodes = branchingNodes;
    /**
     * First decode root node
     */
    const nodeClone = branchingNodes[encodedTree.i];
    const rootNode = new TreeNode(nodeClone.decisionFunction, nodeClone.name, encodedTree.i);

    /**
     * next recursively grow the branches out
     */
    this.decodeBranch(encodedTree.l, rootNode, true);
    this.decodeBranch(encodedTree.r, rootNode, false);

    /**
     * Assign root node
     */
    this.rootNode = rootNode;
  }
}

export default Tree;