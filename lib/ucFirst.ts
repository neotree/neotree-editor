const ucFirst = (string: string) => `${string || ''}`.charAt(0).toUpperCase() + `${string || ''}`.slice(1);

export default ucFirst;
