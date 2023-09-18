import fs from "fs";
import moment, {Moment} from "moment";
import Tree, {TreeNode} from "../Tree/Tree";
import {StockData} from "../Implementations/StocksForest/StocksBranchNodes";

export const MONTH_FORMAT = 'YYYY-MM-DD';

export const formatDate = (date: Moment): string => {
  return date.format(MONTH_FORMAT);
};

/**
 * Function that returns a random sub-selection of an array
 * @param data
 * @param percent
 */
export const randomSubselection = (data: any, percent: number) => {
  const subsetLength = Math.floor(data.length * percent);
  if (subsetLength < 1) {
    const randomIndex = Math.floor(Math.random() * (data.length - 1));
    return [data[randomIndex]];
  }
  const returnData = [];
  for(let i=0; i<subsetLength; i++) {
    const randomIndex = Math.floor(Math.random() * (data.length - 1));
    returnData.push(data[randomIndex]);
  }
  return returnData;
};

export const csvToJson = (csvString: string): any[] => {
  const csvArray = csvString.split('\n');
  const objectKeys = csvArray[0].split(',');
  const output: any[] = [];
  csvArray.forEach((item, idx) => {
    if (idx === 0) {
      return;
    }
    const jsonObject: any = {};
    item.split(',').forEach((csvValue, csvIndex) => {
      jsonObject[objectKeys[csvIndex]] = csvValue;
    });
    output.push(jsonObject);
  });
  return output;
};

export function convertDataFromCSV(fileName: string) {
  fs.readFile(`${process.cwd()}/src/Fixtures/${fileName}.csv`, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return
    }
    const jsonData = csvToJson(data);
    const stringifiedData = JSON.stringify(jsonData);

    fs.writeFile(`${process.cwd()}/src/Fixtures/${fileName}.json`, stringifiedData, err => {
      if (err) {
        throw(err);
      }
    })
  })
}

export function saveDataAsFile(data: any, fileName: string) {
  const stringifiedData = JSON.stringify(data);
  fs.writeFile(`${process.cwd()}/src/Fixtures/${fileName}.json`, stringifiedData, err => {
    if (err) {
      throw(err);
    }
  })
}

export function getDataFromFile(fileName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(`${process.cwd()}/src/Fixtures/${fileName}.json`, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return
      }
      const returnData = JSON.parse(data);
      resolve(returnData);
    })
  });
}

interface Mapping {
  [mapKey: string]: string | any;
}

interface FileOptions {
  name: string;
  map: Mapping;
}

export async function aggregateMonthlyDataFromDates(startDate: string, endDate: string, files: FileOptions[], outputName: string) {
  const dates = [];
  const datesObj: any = {};
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);
  let curDate = momentStartDate;
  while (curDate.isBefore(momentEndDate)) {
    dates.push(curDate);
    datesObj[formatDate(curDate)] = {};
    curDate = curDate.add(1, 'month');
    if (dates.length > 100000) {
      throw(new Error("Infinite Loop on Dates! Something wrong has happened"))
    }
  }
  console.log('Built Date Object, now ingesting data');

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i].name;
    const fileMap = files[i].map;
    let dataPoints: any[] | void = await getDataFromFile(fileName);
    console.log('Got data from file: ', fileName);
    if (!Array.isArray(dataPoints)) {
      console.log('Data is not an array! Its: ', typeof dataPoints);
      continue;
    }
    // sort data by date
    dataPoints = dataPoints.filter(dataPoint => {
      const date = moment(dataPoint['date']);
      return !!(datesObj[formatDate(date)]);
    }).sort((dataPointA, dataPointB) => {
      return moment(dataPointA['date']).isBefore(moment(dataPointB['date'])) ? -1 : 1;
    });
    for (let j = 0; j < dataPoints.length; j++) {
      const dataPoint = dataPoints[j];
      const date = moment(dataPoint['date']);
      if (datesObj[formatDate(date)]) {
        Object.entries(fileMap).forEach(([fileKey, fileMappedKey]) => {
          if (typeof fileMappedKey == 'function') {
            // @ts-ignore
            datesObj[formatDate(date)][fileKey] = fileMappedKey(dataPoint, j,dataPoints);
          } else if (dataPoint[fileKey]) {
            datesObj[formatDate(date)][fileMappedKey] = dataPoint[fileKey];
          }
        });
      }
    }
  }

  // @ts-ignore
  const finalData = Object.entries(datesObj).map(([isoDate, item]) => ({...item, date: isoDate}));
  console.log('Finished ingesting data, now saving');
  saveDataAsFile(finalData, outputName);
}

export const spreadTreeNodes = (min: number, max: number, divisions: number, name: string): TreeNode[] => {
  const treeNodes: TreeNode[] = [];
  if (min > max) {
    return treeNodes
  }

  const step = (max - min) / divisions;
  let idx = 0;
  for (let val = min; val <= max; val += step) {
    treeNodes.push(new TreeNode((dataPoint: any, weights: number[]) => {
      return parseFloat(dataPoint[name]) <= weights[0];
    }, `${name}${idx}`, {weights: [parseFloat(val.toFixed(3))]}));
    idx++;
  }
  return treeNodes;
};

