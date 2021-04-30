const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  COUNTRY_TYPES,
  SERVICE_INDICATOR_TYPES,
} = require('../EntityConstants');
const { Petitioner } = require('./Petitioner');

describe('Petitioner', () => {
  it('should throw an error when applicationContext is not provided to the constructor', () => {
    expect(
      () =>
        new Petitioner(
          {
            address1: '1234 Some Street',
            city: 'Someplace',
            country: 'Uruguay',
            countryType: COUNTRY_TYPES.INTERNATIONAL,
            name: 'Juana Pereyra',
            phone: 'n/a',
            postalCode: '98123',
            serviceIndicator: undefined,
          },
          {},
        ),
    ).toThrow('applicationContext must be defined');
  });

  describe('validate', () => {
    it('should be false when serviceIndicator is undefined', () => {
      const entity = new Petitioner(
        {
          address1: '1234 Some Street',
          city: 'Someplace',
          country: 'Uruguay',
          countryType: COUNTRY_TYPES.INTERNATIONAL,
          name: 'Juana Pereyra',
          phone: 'n/a',
          postalCode: '98123',
          serviceIndicator: undefined,
        },
        { applicationContext },
      );

      expect(entity.isValid()).toBe(false);
      expect(entity.getFormattedValidationErrors()).toEqual({
        serviceIndicator: Petitioner.VALIDATION_ERROR_MESSAGES.serviceIndicator,
      });
    });

    it('should be true when all required fields have been provided', () => {
      const entity = new Petitioner(
        {
          address1: '1234 Some Street',
          city: 'Someplace',
          country: 'Uruguay',
          countryType: COUNTRY_TYPES.INTERNATIONAL,
          name: 'Juana Pereyra',
          phone: 'n/a',
          postalCode: '98123',
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_ELECTRONIC,
        },
        { applicationContext },
      );

      expect(entity.isValid()).toBe(true);
      expect(entity.getFormattedValidationErrors()).toEqual(null);
    });
  });
});