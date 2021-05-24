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