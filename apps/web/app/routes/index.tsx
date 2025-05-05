import { Link } from "react-router";

export function meta() {
	return [
		{ title: "Rocco - Places & Lists" },
		{
			name: "description",
			content: "For all the places you've been and will be.",
		},
	];
}

export default function LandingPage() {
	return (
		<div className="flex flex-col items-center justify-center w-full">
			<div className="flex items-center justify-center gap-2 text-black font-extrabold mb-8 py-[100px]w-full">
				<div className="flex flex-col justify-center">
					<p className="text-2xl text-slate-600" data-testid="home-header">
						For all the places you've been and will be.
					</p>
					<p className="text-xl text-slate-600">All in one place.</p>
				</div>
			</div>
			<div className="mt-2">
				<Link to="/login" className="btn btn-primary text-white">
					Get Started
				</Link>
			</div>
		</div>
	);
}
