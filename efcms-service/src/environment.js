exports.get = key => {
  return {
    DOCUMENTS_TABLE: process.env.STAGE ? `efcms-documents-${process.env.STAGE}` : 'efcms-documents-local',
  }[key];
}

exports.entityPersistenceLookup = key => {
  switch (key) {
    case 'files':
      return 'awsPersistence';
    case 'documents':
      return 'awsPersistence';
    default:
      throw new Error('unsupported key');
  }
};