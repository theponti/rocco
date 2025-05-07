import styled from "@emotion/styled";
import { AlertCircle } from "lucide-react";
import {
	type InputHTMLAttributes,
	type ReactNode,
	type SyntheticEvent,
	forwardRef,
} from "react";
import { cn } from "~/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	helperText?: string;
	errorMessage?: string;
	leftAccessory?: ReactNode;
	rightAccessory?: ReactNode;
	hideLabel?: boolean;
}

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
`;

const StyledInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 1);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.has-error {
    border-color: rgba(244, 63, 94, 0.5);
    box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
  }
  
  &.with-left-accessory {
    padding-left: 2.5rem;
  }
  
  &.with-right-accessory {
    padding-right: 2.5rem;
  }
`;

const Accessory = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  
  &.left {
    left: 0.75rem;
  }
  
  &.right {
    right: 0.75rem;
  }
`;

const HelperText = styled.p`
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ErrorMessage = styled.p`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: rgba(244, 63, 94, 0.9);
`;

const Input = forwardRef<HTMLInputElement, Props>(
	(
		{
			label,
			helperText,
			errorMessage,
			leftAccessory,
			rightAccessory,
			className = "",
			hideLabel = false,
			...rest
		},
		ref,
	) => {
		function handleClick(e: SyntheticEvent<HTMLDivElement>) {
			const inputEl = (e.currentTarget as HTMLDivElement).querySelector(
				"input",
			);
			inputEl?.focus();
		}

		const hasError = Boolean(errorMessage);
		const hasLeftAccessory = Boolean(leftAccessory);
		const hasRightAccessory = Boolean(rightAccessory);
		const inputId = rest.id;

		return (
			<InputContainer onClick={handleClick}>
				{label && !hideLabel && (
					<InputLabel htmlFor={inputId}>{label}</InputLabel>
				)}

				<div className="relative">
					{hasLeftAccessory && (
						<Accessory className="left">{leftAccessory}</Accessory>
					)}

					<StyledInput
						id={inputId}
						ref={ref}
						className={cn(
							{
								"has-error": hasError,
								"with-left-accessory": hasLeftAccessory,
								"with-right-accessory": hasRightAccessory,
							},
							className,
						)}
						aria-invalid={hasError}
						{...rest}
					/>

					{hasRightAccessory && (
						<Accessory className="right">{rightAccessory}</Accessory>
					)}
				</div>

				{helperText && !hasError && <HelperText>{helperText}</HelperText>}

				{hasError && (
					<ErrorMessage>
						<AlertCircle size={12} />
						{errorMessage}
					</ErrorMessage>
				)}
			</InputContainer>
		);
	},
);

Input.displayName = "Input";

export default Input;
