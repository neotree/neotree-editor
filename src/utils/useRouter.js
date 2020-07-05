import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import queryString from 'query-string';

export default () => {
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();

  const queryStringParsed = queryString.parse(location.search);

  const objectToQueryString = (obj = {}) => `?${queryString.stringify({
    ...queryStringParsed,
    ...obj
  })}`;

  return {
    location,
    history,
    match,
    queryStringParsed,
    objectToQueryString
  };
};
