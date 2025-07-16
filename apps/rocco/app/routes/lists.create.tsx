import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";

import ListForm from "~/components/lists-components/list-form";
import type { List } from "~/lib/types";
import { requireAuth } from "~/routes/guards";

export async function loader(loaderArgs: any) {
	const response = await requireAuth(loaderArgs);

	if ("getToken" in response) {
		// For now, return empty data and let the client fetch with tRPC
		return {};
	}

	return response;
}

export default function CreateListPage() {
	const navigate = useNavigate();

	const handleCreate = useCallback(
		(newList: List) => {
			// Navigate to the newly created list
			navigate(`/lists/${newList.id}`);
		},
		[navigate],
	);

	const handleCancel = useCallback(() => {
		// Navigate back to dashboard
		navigate("/dashboard");
	}, [navigate]);

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<div className="mb-6">
				<button
					type="button"
					onClick={handleCancel}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Dashboard
				</button>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<ListForm onCreate={handleCreate} onCancel={handleCancel} />
			</div>
		</div>
	);
}
