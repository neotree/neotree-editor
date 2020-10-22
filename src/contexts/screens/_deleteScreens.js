import * as api from '@/api/screens';

export default function deleteScreens(screens = []) {
  return new Promise((resolve, reject) => {
    const { screens: _screens } = this.state;

    if (!screens.length) return;

    this.setState({ deletingScreens: true });

    const done = (e, rslts) => {
      const updatedScreens = _screens.filter(s => screens.map(s => s.screenId).indexOf(s.screenId) < 0)
        .map((s, i) => ({ ...s, position: i + 1, }));
      this.setState({
        deleteScreensError: e,
        deletingScreens: false,
        ...(e ? null : { screens: updatedScreens }),
      });
      this.updateScreens(updatedScreens.map(s => ({ screenId: s.screenId, scriptId: s.scriptId, position: s.position, })));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteScreens({ screens })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
