/* global $APP */

export const defaultState = {
  documentTitle: '',
  navSection: null,
  appInitialised: true,
  initialisingApp: false,
  ...(() => { try { return $APP; } catch (e) { return null; } })()
};
