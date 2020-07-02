import LazyComponent from '@/components/LazyComponent';
import PageLoader from './PageLoader';

export default (load, opts = {}) => LazyComponent(load, {
  LoaderComponent: PageLoader,
  ...opts,
});
