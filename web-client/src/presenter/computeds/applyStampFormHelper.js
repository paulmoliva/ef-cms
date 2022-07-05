import { state } from 'cerebral';

/**
 * gets the apply stamp form helper fields
 *
 * @param {Function} get the cerebral get function
 * @param {object} applicationContext the application context
 * @returns {object} apply stamp form helper fields
 */
export const applyStampFormHelper = get => {
  const form = get(state.form);
  const { customOrderText } = form;

  const CUSTOM_ORDER_MAX_LENGTH = 60;
  const customOrderTextCharacterCount = customOrderText?.length
    ? CUSTOM_ORDER_MAX_LENGTH - customOrderText?.length
    : CUSTOM_ORDER_MAX_LENGTH;

  return {
    customOrderTextCharacterCount,
  };
};
