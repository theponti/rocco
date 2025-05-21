import { Heart, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/components/AuthProvider";
import VoteScreen from "~/components/voter/VoteScreen";
import { CreateTrackerForm } from "~/components/voter/create-tracker-form";
import TrackerCardList from "~/components/voter/tracker-card-list";
import { supabase } from "~/lib/supabaseClient";
import type { Tracker, Vote } from "~/lib/voter.types";

export default function VoterPage() {
	const { user, session } = useAuth();
	const navigate = useNavigate();

	const [trackers, setTrackers] = useState<Tracker[]>([]);
	const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTrackers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const { data, error: fetchError } = await supabase
				.from("trackers")
				.select(`
          *,
          votes (*)
        `)
				.order("created_at", { ascending: false });

			if (fetchError) throw fetchError;
			setTrackers(data || []);
		} catch (e: any) {
			console.error("Error fetching trackers:", e);
			setError("Could not load relationship trackers. Please try again.");
			setTrackers([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTrackers();
	}, [fetchTrackers]);

	const handleLoginWithGoogle = async () => {
		try {
			setError(null);
			const { error: signInError } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/voter`, // Or your desired redirect path
				},
			});
			if (signInError) {
				throw signInError;
			}
			// Supabase handles the redirect, no further action needed here
		} catch (e: any) {
			console.error("Error signing in with Google:", e);
			setError(`Failed to sign in with Google: ${e.message}`);
		}
	};

	const handleCreateTracker = async (
		newTrackerData: Omit<Tracker, "id" | "votes" | "user_id" | "created_at"> & {
			photo_url?: string;
		},
	) => {
		if (!user) {
			setError("You must be logged in to create a tracker.");
			return;
		}
		setIsLoading(true);
		try {
			// Convert pros/cons arrays to JSON strings if present
			const trackerToInsert = {
				...newTrackerData,
				user_id: user.id,
				pros: Array.isArray((newTrackerData as any).pros)
					? JSON.stringify((newTrackerData as any).pros)
					: newTrackerData.pros,
				cons: Array.isArray((newTrackerData as any).cons)
					? JSON.stringify((newTrackerData as any).cons)
					: newTrackerData.cons,
			};
			const { data: insertedTracker, error: insertError } = await supabase
				.from("trackers")
				.insert(trackerToInsert)
				.select(`
          *,
          votes (*)
        `)
				.single();

			if (insertError) throw insertError;

			if (insertedTracker) {
				setTrackers((prev) => [
					{ ...insertedTracker, votes: insertedTracker.votes || [] },
					...prev,
				]);
				setIsCreateModalOpen(false);
			} else {
				setError("Failed to create tracker: No data returned.");
			}
		} catch (e: any) {
			console.error("Error creating tracker:", e);
			setError(`Failed to create tracker: ${e.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVoteCasted = (trackerId: string, updatedVotes: Vote[]) => {
		setTrackers((prevTrackers) =>
			prevTrackers.map((t) =>
				t.id === trackerId ? { ...t, votes: updatedVotes } : t,
			),
		);
		if (selectedTracker && selectedTracker.id === trackerId) {
			setSelectedTracker((prev) =>
				prev ? { ...prev, votes: updatedVotes } : null,
			);
		}
	};

	if (isLoading && trackers.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-lg text-gray-600 dark:text-gray-300">
					Loading Relationship Trackers...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center h-screen p-4">
				<p className="text-lg text-red-600 dark:text-red-400 mb-4">{error}</p>
				<button
					type="button"
					onClick={() => fetchTrackers()}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (selectedTracker) {
		return (
			<VoteScreen
				tracker={selectedTracker}
				onBack={() => setSelectedTracker(null)}
				onVoteCasted={handleVoteCasted}
			/>
		);
	}

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="flex flex-col sm:flex-row justify-between items-center mb-8">
				<div className="text-center sm:text-left mb-4 sm:mb-0">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
						<Heart size={36} className="text-red-500" />
						Should They Stay or Go?
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						Get anonymous advice on relationship dilemmas.
					</p>
				</div>
				{session && (
					<button
						type="button"
						onClick={() => {
							if (!user) {
								setError("Please log in to create a tracker.");
								navigate("/login");
								return;
							}
							setIsCreateModalOpen(true);
						}}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
					>
						<Plus size={20} className="mr-2" /> Create New Tracker
					</button>
				)}
				{!session && (
					<div className="text-center sm:text-left mt-4 sm:mt-0">
						<button
							type="button"
							onClick={handleLoginWithGoogle}
							className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
						>
							Log In with Google to Create Tracker
						</button>
					</div>
				)}
			</div>

			<CreateTrackerForm
				isOpen={isCreateModalOpen}
				onTrackerCreate={handleCreateTracker}
				onClose={() => setIsCreateModalOpen(false)}
				title="Create New Relationship Tracker"
			/>

			{trackers.length > 0 ? (
				<TrackerCardList trackers={trackers} onSelect={setSelectedTracker} />
			) : (
				!isLoading && (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400 space-y-4">
						<Heart size={32} className="mx-auto opacity-50" />
						<p className="text-lg">No relationship trackers yet!</p>
						{session && (
							<p>Be the first to create one and gather some opinions!</p>
						)}
						{!session && <p>Log in and create one to get started!</p>}
					</div>
				)
			)}
			<Outlet />
		</div>
	);
}