const getDataRange = (data: any[], name: string) => {
  let range = [parseFloat(data[0][name]), parseFloat(data[0][name])];
  data.forEach((dataPoint: any) => {
    if (parseFloat(dataPoint[name]) < range[0]) {
      range[0] = parseFloat(dataPoint[name]);
    }
    if (parseFloat(dataPoint[name]) > range[1]) {
      range[1] = parseFloat(dataPoint[name]);
    }
  });
  return range;
};

const randomWeightedTreeNodes = (range: number[], divisions: number, name: string) => {
  const treeNodes: TreeNode[] = [];
  if (range[0] > range[1]) {
    return treeNodes
  }
  for (let i = 0; i < divisions; i++) {
    const weight = parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(3));
    treeNodes.push(new TreeNode((dataPoint: any, weights: number[]) => {
      return parseFloat(dataPoint[name]) <= weights[0];
    }, `${name}-${i}`, { weights: [weight] }));
  }
  return treeNodes;
};

export const spreadRandomWeightedTreeNodes = (data: any[], divisions: number, name: string): TreeNode[] => {
  const range = getDataRange(data, name);
  return randomWeightedTreeNodes(range, divisions, name);
};

export const spreadRandomWeightedTreeNodesByIdx = (data: any[], divisions: number, name: string, idxRange = [1, 4]): TreeNode[] => {
  let treeNodes: TreeNode[] = [];
  for (let i = idxRange[0]; i <= idxRange[1]; i++) {
    treeNodes = [...treeNodes, ...spreadRandomWeightedTreeNodes(data, divisions, `${name}-${i}`)]
  }
  return treeNodes;
};

export const spreadRandomWeightedDeltaTreeNodes = (data: any[], divisions: number, name: string, maxDeltaIdx = 3): TreeNode[] => {
  let range = [parseFloat(data[0][name]), parseFloat(data[0][name])];
  data.forEach((dataPoint: any) => {
    if (parseFloat(dataPoint[name]) < range[0]) {
      range[0] = parseFloat(dataPoint[name]);
    }
    if (parseFloat(dataPoint[name]) > range[1]) {
      range[1] = parseFloat(dataPoint[name]);
    }
  });
  const treeNodes: TreeNode[] = [];
  if (range[0] > range[1]) {
    return treeNodes
  }
  for (let i = 0; i < divisions; i++) {
    const weight = parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(3));
    // Make sure we have even chances with each int
    const deltaIdx = Math.floor(Math.random() * (maxDeltaIdx + .99));
    treeNodes.push(new TreeNode((
      dataPoint: any,
      weights: number[],
      data: any[],
      dataPointIdx: number
    ): boolean => {
      if (!data) {
        return false;
      }
      if (dataPointIdx - weights[1] < 0) {
        return false;
      }
      return (parseFloat(dataPoint[name]) - data[dataPointIdx - weights[1]]) <= weights[0];
    }, `${name}${i}`, { weights: [weight, deltaIdx] }));
  }
  return treeNodes;
};

export const createDelta = (dataIdx: number, dataPoints: any, attributeKey: string, distance: number = 1) => {
  return (parseFloat(dataPoints[dataIdx][attributeKey]) - parseFloat(dataPoints[dataIdx - distance][attributeKey])).toFixed(3);
};

export const createDeltaDef = (dataIdx: number, dataPoints: any, attributeKey: string, distance: number = 1) => {
  if (dataIdx - distance < 0) {
    return "0.0";
  }
  return createDelta(dataIdx, dataPoints, attributeKey, distance);
};

export const createDeltaPer = (
  dataIdx: number,
  dataPoints: any,
  attributeKey: string,
  multiplier: number = 1.0,
  distance: number = 1
) => {
  if (dataIdx - distance < 0) {
    return "0.0";
  }
  return (multiplier * (parseFloat(dataPoints[dataIdx][attributeKey]) - parseFloat(dataPoints[dataIdx - distance][attributeKey])) / parseFloat(dataPoints[dataIdx - distance][attributeKey])).toFixed(3);
};

export const spreadDeltaDefIdx = (
  objKey: string,
  attributeKey: string,
  range = [1, 4]
) => {
  const deltaDefObj: any = {};
  for (let i = range[0]; i <= range[1]; i++) {
    deltaDefObj[objKey + `-${i}`] = (dataPoint: any, dataIdx: number, dataPoints: any[]) => createDeltaDef(dataIdx, dataPoints, attributeKey, i);
  }
  return deltaDefObj;
};

export const spreadDeltaPercentageIdx = (
  objKey: string,
  attributeKey: string,
  multiplier: number = 1,
  range = [1, 4],
) => {
  const deltaDefObj: any = {};
  for (let i = range[0]; i <= range[1]; i++) {
    deltaDefObj[objKey + `-${i}`] = (
      dataPoint: any,
      dataIdx: number,
      dataPoints: any[]
    ) => createDeltaPer(dataIdx, dataPoints, attributeKey, multiplier, i);
  }
  return deltaDefObj;
};
