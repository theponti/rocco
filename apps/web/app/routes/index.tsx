import { getAuth } from "@clerk/react-router/ssr.server";
import { motion } from "framer-motion";
import {
	Check,
	ExternalLink,
	Globe,
	List,
	Map as MapIcon,
	Star,
	Users,
} from "lucide-react";
import { Link, redirect } from "react-router";
import type { Route } from "./+types";
import styles from "./index.module.css";

export function meta() {
	return [
		{ title: "Rocco - Track Places & Create Lists" },
		{
			name: "description",
			content:
				"Discover, organize, and share all the places you've been and plan to visit. Create beautiful lists and share them with friends.",
		},
	];
}

// Animation variants
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInStagger = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

export async function loader(loaderArgs: Route.LoaderArgs) {
	const { userId } = await getAuth(loaderArgs);

	if (userId) {
		return redirect("/dashboard");
	}
}

export default function LandingPage() {
	return (
		<div className="flex flex-col items-center justify-center w-full bg-[#0d0c22] text-white overflow-hidden">
			<div className={styles.heroGradient} />

			{/* Hero Section */}
			<section className="w-full min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row items-center justify-between gap-12">
					<motion.div
						className="lg:w-1/2 text-center lg:text-left"
						initial="hidden"
						animate="visible"
						variants={fadeIn}
					>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
							Track <span className={styles.gradientText}>Places</span> & Create
							Beautiful <span className={styles.gradientText}>Lists</span>
						</h1>

						<p className="text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
							Discover, organize, and share all the places you've been and plan
							to visit. Create beautiful lists and share them with friends.
						</p>

						<div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
							<Link
								to="/login"
								className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1"
							>
								Get Started — It's Free
							</Link>

							<a
								href="#features"
								className="text-white/80 hover:text-white flex items-center gap-2 group transition-colors"
							>
								Learn more
								<ExternalLink
									size={16}
									className="inline-block group-hover:translate-x-1 transition-transform"
								/>
							</a>
						</div>

						<div className="mt-10 flex items-center gap-2 justify-center lg:justify-start text-white/50 text-sm">
							<Check size={16} className="text-green-400" />
							No credit card required
							<span className="mx-2">•</span>
							<Check size={16} className="text-green-400" />
							Free tier available
						</div>
					</motion.div>

					<motion.div
						className="lg:w-1/2"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.3 }}
					>
						<div className={styles.heroImage}>
							<div className="absolute bottom-6 left-6 right-6 z-10 bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/10">
								<div className="flex items-center gap-3">
									<Globe className="text-indigo-400" />
									<div>
										<div className="text-sm font-medium">
											Your Next Adventure
										</div>
										<div className="text-xs text-white/70">
											15 places saved • 3 lists created
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto"
			>
				<motion.div
					className="text-center mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeIn}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Everything you need to{" "}
						<span className={styles.gradientText}>organize your travels</span>
					</h2>
					<p className="text-xl text-white/70 max-w-2xl mx-auto">
						Rocco provides all the tools you need to keep track of places you've
						visited and plan your next adventure.
					</p>
				</motion.div>

				<motion.div
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
					variants={fadeInStagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<motion.div variants={fadeIn}>
						<div className={`${styles.card} h-full p-6`}>
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<MapIcon className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Place Tracking</h3>
							<p className="text-white/70">
								Save all the restaurants, cafes, museums, and destinations you
								love or want to visit.
							</p>
						</div>
					</motion.div>

					<motion.div variants={fadeIn}>
						<div className={`${styles.card} h-full p-6`}>
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<List className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Custom Lists</h3>
							<p className="text-white/70">
								Create beautiful, organized lists for different trips, cities,
								or categories of places.
							</p>
						</div>
					</motion.div>

					<motion.div variants={fadeIn}>
						<div className={`${styles.card} h-full p-6`}>
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<Users className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
							<p className="text-white/70">
								Collaborate on lists with friends and family to plan trips
								together.
							</p>
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* Testimonials Section */}
			<section
				id="testimonials"
				className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto"
			>
				<motion.div
					className="text-center mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeIn}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						What our <span className={styles.gradientText}>users say</span>
					</h2>
					<p className="text-xl text-white/70 max-w-2xl mx-auto">
						Join thousands of travelers who use Rocco to organize their
						adventures.
					</p>
				</motion.div>

				<motion.div
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
					variants={fadeInStagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					{[
						{
							name: "Sarah Johnson",
							role: "Travel Blogger",
							quote:
								"Rocco has completely changed how I organize my travel plans. The ability to create shared lists is a game-changer!",
							stars: 5,
						},
						{
							name: "Michael Chen",
							role: "Food Enthusiast",
							quote:
								"I use Rocco to keep track of all the restaurants I want to try. The interface is beautiful and so easy to use.",
							stars: 5,
						},
						{
							name: "Emma Williams",
							role: "Digital Nomad",
							quote:
								"As someone who travels constantly, Rocco helps me remember all the amazing places I've been. Highly recommend!",
							stars: 5,
						},
					].map((testimonial) => (
						<motion.div key={testimonial.name} variants={fadeIn}>
							<div className={`${styles.card} h-full p-6`}>
								<div className="flex gap-1 mb-4">
									{[...Array(testimonial.stars)].map((_) => (
										<Star
											key={_}
											size={16}
											fill="#6366f1"
											className="text-indigo-400"
										/>
									))}
								</div>
								<p className="text-white/80 mb-6 italic">
									"{testimonial.quote}"
								</p>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold">
										{testimonial.name[0]}
									</div>
									<div>
										<div className="font-medium">{testimonial.name}</div>
										<div className="text-sm text-white/60">
											{testimonial.role}
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</section>
		</div>
	);
}
