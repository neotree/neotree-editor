import React from 'react';
import LazyComponent from 'LazyComponent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import { useParams, useHistory } from 'react-router-dom';

const IndexPage = LazyComponent(() => import('./IndexPage'));
const Users = LazyComponent(() => import('./Users'));

const sections = [
  { value: '', label: 'Settings', component: IndexPage },
  { value: 'users', label: 'Users', component: Users }
];

const Settings = () => {
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
      <Paper>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          value={activeSection}
          onChange={(e, val) => {
            setActiveSection(val);
            let newSection = (sections[val] || sections[0]).value;
            newSection = newSection ? `/${newSection}` : '';
            history.push(`/dashboard/settings${newSection}`);
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

        <br />

        <div style={{ padding: 10, minHeight: 100 }}>
          <Component />
        </div>
      </Paper>
    </>
  );
};

export default Settings;
