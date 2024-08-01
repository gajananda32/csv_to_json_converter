const fs = require('fs');
const { parse } = require('fast-csv');
const dotenv = require('dotenv');
const { db } = require('../../db');
dotenv.config();

const uploadCtrl = {};

uploadCtrl.csvToJsonConverter = async (req, res) => {
  try {
    const csvPath = process.env.CSV_FILE_PATH;
    let data = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(parse({ headers: true }))
        .on('data', (row) => {
          const record = {};
          for (const [key, value] of Object.entries(row)) {
            const keys = key.split('.');
            keys.reduce((acc, part, index) => {
              if (index === keys.length - 1) {
                acc[part] = value;
              } else {
                acc[part] = acc[part] || {};
              }
              return acc[part];
            }, record);
          }
          data.push(record);
        })
        .on('end', () => resolve(data))
        .on('error', (error) => reject(error));
    });

    const ageDistribution = {
      '<20': 0,
      '20-40': 0,
      '40-60': 0,
      '>60': 0,
      total: 0,
    };

   
    for (const item of data) {
      const { name, age, ...rest } = item;
      const fullName = `${name.firstName} ${name.lastName}`;
      const address = rest.address || null;
      const additionalInfo = { ...rest };
      delete additionalInfo.address;

      await db.query(
        'INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)',
        [fullName, parseInt(age, 10), address, additionalInfo]
      );

      const ageInt = parseInt(age, 10);
      if (ageInt < 20) ageDistribution['<20']++;
      else if (ageInt <= 40) ageDistribution['20-40']++;
      else if (ageInt <= 60) ageDistribution['40-60']++;
      else ageDistribution['>60']++;

      ageDistribution.total++;
    }

    // Calculate and print age distribution percentages
    const ageDistributionPercentages = {
      '<20': (ageDistribution['<20'] / ageDistribution.total) * 100,
      '20-40': (ageDistribution['20-40'] / ageDistribution.total) * 100,
      '40-60': (ageDistribution['40-60'] / ageDistribution.total) * 100,
      '>60': (ageDistribution['>60'] / ageDistribution.total) * 100,
    };

    console.log('Age-Group % Distribution');
    console.log(`< 20: ${ageDistributionPercentages['<20']}%`);
    console.log(`20 to 40: ${ageDistributionPercentages['20-40']}%`);
    console.log(`40 to 60: ${ageDistributionPercentages['40-60']}%`);
    console.log(`> 60: ${ageDistributionPercentages['>60']}%`);

    res.status(200).send({
      message: 'Data converted and report generated',
      ageDistribution: ageDistributionPercentages,
      convertedData : data

    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Could not convert the file',
    });
  }
};

module.exports = uploadCtrl;
