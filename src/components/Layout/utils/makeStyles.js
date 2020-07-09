import makeStyles from '@material-ui/core/styles/makeStyles';
import { useLayoutContext } from '../Context';

export default styles => {
  const useStyles = makeStyles(styles);
  return (props = {}) => {
    const { state } = useLayoutContext();
    return useStyles({ _layout: state, ...props });
  };
};
