import React from 'react';
import Header from './Header';
import  MessageList from  './MessageList';
import NavToggle from './NavToggle';
import SiteLogo from './SiteLogo';
import UserDropdown from './UserDropdown';
import ImportTask from './ImportTask';
import ProgressModal from './ProgressModal/ProgressModal';
import ContactsPanel from "./ContactsPanel";


const AppHeader = () => {
  return (
    <Header>
      <NavToggle />
      <SiteLogo />
      <Header.Right>
        <ImportTask />
        <ProgressModal />
        <ContactsPanel />
        <MessageList />
        <UserDropdown />
      </Header.Right>
    </Header>
  );
};

export default AppHeader;
