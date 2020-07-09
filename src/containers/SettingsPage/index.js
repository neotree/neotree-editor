import React from 'react';
import copy from '@/constants/copy/settings';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle, setNavSection } from '@/contexts/app';
import LazyComponent from '@/components/LazyComponent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useParams, useHistory } from 'react-router-dom';

const IndexPage = LazyComponent(() => import('./IndexPage'));
const Users = LazyComponent(() => import('./Users'));

const sections = [
  { value: '', label: 'Settings', component: IndexPage },
  { value: 'users', label: 'Users', component: Users }
];

const SettingsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);
  setNavSection('settings');
  
  const history = useHistory();
  const { section } = useParams();

  const getActiveSection = () => {
    let activeSection = 0;
    if (section) {
      sections.forEach((s, i) => {
        if (s.value === section) activeSection = i;
      });
    }
    return activeSection;
  };

  const [activeSection, setActiveSection] = React.useState(getActiveSection());

  const Component = sections[activeSection].component;

  return (
    <>
      <div>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          centered
          value={activeSection}
          onChange={(e, val) => {
            setActiveSection(val);
            let newSection = (sections[val] || sections[0]).value;
            newSection = newSection ? `/${newSection}` : '';
            history.push(`/settings${newSection}`);
          }}
        >
          {sections.map((s, i) => (
            <Tab
              value={i}
              key={`section${i}`}
              label={s.label}
            />
          ))}
        </Tabs>

        <Card>
            <CardContent>
              <Component />
            </CardContent>          
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
