import { Field } from "formik";
import styles from "./Input.module.css";

type Props = {
  error?: any;
  label?: string;
  name: string;
  type: string;
};

function Input({ error, label, name, type, ...props }: Props) {
  return (
    <>
      {label && (
        <label htmlFor={name} className="label hidden">
          {label}
        </label>
      )}
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">What is your name?</span>
          <span className="label-text-alt">Alt label</span>
        </label>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <Field name={name} type={type} {...props} placeholder="Foo bar" />
      {error && (
        <span className={styles.errorText}>{error.regex as string}</span>
      )}
    </>
  );
}

export default Input;
