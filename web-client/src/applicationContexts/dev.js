import persistenceGateway from '../../../shared/src/persistence/awsPersistenceGateway';

import createCase from '../../../shared/src/business/useCases/createCaseProxy';
import getCase from '../../../shared/src/business/useCases/getCaseProxy';
import getCasesByStatus from '../../../shared/src/business/useCases/getCasesByStatusProxy';
import getCasesByUser from '../../../shared/src/business/useCases/getCasesByUserProxy';
import getUser from '../../../shared/src/business/useCases/getUser';
import updateCase from '../../../shared/src/business/useCases/updateCaseProxy';
import uploadCasePdfs from '../../../shared/src/business/useCases/uploadCasePdfs';

/**
 * Context for the dev environment
 */
const applicationContext = {
  getBaseUrl: () => {
    return 'http://localhost:3000/v1';
  },
  getPersistenceGateway: () => {
    return persistenceGateway;
  },
  getUseCases: () => {
    return {
      createCase,
      getCase,
      getCasesByStatus,
      getCasesByUser,
      getUser,
      updateCase,
      uploadCasePdfs,
    };
  },
};

export default applicationContext;
