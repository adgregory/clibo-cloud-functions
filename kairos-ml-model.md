# Kairos Machine Learning Model

### Graphical Explanation of model

![Graphical Explanation ML Model](/Images/ml-model.jpg)

### Explanation of each variable:
* **Temperature:** Current air temperature at the geolocation selected.
*	**Precipitations:** An hourly maximum probability of precipitation.
*	**Humidity:** Relative humidity of the air, which is defined as the ratio of the amount of water vapor in the air to the amount of vapor required to bring the air to saturation at a constant temperature.
*	**Type:** Defined as the type of establishment that is being tested.
*	**Local Impact:** How often the establishment is normally visited.
*	**Pay day:** How close the day studied is to the day of payment.
*	**Holiday:** Depends upon if the day studied is a holiday or not.
*	**Day:** Differs with the weekday.
*	**Hour:** Differs with the hour studied in a specific day, in a specific establishment type. 
*	**People Area:** Maximum number of people that can be in an establishment depending upon its area.


### Variable Importance
![Variable Importance](/Images/importance.jpg)


### Metrics of chosen model.

| Metric | Cross Validation Score |
| ------ | ------ |
| Explained Variance | 0.989 |
| MAE | 0.019 |
| MSE | 0.001 |
| MedAE | 0.015 |
| RMSE | 0.027 |
| R2 | 0.989 |
