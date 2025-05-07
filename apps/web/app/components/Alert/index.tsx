import styled from "@emotion/styled";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { type ReactNode, useState } from "react";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
	children: ReactNode;
	type?: AlertType;
	dismissible?: boolean;
}

const AlertContainer = styled.div<{ alertType: AlertType }>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease forwards;
  
  /* Type-specific styles */
  ${({ alertType }) => {
		switch (alertType) {
			case "success":
				return `
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: rgba(16, 185, 129, 0.9);
        `;
			case "error":
				return `
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: rgba(244, 63, 94, 0.9);
        `;
			case "warning":
				return `
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.2);
          color: rgba(250, 204, 21, 0.9);
        `;
			default:
				return `
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: rgba(99, 102, 241, 0.9);
        `;
		}
	}}
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AlertIconWrapper = styled.div<{ alertType: AlertType }>`
  display: flex;
  padding-top: 0.125rem;
  
  svg {
    ${({ alertType }) => {
			switch (alertType) {
				case "success":
					return "color: rgba(16, 185, 129, 1);";
				case "error":
					return "color: rgba(244, 63, 94, 1);";
				case "warning":
					return "color: rgba(250, 204, 21, 1);";
				default:
					return "color: rgba(99, 102, 241, 1);";
			}
		}}
  }
`;

const AlertContent = styled.div`
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 0.25rem;
  line-height: 0;
  border-radius: 0.375rem;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  color: inherit;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default function Alert({
	children,
	type = "info",
	dismissible = false,
}: AlertProps) {
	const [visible, setVisible] = useState(true);

	if (!visible) return null;

	const getIcon = () => {
		switch (type) {
			case "success":
				return <CheckCircle size={18} />;
			case "error":
				return <AlertCircle size={18} />;
			case "warning":
				return <AlertCircle size={18} />;
			default:
				return <Info size={18} />;
		}
	};

	return (
		<AlertContainer alertType={type}>
			<AlertIconWrapper alertType={type}>{getIcon()}</AlertIconWrapper>

			<AlertContent>{children}</AlertContent>

			{dismissible && (
				<CloseButton
					onClick={() => setVisible(false)}
					aria-label="Dismiss alert"
				>
					<X size={16} />
				</CloseButton>
			)}
		</AlertContainer>
	);
}
