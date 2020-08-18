import { formatDateIfToday } from './formattedWorkQueue';
import { state } from 'cerebral';

export const getFormattedMessages = ({
  applicationContext,
  caseDetail,
  messages,
}) => {
  const formattedCaseMessages = messages
    .map(message => {
      let formattedAttachments;

      if (caseDetail) {
        formattedAttachments = applicationContext
          .getUtilities()
          .formatAttachments({
            attachments: message.attachments || [],
            caseDetail,
          });
      }

      return {
        ...message,
        attachments: formattedAttachments || message.attachments,
        completedAtFormatted: formatDateIfToday(
          message.completedAt,
          applicationContext,
        ),
        createdAtFormatted: formatDateIfToday(
          message.createdAt,
          applicationContext,
        ),
      };
    })
    .sort((a, b) => {
      return a.createdAt.localeCompare(b.createdAt);
    });

  const inProgressMessages = formattedCaseMessages.filter(
    message => !message.isRepliedTo,
  );
  const completedMessages = formattedCaseMessages.filter(
    message => message.isCompleted,
  );

  completedMessages.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  return {
    completedMessages,
    inProgressMessages,
    messages: formattedCaseMessages,
  };
};

export const formattedMessages = (get, applicationContext) => {
  const { completedMessages, messages } = getFormattedMessages({
    applicationContext,
    messages: get(state.messages) || [],
  });

  const currentMessageBox = get(state.messageBoxToDisplay.box);

  if (currentMessageBox === 'outbox') {
    messages.reverse();
  }

  return {
    completedMessages,
    messages,
  };
};
