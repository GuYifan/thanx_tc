// ********
// *       Run "npm run test --filename=data.txt --threshold=100 --months=2" to get VIP users
// *       Run "npm run generate --months=1" to get generate test files
// ********
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const DAYS_IN_A_MONTH = 30;

const main = async (filename, threshold, months) => {
  // set default values if not given. can't set in signature because always given
  threshold = threshold ? threshold : 200;
  months = months ? months : 2;

  try {
    // Step 1: Extract data
    let purchaseRecords = JSON.parse(
      await readFile(path.join(path.dirname(''), `./${filename}`))
    );
    // Step 2: Transform data to be organized by date
    // sort by date
    purchaseRecords.sort((a, b) => {
      return new Date(a.date) < new Date(b.date) ? -1 : 1;
    });

    // this structure is used to store the purchase record by dates
    // i.e. {'2020-12-20' : {1: 50.23, 2: 40.24}} means on 2020-12-20
    // user 1 has bought for 50.23, user 2 has bought for 40.24
    let recordByDate = {};
    let userIds = [];
    for (const index in purchaseRecords) {
      let user = purchaseRecords[index].user;
      let amount = purchaseRecords[index].amount;
      let date = purchaseRecords[index].date;
      if (!recordByDate[date]) {
        recordByDate[date] = {};
      }
      recordByDate[date][user] = amount;
    }
    // DEMO
    // console.log(recordByDate);

    // Step 3: Process data - sliding window to keep track amount spent
    // by each user within the threshold period
    let vipUsers = [];
    let amountByUser = {};
    // use as two pointers for the sliding window
    let begin, current;
    // use sliding window strategy to go through each date
    // in the meantime calculate the total amount spent by each user
    // for the last ${threshold} months
    // also check if the user reaches the threshold in each iteration
    for (const date in recordByDate) {
      if (!begin) {
        begin = date;
      }
      current = date;
      // Step 3.a: update amount by user
      let result = updateUserRecords(
        begin,
        current,
        months,
        recordByDate,
        amountByUser
      );
      begin = result.begin;
      amountByUser = result.amountByUser;
      // console.log('begin is ' + JSON.stringify(begin, null, 2));
      // console.log('current is ' + current);
      // DEMO
      // console.log('amountByUser is ' + JSON.stringify(amountByUser, null, 2));
      // Step 3.b: check for eligible users
      checkForEligibleUsers(amountByUser, threshold, vipUsers);
      // DEMO
      // console.log(vipUsers);
    }
    return vipUsers;
  } catch (e) {
    throw e;
  }
};

const updateUserRecords = (
  begin,
  current,
  months,
  recordByDate,
  amountByUser
) => {
  // console.log('months is ' + months);
  // console.log('monthDiff(current, begin) is ' + monthDiff(current, begin));
  if (monthDiff(current, begin) > months) {
    // if the time difference between current and begin is bigger than the threshold
    // then need to substract the amount spent between begin and the new begin date
    let amountToSubtract = {};
    for (const date in recordByDate) {
      if (new Date(date) < new Date(begin)) {
        continue;
      }
      // find the oldest date within threshold months to current date
      if (monthDiff(current, date) <= months) {
        begin = date;
        break;
      }
      // calculate the amount to subctract for each user
      for (user in recordByDate[date]) {
        amountToSubtract[user] = amountToSubtract[user]
          ? parseFloat(amountToSubtract[user]) +
            parseFloat(recordByDate[date][user])
          : parseFloat(recordByDate[date][user]);
      }
    }
    for (const user in amountToSubtract) {
      amountByUser[user] =
        parseFloat(amountByUser[user]) - parseFloat(amountToSubtract[user]);
    }
  }
  // add to amountByUser
  let currentRecords = recordByDate[current];
  for (const user in currentRecords) {
    amountByUser[user] = amountByUser[user]
      ? parseFloat(amountByUser[user]) + parseFloat(currentRecords[user])
      : parseFloat(currentRecords[user]);
  }

  return { begin, amountByUser };
};

const monthDiff = (current, begin) => {
  return (
    Math.round((new Date(current) - new Date(begin)) / (1000 * 60 * 60 * 24)) /
    DAYS_IN_A_MONTH
  );
};

const checkForEligibleUsers = (amountByUser, threshold, vipUsers) => {
  for (user in amountByUser) {
    if (threshold <= amountByUser[user] && !vipUsers.includes(user)) {
      vipUsers.push(user);
    }
  }
};

// ==================================================================
// generate a random date within the last given number of months
const randomDate = (months) => {
  let start = new Date();
  start.setMonth(start.getMonth() - months);
  let end = new Date();
  let res = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return res;
};

// generate purchase data for the given number of months
const generateData = async (months) => {
  months = months ? months : 2;
  let res = [];
  for (let i = 0; i < 100; i++) {
    res.push({
      user: Math.floor(1 + Math.random() * 10),
      amount:
        Math.floor(10 + Math.random() * 50) +
        parseFloat(Math.random().toPrecision(1)),
      date: randomDate(months).toISOString().split('T')[0],
    });
  }

  const writeFile = util.promisify(fs.writeFile);

  try {
    await writeFile(
      path.join(path.dirname(''), './test_data.txt'),
      JSON.stringify(res, null, 2)
    );
    console.log('Purcahse data saved to ./test_data.txt');
  } catch (err) {
    throw err;
  }
};

exports.handler = main;
exports.generator = generateData;
