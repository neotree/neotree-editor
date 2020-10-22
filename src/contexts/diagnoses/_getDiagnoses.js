import * as api from '@/api/diagnoses';

export default function getDiagnoses(payload) {
  return new Promise((resolve, reject) => {
    this.setState({ loadingDiagnoses: true });

    const done = (e, data) => {
      this.setState({
        getDiagnosesError: e,
        ...data,
        diagnosesInitialised: true,
        loadingDiagnoses: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.getDiagnoses(payload)
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
