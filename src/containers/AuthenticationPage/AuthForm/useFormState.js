import { useAuthPageContext } from '../Context';
import _disableAction from './_disableAction';
import _onAuthenticate from './_onAuthenticate';
import _onVerifyEmailAddress from './_onVerifyEmailAddress';

export default (authType) => {
  const context = useAuthPageContext();
  const disableAction = _disableAction(authType, context);
  const onAuthenticate = _onAuthenticate(authType, { ...context, disableAction, });
  const onVerifyEmailAddress = _onVerifyEmailAddress({ ...context, disableAction, });

  return {
    ...context,
    disableAction,
    onAuthenticate,
    onVerifyEmailAddress,
  };
};
