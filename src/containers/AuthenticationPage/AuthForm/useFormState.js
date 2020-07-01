import { useAuthPageContext } from '../Context';
import _disableAction from './_disableAction';
import _onAuthenticate from './_onAuthenticate';
import _checkEmailRegistration from './_checkEmailRegistration';

export default (authType) => {
  const context = useAuthPageContext();
  const disableAction = _disableAction(authType, context);
  const onAuthenticate = _onAuthenticate(authType, { ...context, disableAction, });
  const checkEmailRegistration = _checkEmailRegistration({ ...context, disableAction, });

  return {
    ...context,
    disableAction,
    onAuthenticate,
    checkEmailRegistration,
  };
};
