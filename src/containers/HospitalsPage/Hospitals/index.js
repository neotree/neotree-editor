import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { useAppContext } from '@/AppContext';
import * as api from '@/api/hospitals';
import AddHospitalForm from './AddHospitalForm';
import HospitalManagerForm from './HospitalManagerForm';

const Hospitals = () => {
  const { state: { authenticatedUser, viewMode } } = useAppContext();
  const [state, _setState] = React.useState({
    hospitals: [],
    loading: false,
    form: {
      name: '',
      code: '',
    },
  });

  const setState = s => _setState(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const { hospitals } = state;

  React.useEffect(() => {
    (async () => {
      setState({ loading: true, });
      try {
        const { hospitals } = await api.getHospitals();
        setState({ hospitals: hospitals || [], loading: false, });
      } catch (e) {
        setState({ getCountriesErrors: e, loading: false, });
      }
    })();
  }, []);

  return (
    <>
      <Card>
        <CardHeader
          action={viewMode === 'view' ? null : (
            <>
              <AddHospitalForm updateState={setState} />
            </>
          )}
          title="Hospitals"
        />

        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {viewMode === 'view' ? null : <TableCell align="right">Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {hospitals.map((u, i) => {
                return (
                  <TableRow key={`hospital-${i}`}>
                    <TableCell>{u.name}</TableCell>
                    {viewMode === 'view' ? null : (
                      <TableCell align="right">
                        <HospitalManagerForm
                          hospital={u}
                          authenticatedUser={authenticatedUser}
                          updateState={setState}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default Hospitals;
