const {
  applicationContext,
  testPdfDoc,
} = require('../test/createTestApplicationContext');
const {
  CONTACT_TYPES,
  COUNTRY_TYPES,
  SERVICE_INDICATOR_TYPES,
} = require('../entities/EntityConstants');
const {
  getContactPrimary,
  getContactSecondary,
} = require('../entities/cases/Case');
const {
  MOCK_CASE,
  MOCK_CASE_WITH_SECONDARY_OTHERS,
} = require('../../test/mockCase');
const {
  updatePetitionerInformationInteractor,
} = require('./updatePetitionerInformationInteractor');
const { PARTY_TYPES, ROLES } = require('../entities/EntityConstants');
const { User } = require('../entities/User');
const { UserCase } = require('../entities/UserCase');
jest.mock('./addCoversheetInteractor');
const { addCoverToPdf } = require('./addCoversheetInteractor');

describe('update petitioner contact information on a case', () => {
  let mockUser;
  let mockCase;
  const PRIMARY_CONTACT_ID = '661beb76-f9f3-40db-af3e-60ab5c9287f6';
  const SECONDARY_CONTACT_ID = '56387318-0092-49a3-8cc1-921b0432bd16';

  const userData = {
    name: 'administrator',
    role: ROLES.docketClerk,
    userId: '6805d1ab-18d0-43ec-bafb-654e83405416',
  };

  const mockPetitioners = [
    {
      address1: '989 Division St',
      address2: 'Lights out',
      city: 'Somewhere',
      contactId: PRIMARY_CONTACT_ID,
      contactType: CONTACT_TYPES.primary,
      countryType: COUNTRY_TYPES.DOMESTIC,
      email: 'test@example.com',
      name: 'Test Primary Petitioner',
      phone: '1234567',
      postalCode: '12345',
      state: 'TN',
      title: 'Executor',
    },
    {
      address1: '789 Division St',
      address2: 'Apt B',
      city: 'Somewhere',
      contactId: SECONDARY_CONTACT_ID,
      contactType: CONTACT_TYPES.secondary,
      countryType: COUNTRY_TYPES.DOMESTIC,
      name: 'Test Secondary Petitioner',
      phone: '1234568',
      postalCode: '12345',
      state: 'TN',
      title: 'Executor',
    },
  ];

  const basePractitioner = {
    barNumber: 'PT1234',
    email: 'practitioner1@example.com',
    name: 'Test Practitioner',
    representing: [mockPetitioners[0].contactId],
    role: ROLES.privatePractitioner,
    serviceIndicator: SERVICE_INDICATOR_TYPES.SI_ELECTRONIC,
    userId: '898bbe4b-84ee-40a1-ad05-a1e2e8484c72',
  };

  beforeAll(() => {
    addCoverToPdf.mockResolvedValue({
      pdfData: testPdfDoc,
    });

    applicationContext.getCurrentUser.mockImplementation(
      () => new User(mockUser),
    );
    applicationContext
      .getPersistenceGateway()
      .getDownloadPolicyUrl.mockReturnValue({
        url: 'https://www.example.com',
      });

    applicationContext.getUseCaseHelpers().addExistingUserToCase = jest
      .fn()
      .mockImplementation(({ caseEntity }) => caseEntity);
  });

  beforeEach(() => {
    mockUser = userData;
    mockCase = { ...MOCK_CASE, petitioners: mockPetitioners };
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockImplementation(() => mockCase);
  });

  it('updates case even if no change of address or phone is detected', async () => {
    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: getContactPrimary(mockCase),
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitioner,
    });

    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
  });

  it('throws an error if contactSecondary is required for the party type and is not valid', async () => {
    await expect(
      updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: getContactPrimary(mockCase),
        contactSecondary: {
          countryType: COUNTRY_TYPES.DOMESTIC,
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitionerSpouse,
      }),
    ).rejects.toThrow('Case entity was invalid');

    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).not.toHaveBeenCalled();
  });

  it('updates petitioner contact when primary contact info changes and serves the notice created', async () => {
    const mockNumberOfPages = 999;
    applicationContext
      .getUseCaseHelpers()
      .countPagesInDocument.mockReturnValue(mockNumberOfPages);

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: {
        ...getContactPrimary(MOCK_CASE),
        address1: 'changed address',
      },
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitioner,
    });

    const autoGeneratedDocument = applicationContext
      .getPersistenceGateway()
      .updateCase.mock.calls[0][0].caseToUpdate.docketEntries.find(
        d => d.documentType === 'Notice of Change of Address',
      );
    expect(
      applicationContext.getUseCaseHelpers().countPagesInDocument,
    ).toHaveBeenCalled();
    expect(autoGeneratedDocument).toMatchObject({
      isAutoGenerated: true,
      isFileAttached: true,
      numberOfPages: mockNumberOfPages,
    });
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().sendServedPartiesEmails,
    ).toHaveBeenCalled();
  });

  it('ensures updates to fields with null values are persisted', async () => {
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitionerSpouse,
      petitioners: mockPetitioners,
      privatePractitioners: [],
    };

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: {
        address1: '989 Division St',
        // removed address2
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        name: 'Test Primary Petitioner',
        phone: '1234568',
        postalCode: '12345',
        state: 'TN',
        title: 'Executor',
      },
      contactSecondary: {
        address1: '789 Division St',
        // removed address2
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        name: 'Test Secondary Petitioner',
        phone: '1234567',
        postalCode: '12345',
        state: 'TN',
        title: 'Executor',
      },
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitionerSpouse,
    });

    const {
      caseToUpdate,
    } = applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0];
    expect(getContactPrimary(caseToUpdate).address2).toBeUndefined();

    expect(getContactSecondary(caseToUpdate).address2).toBeUndefined();
  });

  it('sets filedBy to undefined on notice of change docket entry', async () => {
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitionerSpouse,
      petitioners: mockPetitioners,
      privatePractitioners: [],
    };

    const result = await updatePetitionerInformationInteractor(
      applicationContext,
      {
        contactPrimary: mockPetitioners[0],
        contactSecondary: {
          ...mockPetitioners[1],
          address1: 'A Changed Street',
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitionerSpouse,
      },
    );

    const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
      d => d.eventCode === 'NCA',
    );

    expect(noticeOfChangeDocketEntryWithWorkItem.filedBy).toBeUndefined();
  });

  it('updates petitioner contact when secondary contact info changes and does not generate or serve a notice if the secondary contact was not previously present', async () => {
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitioner,
      petitioners: [mockPetitioners[0]],
    };

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: mockPetitioners[0],
      contactSecondary: mockPetitioners[1],
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitionerSpouse,
    });

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().sendServedPartiesEmails,
    ).not.toHaveBeenCalled();
  });

  it('updates petitioner contact when secondary contact info changes, serves the generated notice, and returns the download URL for the paper notice if the contactSecondary was previously on the case', async () => {
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitionerSpouse,
      petitioners: mockPetitioners,
    };

    const result = await updatePetitionerInformationInteractor(
      applicationContext,
      {
        contactPrimary: mockPetitioners[0],
        contactSecondary: {
          ...mockPetitioners[1],
          address1: 'A Changed Street',
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitionerSpouse,
      },
    );

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().sendServedPartiesEmails,
    ).toHaveBeenCalled();
    expect(result.paperServicePdfUrl).toEqual('https://www.example.com');
  });

  it('does not serve a document or return a paperServicePdfUrl if only the serviceIndicator changes but not the address', async () => {
    const result = await updatePetitionerInformationInteractor(
      applicationContext,
      {
        contactPrimary: {
          ...mockPetitioners[0],
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      },
    );

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().sendServedPartiesEmails,
    ).not.toHaveBeenCalled();
    expect(result.paperServicePdfUrl).toBeUndefined();
  });

  it('does not update contactPrimary email if it is passed in', async () => {
    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: {
        ...mockPetitioners[0],
        email: 'test2@example.com',
      },
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitioner,
    });

    expect(
      getContactPrimary(
        applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0]
          .caseToUpdate,
      ).email,
    ).not.toBe('test2@example.com');
  });

  it('should update contactSecondary.inCareOf when the party type is petitioner and deceased spouse and it is passed in', async () => {
    mockCase = MOCK_CASE_WITH_SECONDARY_OTHERS;
    const mockInCareOf = 'Tina Belcher';

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: {
        ...getContactPrimary(MOCK_CASE_WITH_SECONDARY_OTHERS),
        email: 'test@example.com',
      },
      contactSecondary: {
        ...getContactSecondary(MOCK_CASE_WITH_SECONDARY_OTHERS),
        inCareOf: mockInCareOf,
      },
      docketNumber: MOCK_CASE_WITH_SECONDARY_OTHERS.docketNumber,
      partyType: PARTY_TYPES.petitionerDeceasedSpouse,
    });

    const updatedPetitioners = applicationContext.getPersistenceGateway()
      .updateCase.mock.calls[0][0].caseToUpdate.petitioners;

    const updatedContactSecondary = updatedPetitioners.find(
      p => p.contactType === CONTACT_TYPES.secondary,
    );
    expect(updatedContactSecondary.inCareOf).toBe(mockInCareOf);
  });

  it('should add a contactSecondary when one was not initially on the case', async () => {
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitioner,
      petitioners: [MOCK_CASE.petitioners[0]],
    };

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: getContactPrimary(MOCK_CASE),
      contactSecondary: getContactSecondary(MOCK_CASE_WITH_SECONDARY_OTHERS),
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitionerDeceasedSpouse,
    });

    const updatedPetitioners = applicationContext.getPersistenceGateway()
      .updateCase.mock.calls[0][0].caseToUpdate.petitioners;

    const updatedContactSecondary = updatedPetitioners.find(
      p => p.contactType === CONTACT_TYPES.secondary,
    );
    expect(updatedContactSecondary).toMatchObject({
      address1: getContactSecondary(MOCK_CASE_WITH_SECONDARY_OTHERS).address1,
    });
  });

  it('throws an error when attempting to update contactPrimary.countryType to an invalid value', async () => {
    await expect(
      updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: {
          ...mockPetitioners[0],
          countryType: 'alien',
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      }),
    ).rejects.toThrow('The Case entity was invalid');

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).not.toHaveBeenCalled();
  });

  it('throws an error if the user making the request does not have permission to edit petition details', async () => {
    mockUser.role = ROLES.petitioner;

    await expect(
      updatePetitionerInformationInteractor(applicationContext, {
        docketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow('Unauthorized for editing petition details');
  });

  it("should not generate a notice of change address when contactPrimary's information is sealed", async () => {
    mockUser.role = ROLES.docketClerk;
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitioner,
      petitioners: [
        {
          address1: '456 Center St',
          city: 'Somewhere',
          contactType: CONTACT_TYPES.primary,
          countryType: COUNTRY_TYPES.DOMESTIC,
          email: 'test@example.com',
          isAddressSealed: true,
          name: 'Test Petitioner',
          phone: '1234567',
          postalCode: '12345',
          state: 'TN',
          title: 'Executor',
        },
      ],
    };

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: {
        address1: '456 Center St TEST',
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'test@example.com',
        isAddressSealed: true,
        name: 'Test Petitioner',
        phone: '1234567',
        postalCode: '12345',
        state: 'TN',
        title: 'Executor',
      },
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitioner,
    });

    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda,
    ).not.toHaveBeenCalled();
  });

  it("should not generate a notice of change address when contactSecondary's information is sealed", async () => {
    mockUser.role = ROLES.docketClerk;
    mockCase = {
      ...MOCK_CASE,
      partyType: PARTY_TYPES.petitionerSpouse,
      petitioners: [
        mockPetitioners[0],
        { ...mockPetitioners[1], isAddressSealed: true },
      ],
    };

    await updatePetitionerInformationInteractor(applicationContext, {
      contactPrimary: mockPetitioners[0],
      contactSecondary: {
        ...mockPetitioners[1],
        address1: 'A Changed Street',
      },
      docketNumber: MOCK_CASE.docketNumber,
      partyType: PARTY_TYPES.petitionerSpouse,
    });

    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda,
    ).not.toHaveBeenCalled();
  });

  describe('createWorkItemForChange', () => {
    it('should create a work item for the NCA when the primary contact is unrepresented', async () => {
      mockUser.role = ROLES.docketClerk;
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitioner,
        petitioners: [mockPetitioners[0]],
        privatePractitioners: [
          {
            ...basePractitioner,
            representing: ['6c5b79e0-2429-4ebc-8e9c-483d0282d4e0'],
          },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: {
            ...mockPetitioners[0],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitioner,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Primary Petitioner',
      );
    });

    it('should create a work item for the NCA when the secondary contact is unrepresented', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitionerSpouse,
        petitioners: mockPetitioners,
        privatePractitioners: [
          {
            ...basePractitioner,
            representing: ['51c088b0-808e-4189-bb99-e76546befbfe'],
          },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: mockPetitioners[0],
          contactSecondary: {
            ...mockPetitioners[1],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitionerSpouse,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Secondary Petitioner',
      );
    });

    it('should NOT create a work item for the NCA when the primary contact is represented and their service preference is NOT paper', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitioner,
        petitioners: [mockPetitioners[0]],
        privatePractitioners: [
          { ...basePractitioner, representing: [PRIMARY_CONTACT_ID] },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: {
            ...mockPetitioners[0],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitioner,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).not.toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeUndefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Primary Petitioner',
      );
    });

    it('should NOT create a work item for the NCA when the secondary contact is represented and their service preference is NOT paper', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitionerSpouse,
        petitioners: mockPetitioners,
        privatePractitioners: [
          { ...basePractitioner, representing: [SECONDARY_CONTACT_ID] },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: mockPetitioners[0],
          contactSecondary: {
            ...mockPetitioners[1],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitionerSpouse,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).not.toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeUndefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Secondary Petitioner',
      );
    });

    it('should create a work item for the NCA when the primary contact is represented and their service preference is paper', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitioner,
        petitioners: [mockPetitioners[0]],
        privatePractitioners: [
          { ...basePractitioner, representing: [PRIMARY_CONTACT_ID] },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: {
            ...mockPetitioners[0],
            address1: 'A Changed Street',
            serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitioner,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Primary Petitioner',
      );
    });

    it('should create a work item for the NCA when the secondary contact is represented and their service preference is paper', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitionerSpouse,
        petitioners: mockPetitioners,
        privatePractitioners: [
          { ...basePractitioner, representing: [SECONDARY_CONTACT_ID] },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: mockPetitioners[0],
          contactSecondary: {
            ...mockPetitioners[1],
            address1: 'A Changed Street',
            serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitionerSpouse,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Secondary Petitioner',
      );
    });

    it('should create a work item for the NCA when the primary contact is represented and a private practitioner on the case requests paper service', async () => {
      mockCase = {
        ...MOCK_CASE,
        partyType: PARTY_TYPES.petitionerSpouse,
        petitioners: mockPetitioners,
        privatePractitioners: [
          {
            ...basePractitioner,
            representing: [SECONDARY_CONTACT_ID],
            serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
          },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: mockPetitioners[0],
          contactSecondary: {
            ...mockPetitioners[1],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitionerSpouse,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Secondary Petitioner',
      );
    });

    it('should create a work item for the NCA when the secondary contact is represented and a IRS practitioner on the case requests paper service', async () => {
      mockCase = {
        ...MOCK_CASE,
        irsPractitioners: [
          {
            barNumber: 'PT1234',
            email: 'practitioner1@example.com',
            name: 'Test IRS Practitioner',
            role: ROLES.irsPractitioner,
            serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
            userId: '899bbe4b-84ee-40a1-ad05-a1e2e8484c72',
          },
        ],
        partyType: PARTY_TYPES.petitionerSpouse,
        petitioners: mockPetitioners,
        privatePractitioners: [
          {
            ...basePractitioner,
            representing: [SECONDARY_CONTACT_ID],
          },
        ],
      };

      const result = await updatePetitionerInformationInteractor(
        applicationContext,
        {
          contactPrimary: mockPetitioners[0],
          contactSecondary: {
            ...mockPetitioners[1],
            address1: 'A Changed Street',
          },
          docketNumber: MOCK_CASE.docketNumber,
          partyType: PARTY_TYPES.petitionerSpouse,
        },
      );

      const noticeOfChangeDocketEntryWithWorkItem = result.updatedCase.docketEntries.find(
        d => d.eventCode === 'NCA',
      );

      expect(
        applicationContext.getPersistenceGateway()
          .saveWorkItemAndAddToSectionInbox,
      ).toHaveBeenCalled();
      expect(noticeOfChangeDocketEntryWithWorkItem.workItem).toBeDefined();
      expect(noticeOfChangeDocketEntryWithWorkItem.additionalInfo).toBe(
        'for Test Secondary Petitioner',
      );
    });
  });

  describe('update contactPrimary email', () => {
    it('should call the update addExistingUserToCase use case helper if the contactPrimary is adding an email address', async () => {
      await updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: {
          ...mockPetitioners[0],
          email: 'changed-email@example.com',
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      });

      expect(
        applicationContext.getUseCaseHelpers().addExistingUserToCase,
      ).toHaveBeenCalled();

      expect(
        applicationContext.getPersistenceGateway().updateCase,
      ).toHaveBeenCalledTimes(1);
    });

    it('should not call the update addExistingUserToCase use case helper if the contactPrimary is unchanged', async () => {
      await updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: mockPetitioners[0],
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      });

      expect(
        applicationContext.getUseCaseHelpers().addExistingUserToCase,
      ).not.toHaveBeenCalled();
    });

    it('should not call createUserForContactPrimary when the new email address is not available', async () => {
      applicationContext
        .getPersistenceGateway()
        .isEmailAvailable.mockImplementation(() => false);

      applicationContext
        .getUseCaseHelpers()
        .addExistingUserToCase.mockImplementation(() => new UserCase(mockCase));

      applicationContext
        .getUseCaseHelpers()
        .createUserForContactPrimary.mockImplementation(
          () => new UserCase(mockCase),
        );

      await updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: {
          ...mockPetitioners[0],
          email: 'changed-email@example.com',
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      });

      expect(
        applicationContext.getUseCaseHelpers().createUserForContactPrimary,
      ).not.toHaveBeenCalled();

      expect(
        applicationContext.getUseCaseHelpers().addExistingUserToCase,
      ).toHaveBeenCalled();
    });

    it('should call createUserForContactPrimary when the new email address is available', async () => {
      applicationContext
        .getPersistenceGateway()
        .isEmailAvailable.mockImplementation(() => true);

      applicationContext
        .getUseCaseHelpers()
        .addExistingUserToCase.mockImplementation(() => new UserCase(mockCase));

      applicationContext
        .getUseCaseHelpers()
        .createUserForContactPrimary.mockImplementation(
          () => new UserCase(mockCase),
        );

      await updatePetitionerInformationInteractor(applicationContext, {
        contactPrimary: {
          ...mockPetitioners[0],
          email: 'changed-email@example.com',
        },
        docketNumber: MOCK_CASE.docketNumber,
        partyType: PARTY_TYPES.petitioner,
      });

      expect(
        applicationContext.getUseCaseHelpers().createUserForContactPrimary,
      ).toHaveBeenCalled();

      expect(
        applicationContext.getUseCaseHelpers().addExistingUserToCase,
      ).not.toHaveBeenCalled();
    });
  });
});
