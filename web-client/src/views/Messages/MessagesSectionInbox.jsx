import {
  ALPHABETICALLY_ASCENDING,
  ALPHABETICALLY_DESCENDING,
  CHRONOLOGICALLY_ASCENDING,
  CHRONOLOGICALLY_DESCENDING,
} from './sortConstants';
import { ASCENDING, DESCENDING } from '../../presenter/presenterConstants';
import { Button } from '../../ustc-ui/Button/Button';
import { SortableColumnHeaderButton } from '../../ustc-ui/SortableColumnHeaderButton/SortableColumnHeaderButton';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const MessagesSectionInbox = connect(
  {
    formattedMessages: state.formattedMessages.messages,
    sortSectionMessagesSequence: sequences.sortSectionMessagesSequence,
    tableSort: state.tableSort,
  },
  function MessagesSectionInbox({
    formattedMessages,
    sortSectionMessagesSequence,
    tableSort,
  }) {
    const hasMessages = formattedMessages.length > 0;
    return (
      <>
        <table className="usa-table ustc-table subsection">
          <thead>
            <tr>
              <th aria-label="Docket Number" className="small" colSpan="2">
                <SortableColumnHeaderButton
                  ascText={CHRONOLOGICALLY_ASCENDING}
                  defaultSort={DESCENDING}
                  descText={CHRONOLOGICALLY_DESCENDING}
                  hasRows={hasMessages}
                  sortField="docketNumber"
                  tableSort={tableSort}
                  title="Docket No."
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>

              <th className="medium">
                <SortableColumnHeaderButton
                  ascText={CHRONOLOGICALLY_ASCENDING}
                  defaultSort={ASCENDING}
                  descText={CHRONOLOGICALLY_DESCENDING}
                  hasRows={hasMessages}
                  sortField="createdAt"
                  tableSort={tableSort}
                  title="Received"
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>
              <th>
                <SortableColumnHeaderButton
                  ascText={ALPHABETICALLY_ASCENDING}
                  defaultSort={ASCENDING}
                  descText={ALPHABETICALLY_DESCENDING}
                  hasRows={hasMessages}
                  sortField="subject"
                  tableSort={tableSort}
                  title="Message"
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>
              <th>Case Title</th>
              <th>Case Status</th>
              <th>To</th>
              <th>From</th>
              <th className="small">Section</th>
            </tr>
          </thead>
          {formattedMessages.map(message => {
            return (
              <tbody key={message.messageId}>
                <tr key={message.messageId}>
                  <td aria-hidden="true" className="focus-toggle" />
                  <td className="message-queue-row small">
                    {message.docketNumberWithSuffix}
                  </td>
                  <td className="message-queue-row small">
                    <span className="no-wrap">
                      {message.createdAtFormatted}
                    </span>
                  </td>
                  <td className="message-queue-row message-subject">
                    <div className="message-document-title">
                      <Button
                        link
                        className="padding-0"
                        href={message.messageDetailLink}
                      >
                        {message.subject}
                      </Button>
                    </div>
                    <div className="message-document-detail">
                      {message.message}
                    </div>
                  </td>
                  <td className="message-queue-row max-width-25">
                    {message.caseTitle}
                  </td>
                  <td className="message-queue-row">{message.caseStatus}</td>
                  <td className="message-queue-row to">{message.to}</td>
                  <td className="message-queue-row from">{message.from}</td>
                  <td className="message-queue-row small">
                    {message.fromSection}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
        {formattedMessages.length === 0 && <div>There are no messages.</div>}
      </>
    );
  },
);
