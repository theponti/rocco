import styled from "@emotion/styled";
import Alert from "app/components/Alert";
import { PlusCircle } from "lucide-react";
import { memo, useMemo } from "react";
import { Link } from "react-router";

import type { List, User } from "app/lib/types";
import ListItem from "./list-item";

const EmptyStateCard = styled.div`
  position: relative;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(30, 30, 36, 0.3);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
    z-index: -1;
  }
  
  .create-button {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.6);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
`;

const SkeletonLoader = styled.li`
  background: linear-gradient(90deg, rgba(30, 30, 36, 0.4) 0%, rgba(50, 50, 60, 0.4) 50%, rgba(30, 30, 36, 0.4) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.03);
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const NoResults = () => {
	return (
		<EmptyStateCard>
			<div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
				<PlusCircle size={30} className="text-indigo-400" />
			</div>
			<h3 className="text-xl font-semibold mb-3 text-white">No Lists Yet</h3>
			<p className="text-white/60 max-w-md mb-6">
				Create your first list to start organizing your favorite places and plan
				your next adventures!
			</p>
			<Link
				to="/lists/new"
				className="create-button flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium"
				data-testid="create-list-cta"
			>
				Create your first list
			</Link>
		</EmptyStateCard>
	);
};

const skeletonArray = Array.from({ length: 3 }, () => crypto.randomUUID());
function Lists({
	status,
	lists,
	error,
	currentUserEmail,
}: {
	status: string;
	lists: (List & { createdBy: User })[];
	error: any;
	currentUserEmail: string;
}) {
	if (status === "loading") {
		return (
			<div className="space-y-3" data-testid="lists-skeleton">
				{skeletonArray.map((_) => (
					<SkeletonLoader key={_} className="h-[72px]" />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<Alert type="error">
				<div className="flex flex-col gap-2">
					<p className="font-medium">{error.message}</p>
					<button
						type="button"
						className="self-start px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors"
						onClick={() => window.location.reload()}
						data-testid="lists-retry-btn"
					>
						Retry
					</button>
				</div>
			</Alert>
		);
	}

	if (lists?.length === 0) {
		return <NoResults />;
	}

	if (!lists) {
		return null;
	}

	// Memoize the ownership calculation to prevent recalculations on re-render
	const listsWithOwnership = useMemo(() => {
		return lists.map((list) => ({
			...list,
			isOwnList: list.createdBy.email === currentUserEmail,
		}));
	}, [lists, currentUserEmail]);

	return (
		<ul data-testid="lists" className="space-y-3">
			{listsWithOwnership.map((list) => (
				<ListItem
					key={list.id}
					list={list}
					isOwnList={list.isOwnList}
					aria-label={
						list.isOwnList ? `Your list: ${list.name}` : `List: ${list.name}`
					}
				/>
			))}
		</ul>
	);
}

// Export a memoized version of the component
export default memo(Lists);
