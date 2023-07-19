const Loader = (props) => {
  return (
    <div {...props}>
      <p>{props.children}</p>
    </div>
  );
};

export default Loader;
