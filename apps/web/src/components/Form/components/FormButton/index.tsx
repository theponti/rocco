type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  isLoading?: boolean;
};
const FormButton = ({ children, ...props }: FormButtonProps) => {
  return (
    <button className="btn btn-primary border-none" type="submit" {...props}>
      {props.isLoading ? (
        <span className="loading-spinner text-black" />
      ) : (
        children
      )}
    </button>
  );
};

export default FormButton;
