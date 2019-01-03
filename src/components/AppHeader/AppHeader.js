import React from 'react';
import Header from './Header';
import MessageList from './MessageList';
import NavToggle from './NavToggle';
import SiteLogo from './SiteLogo';
import UserDropdown from './UserDropdown';
import ImportTask from './ImportTask';
import ProgressModal from './ProgressModal/ProgressModal';
import ContactsPanel from './ContactsPanel';
import WebIMPanel from './WebIMPanel';
import LocaleSelect from './LocaleSelect';
import TemporaryStorage from './TemporaryStorage';

const AppHeader = ({ redirectPath }) => {
  return (
    <Header>
      <NavToggle />
      <SiteLogo path={redirectPath} />
      <Header.Right>
        <ImportTask />
        <ProgressModal />
        <LocaleSelect />
        <WebIMPanel />
        <MessageList />
        <TemporaryStorage />
        <UserDropdown />
      </Header.Right>
    </Header>
  );
};

export default AppHeader;
//  <WebIMPanel /> <ContactsPanel />
