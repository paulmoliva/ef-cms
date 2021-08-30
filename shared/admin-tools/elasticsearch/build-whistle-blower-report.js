const createApplicationContext = require('../../../web-api/src/applicationContext');
const {
  getWhistleBlowerReport,
} = require('../../src/persistence/elasticsearch/getWhistleblowerCases');

const applicationContext = createApplicationContext({});

(async () => {
  // get the whistleblower cases
  const allCases = await getWhistleBlowerReport({ applicationContext });
  console.log(['Docket Number', 'Status'].join(','));
  allCases.forEach(row => {
    console.log([row.docketNumber, row.status].join(','));
  });
})();
