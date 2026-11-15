type ButtonProps = {
  onClick: () => void;
};

const Button = ({ onClick, ...rest }: ButtonProps) => {
  return (
    <button onClick={onClick} {...rest}>
      Click me!
    </button>
  );
};

export default Button;
