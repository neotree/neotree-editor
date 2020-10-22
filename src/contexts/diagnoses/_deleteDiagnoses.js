import * as api from '@/api/diagnoses';

export default function deleteDiagnoses(diagnoses = []) {
  return new Promise((resolve, reject) => {
    const { diagnoses: _diagnoses } = this.state;

    if (!diagnoses.length) return;

    this.setState({ deletingDiagnoses: true });

    const done = (e, rslts) => {
      const updatedDiagnoses = _diagnoses.filter(s => diagnoses.map(s => s.diagnosisId).indexOf(s.diagnosisId) < 0)
        .map((s, i) => ({ ...s, position: i + 1, }));
      this.setState({
        deleteDiagnosesError: e,
        deletingDiagnoses: false,
        ...(e ? null : { diagnoses: updatedDiagnoses }),
      });
      this.updateDiagnoses(updatedDiagnoses.map(s => ({ diagnosisId: s.diagnosisId, scriptId: s.scriptId, position: s.position, })));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteDiagnoses({ diagnoses })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
