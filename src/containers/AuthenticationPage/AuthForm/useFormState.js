import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthPageContext } from '../Context';
import _disableAction from './_disableAction';
import _onAuthenticate from './_onAuthenticate';

export default (authType) => {
  const history = useHistory();
  const ctx = useAuthPageContext();

  const disableAction = _disableAction(authType, ctx);
  const onAuthenticate = _onAuthenticate(authType, { ...ctx, disableAction, });
  const checkEmailRegistration = () => !disableAction() && ctx.checkEmailRegistration(ctx);

  const { state: { emailRegistration } } = ctx;

  React.useEffect(() => {
    if (emailRegistration.userId && !emailRegistration.activated) {
      history.push('/sign-up');
    } else {
      history.push('/sign-in');
    }
  }, [emailRegistration]);

  return {
    ...ctx,
    disableAction,
    onAuthenticate,
    checkEmailRegistration,
  };
};
