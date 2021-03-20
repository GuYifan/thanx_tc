const { updateUserRecords, checkForEligibleUsers } = require('./index');
const TEST_DATA_RECORD_BY_DATE = {
  '2020-11-30': { 1: 51.9, 2: 50, 3: 9.99 },
  '2020-12-04': { 1: 29.1, 2: 40, 3: 9.99 },
  '2021-01-01': { 1: 32.4, 2: 30, 3: 9.99 },
  '2021-02-02': { 1: 41.2, 2: 20, 3: 9.99 },
  '2021-03-01': { 1: 32.1, 2: 10, 3: 9.99 },
  '2021-03-20': { 1: 32.1, 2: 10, 3: 9.99 },
};

test('Should identify eligible VIP users if there is any.', () => {
  amountByUser = { 1: 100, 2: 200.56, 3: 312.45, 4: 34.85, 5: 150 };
  threshold = 150;
  vipUsers = [];
  checkForEligibleUsers(amountByUser, threshold, vipUsers);
  expect(vipUsers.length).toBe(3);
  expect(vipUsers.sort()).toEqual(['2', '3', '5']);
});

test('Should return an empty list when there is no eligible users.', () => {
  amountByUser = { 1: 100, 2: 200.56, 3: 312.45, 4: 34.85, 5: 150 };
  threshold = 400;
  vipUsers = [];
  checkForEligibleUsers(amountByUser, threshold, vipUsers);
  expect(vipUsers.length).toBe(0);
  expect(vipUsers.sort()).toEqual([]);
});

test('Should aggregate user purchase amount within 1 month when number of months is 1', () => {
  let begin, current;
  let months = 1;
  let recordByDate = TEST_DATA_RECORD_BY_DATE;
  let amountByUser = {};
  let result;
  for (const date in TEST_DATA_RECORD_BY_DATE) {
    if (!begin) {
      begin = date;
    }
    current = date;
    result = updateUserRecords(
      begin,
      current,
      months,
      recordByDate,
      amountByUser
    );
    begin = result.begin;
    amountByUser = result.amountByUser;
  }
  expect(result.begin).toBe('2021-03-01');
  expect(amountByUser['1'].toPrecision(3)).toBe('64.2');
  expect(amountByUser['2']).toBe(20);
  expect(amountByUser['3']).toBe(19.98);
});

test('Should aggregate user purchase amount within 2 months when number of months is 2', () => {
  let begin, current;
  let months = 2;
  let recordByDate = TEST_DATA_RECORD_BY_DATE;
  let amountByUser = {};
  let result;
  for (const date in TEST_DATA_RECORD_BY_DATE) {
    if (!begin) {
      begin = date;
    }
    current = date;
    result = updateUserRecords(
      begin,
      current,
      months,
      recordByDate,
      amountByUser
    );
    begin = result.begin;
    amountByUser = result.amountByUser;
  }
  expect(result.begin).toBe('2021-02-02');
  expect(amountByUser['1']).toBe(105.4);
  expect(amountByUser['2']).toBe(40);
  expect(amountByUser['3']).toBe(29.97);
});

test('Should aggregate user purchase amount within all months when number of months is 12', () => {
  let begin, current;
  let months = 12;
  let recordByDate = TEST_DATA_RECORD_BY_DATE;
  let amountByUser = {};
  let result;
  for (const date in TEST_DATA_RECORD_BY_DATE) {
    if (!begin) {
      begin = date;
    }
    current = date;
    result = updateUserRecords(
      begin,
      current,
      months,
      recordByDate,
      amountByUser
    );
    begin = result.begin;
    amountByUser = result.amountByUser;
  }
  expect(result.begin).toBe('2020-11-30');
  expect(amountByUser['1']).toBe(218.8);
  expect(amountByUser['2']).toBe(160);
  expect(amountByUser['3'].toPrecision(4)).toBe('59.94');
});
