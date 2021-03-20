// ****************************************************************************************
// *
// *  Generate a random date within the last given number of months.
// *  Run "npm run generate --months=1 --number=100" to get generate test files
// *
// ****************************************************************************************
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
const generateData = async (months, numOfRecords) => {
  months = months ? months : 2;
  let res = [];
  for (let i = 0; i < numOfRecords; i++) {
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

exports.generator = generateData;
