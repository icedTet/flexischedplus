import * as React from "react";
import { ComponentProps, CSSProperties, useEffect, useState } from "react";
interface TextBoxProps {
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  helperText?: string;
  error?: boolean;
  transparent?: boolean;
  overrideColor?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeModified?: (
    e: React.ChangeEvent<HTMLInputElement>,
    setCancelState: (state: boolean) => void
  ) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
  placeholder?: string;
  inputID?: string;
  classNamesParent?: string;
  classNamesInput?: string;
  type?: string;
  inputMode?:
    | "text"
    | "search"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | undefined;
  value?: string;
  disabled?: boolean;
  icon?: (props: ComponentProps<any>) => JSX.Element;
  ringColor?: string;
  label?: string;
}
export const TextBox = (props: TextBoxProps) => {
  const [input, setInput] = useState(props.value || "");
  useEffect(() => {
    setInput(props.value || "");
  }, [props.value]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let setcancel = false;
    const setCancelState = (state: boolean) => {
      setcancel = state;
    };
    if (props.onChangeModified) {
      props.onChangeModified(e, setCancelState);
    }
    if (props.onChange && !setcancel) {
      props.onChange(e);
    }
    if (!setcancel) {
      setInput(e.target.value);
    }
  };
  const Icon = props.icon;
  return (
    <div className={`flex flex-col gap-1 ${props.classNamesParent || ""}`}>
      {props.label && (
        <>
          <span
            className={`m-1 ${
              props.disabled
                ? `text-gray-600 dark:text-gray-400`
                : `text-gray-500 dark:text-gray-200`
            }`}
          >
            {props.label}
          </span>
        </>
      )}
      <div className={`flex-row pt-0 ${props.classNamesParent || ""} relative`}>
        {Icon && (
          <Icon className="absolute left-0 z-10 w-6 h-6 ml-3 transform -translate-y-1/2 top-1/2" />
        )}
        <input
          disabled={props.disabled || false}
          value={input}
          id={props.inputID}
          onChange={handleChange}
          onKeyDown={props.onKeyDown}
          inputMode={props.inputMode}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          type={props.type || "text"}
          placeholder={props.placeholder || ""}
          className={`${props.classNamesInput || ""} ${
            Icon ? "px-12" : "px-3"
          } py-3 rounded-xl dark:shadow-neutral-700 ${
            props.error && `!border-rose-500 dark:!border-rose-500 border`
          } ${
            props.overrideColor ||
            `dark:bg-gray-700 focus:dark:bg-gray-750 bg-white disabled:bg-gray-150 disabled:shadow-inner`
          } ${
            props.transparent &&
            "!bg-opacity-0 opacity-70 backdrop-blur-md !drop-shadow-none focus:!bg-opacity-40 "
          } focus:dark:drop-shadow-xl dark:text-gray-200 dark:drop-shadow-md drop-shadow-sm hover:drop-shadow-md focus:drop-shadow-md focus:border-purple-400 border-transparent transition-all duration-300 !border-4 !outline-none focus:!outline`}
          style={
            {
              "--tw-ring-color": props.ringColor || "",
            } as CSSProperties
          }
        />
        {props.helperText && (
          <span
            className={`${
              props.error && `!text-rose-600`
            } flex flex-row items-center mt-1 ${
              props.disabled
                ? `text-gray-600 dark:text-gray-400`
                : `text-gray-700 dark:text-gray-200`
            } `}
          >
            {props.helperText}
          </span>
        )}
      </div>
    </div>
  );
};
export default TextBox;
