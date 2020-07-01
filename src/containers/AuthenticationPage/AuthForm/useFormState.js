import { useAuthPageContext } from '../Context';
import _disableAction from './_disableAction';
import _onAuthenticate from './_onAuthenticate';

export default (authType) => {
  const ctx = useAuthPageContext();
  const disableAction = _disableAction(authType, ctx);
  const onAuthenticate = _onAuthenticate(authType, { ...ctx, disableAction, });
  const checkEmailRegistration = () => !disableAction() && ctx.checkEmailRegistration(ctx);

  return {
    ...ctx,
    disableAction,
    onAuthenticate,
    checkEmailRegistration,
  };
};
