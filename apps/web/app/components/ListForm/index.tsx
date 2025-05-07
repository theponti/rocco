import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2, Plus } from "lucide-react";
import { type SyntheticEvent, useCallback, useState } from "react";
import Alert from "~/components/Alert";
import Input from "~/components/Input";

import Button from "~/components/Button";
import { URLS, api } from "~/lib/api/base";

const MIN_LENGTH = 3;

const FormContainer = styled.div`
  position: relative;
  background: rgba(30, 30, 36, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
  
  &:hover {
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 15px 35px -15px rgba(99, 102, 241, 0.25);
  }
`;

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.39);
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, #5457ea, #7c50e7);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

type ListFormProps = {
	onCancel: () => void;
	onCreate: () => void;
};

export default function ListForm({ onCreate, onCancel }: ListFormProps) {
	const [name, setName] = useState("");
	const { error, mutate, status } = useMutation({
		mutationFn: async () => {
			await api.post(URLS.lists, { name });
		},
		onSuccess: () => {
			setName("");
			onCreate();
		},
	});

	const onCancelClick = useCallback(
		(e: SyntheticEvent<HTMLButtonElement>) => {
			e.preventDefault();
			setName("");
			onCancel();
		},
		[onCancel],
	);

	const onSubmit = useCallback(
		(e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			mutate();
		},
		[mutate],
	);

	const onNameChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);
	}, []);

	const isLoading = status === "pending";
	const isValid = name.length >= MIN_LENGTH;

	return (
		<FormContainer>
			<FormTitle>Create a New List</FormTitle>

			{error && <Alert type="error">{(error as AxiosError).message}</Alert>}

			<form onSubmit={onSubmit}>
				<Input
					autoFocus
					name="listName"
					type="text"
					label="List name"
					onChange={onNameChange}
					value={name}
					placeholder="Enter a name for your list"
					className="w-full bg-white/5 border-white/10 focus:border-indigo-500/50 rounded-lg text-white"
				/>

				<FormActions>
					<CancelButton type="button" onClick={onCancelClick}>
						Cancel
					</CancelButton>

					<SubmitButton type="submit" disabled={!isValid || isLoading}>
						{isLoading ? (
							<>
								<Loader2 size={16} className="animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Plus size={16} />
								Create List
							</>
						)}
					</SubmitButton>
				</FormActions>
			</form>
		</FormContainer>
	);
}
