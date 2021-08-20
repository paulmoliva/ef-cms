jest.mock('./createPractitionerUser');
const { createUserRecords } = require('./createPractitionerUser');

jest.mock('../../dynamodbClientService');
const client = require('../../dynamodbClientService');

const {
  applicationContext,
} = require('../../../business/test/createTestApplicationContext');
const { createNewPractitionerUser } = require('./createNewPractitionerUser');
const { ROLES } = require('../../../business/entities/EntityConstants');

describe('createNewPractitionerUser', () => {
  it('should not log an error when creating a new cognito account for a practitioner user', async () => {
    await createNewPractitionerUser({
      applicationContext,
      user: {
        barNumber: 'tpp1234',
        name: 'Test Private Practitioner',
        pendingEmail: 'practitioner@example.com',
        role: ROLES.privatePractitioner,
        section: 'practitioner',
        userId: '123',
      },
    });

    expect(
      applicationContext.getCognito().adminCreateUser,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        UserAttributes: expect.arrayContaining([
          {
            Name: 'email_verified',
            Value: 'True',
          },
          {
            Name: 'email',
            Value: 'practitioner@example.com',
          },
          {
            Name: 'custom:role',
            Value: ROLES.privatePractitioner,
          },
          {
            Name: 'name',
            Value: 'Test Private Practitioner',
          },
        ]),
        Username: 'practitioner@example.com',
      }),
    );
  });

  describe('updateUserRecords', () => {
    beforeEach(() => {
      client.put = jest.fn().mockReturnValue(null);
    });

    it('should put new records with uppercase name and bar number', async () => {
      const user = {
        barNumber: 'tpp1234',
        email: 'practitioner@example.com',
        name: 'Test Private Practitioner',
        role: ROLES.privatePractitioner,
        section: 'practitioner',
        userId: '123',
      };
      await createNewPractitionerUser({
        applicationContext,
        user,
      });

      expect(createUserRecords).toHaveBeenCalledWith({
        applicationContext,
        user,
        userId: user.userId,
      });
    });
  });
});
