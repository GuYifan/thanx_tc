# thanx

## General Idea

To identify users who are eligible to become VIP based on the purchase records is done in 3 steps, and they are retrieving data, transform data to be aggregated by dates, then use a "sliding window" strategy to calculate the amount each user spent in this period and identify users whose amount meets the threshold.

1. **Step 1 - Retrieve Data**

⋅⋅⋅Read data from a given text file.

2. **Step 2 - Transform Data**

⋅⋅⋅Iterate through the raw data and aggregate by date. As shown in the example below, each key is the date and the value is each user's purchase amount on that date.

Example:
```
{'2020-12-02': { '1': 22.2 },
'2020-12-30': { '1': 38.8, '2': 18.1, '3': 13.3, '4': 52.3, '5': 52.3 },
'2021-01-15': { '2': 50.6, '6': 11.8 },
'2021-02-12': { '1': 50.8, '3': 54.2, '4': 25.5, '6': 40.7, '6': 50.8 }}
```

3. **Step 3 - Calculate Each User's Purchase Total Amount within the Given Period**

⋅⋅⋅Iterate through data from step 2 using a sliding window strategy. The sliding window represents the given period (e.g. 2 months). Also, keep an record of each user's total spend amount for this period as the example below, which means in this period from '2021-01-10' to '2021-01-10' user 1 spent $221.5 and so on.

```
begin: '2020-12-02'
end: '2020-12-30'
{"1": 61,
  "2": 18.1,
  "3": 13.3,
  "4": 52.3,
  "5": 52.3}
```

⋅⋅⋅First, Anchor the beginning of the window to the first date and move forward the end of the window in each iteration.
⋅⋅⋅As the end of the window moves forward, if the distance between begin and end becomes bigger than the given period, then move begin forward as well, and update the user spent amount by subtracting the amount spend between the old begin and the new begin.
⋅⋅⋅Lastly, in each iteration, check if any user's total amount reaches the threshold. If so, add the user to the result list.


## How to Run
```npm run test --filename=data.txt --threshold=100 --months=2```
The default value for threshold is 200 if not given.
The default value for months is 2 if not given.

## How to Generate Test Data
```npm run generate --months=1 --number=100```
The generated file will be saved to ```./test_data.txt``` in the same directory.
The default value for months is 2 if not given.
The default value for nubmer of records is 100 if not given.

## Unit Tests
```npm run jest```
