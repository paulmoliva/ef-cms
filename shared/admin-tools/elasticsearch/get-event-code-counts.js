const {
  computeDate,
  dateStringsCompared,
} = require('../../src/business/utilities/DateHandler');
const { getClient } = require('../../../web-api/elasticsearch/client');
const environmentName = process.argv[2] || 'exp1';

let allPetitions = false;
const getAllItemsForCode = async eventCode => {
  if (allPetitions) return allPetitions;
  const esClient = await getClient({ environmentName });
  const allItems = [];
  const responseQueue = [];

  const res = await esClient.search({
    _source: ['docketNumber.S', 'createdAt.S', 'isPaper.BOOL'],
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                'eventCode.S': eventCode,
              },
            },
            {
              range: {
                'receivedAt.S': {
                  gte: '2021-01-01T05:00:00.000Z',
                  lte: '2021-12-01T05:00:00.000Z',
                },
              },
            },
          ],
        },
      },
    },
    index: 'efcms-docket-entry',
    scroll: '60s',
    size: 5000,
  });

  responseQueue.push(res);
  while (responseQueue.length) {
    const body = responseQueue.shift();

    // collect the titles from this response
    body.hits.hits.forEach(function (hit) {
      allItems.push(hit['_source']);
    });

    // check to see if we have collected all of the quotes
    if (body.hits.total.value === allItems.length) {
      return allItems;
    }

    // get the next response if there are more quotes to fetch
    responseQueue.push(
      await esClient.scroll({
        scroll: '60s',
        scrollId: body['_scroll_id'],
      }),
    );
  }
};

const getDocketEntriesForCode = async ({ eventCode, gte, lte }) => {
  const esClient = await getClient({ environmentName });
  const query = {
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                'eventCode.S': eventCode,
              },
            },
            {
              range: {
                'receivedAt.S': {
                  gte,
                  lte,
                },
              },
            },
          ],
        },
      },
    },
    index: 'efcms-docket-entry',
    size: 10000,
  };
  const results = await esClient.search(query);
  // console.log(`Total: ${results.hits.total.value}`);
  return results.hits.hits;
};

const getCounts = async ({ eventCode, isPaper, month, showCases = false }) => {
  const gte = computeDate({ day: 1, month, year: 2021 });
  const lte = computeDate({ day: 1, month: month + 1, year: 2021 });

  if (isPaper) {
    const petitions = await getDocketEntriesForCode({ eventCode, gte, lte });
    const paperPetitions = petitions.filter(
      p => p['_source']?.isPaper?.BOOL === isPaper,
    );

    if (showCases) {
      paperPetitions.forEach(p => {
        console.log(
          `${p['_source'].receivedAt.S},${p['_source'].docketNumber.S}`,
        );
      });
    }

    return paperPetitions.length;
  } else {
    allPetitions = await getAllItemsForCode(eventCode);
    allPetitions = allPetitions.filter(p => !p.isPaper?.BOOL);
    const filteredPetitions = allPetitions.filter(
      p =>
        dateStringsCompared(p.createdAt.S, gte) >= 0 &&
        dateStringsCompared(p.createdAt.S, lte) < 0,
    );

    if (showCases) {
      filteredPetitions.forEach(p => {
        console.log(`${p.createdAt?.S},${p.docketNumber?.S}`);
      });
    }
    return filteredPetitions.length;
  }
};

(async () => {
  const results = {};
  const eventCode = process.argv[3] || 'LEA';
  const showCases = process.argv[4] === 'true';

  for (let month = 1; month <= 12; month++) {
    results[month] = {
      isElectronic: await getCounts({
        eventCode,
        isPaper: false,
        month,
        showCases,
      }),
      isPaper: await getCounts({ eventCode, isPaper: true, month, showCases }),
    };
  }
  console.log(results);
})();