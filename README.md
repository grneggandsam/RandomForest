# Random Forest

A basic random forest implementation in typescript

To run the start function `yarn && yarn start`


## How It Works?

The random forest algorithm is a machine learning algorithm which creates many different 
decision trees while relying on random subsets of training data for each tree.

index.ts consumes the FreezeSurvivalForest in this case. FreezeSurvivalForest creates a Forest
using the data and applying the `hasDesiredAttribute` method for the data its ingesting.

For more information about random forests: https://towardsdatascience.com/understanding-random-forest-58381e0602d2