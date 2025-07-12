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
import { requireGuest } from "~/routes/guards";
import type { Route } from "./+types";
import styles from "./index.module.css";
import { testimonials } from "./testimonials";

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
	await requireGuest(loaderArgs.request);
	return null;
}

export default function LandingPage() {
	return (
		<div className="flex flex-col items-center justify-center w-full overflow-hidden">
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
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
							Track <span className={styles.gradientText}>Places</span> & Create
							Beautiful <span className={styles.gradientText}>Lists</span>
						</h1>

						<p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
							Discover, organize, and share all the places you've been and plan
							to visit. Create beautiful lists and share them with friends.
						</p>

						<div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
							<Link
								to="/login"
								className="text-white py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1"
							>
								Get Started — It's Free
							</Link>

							<a
								href="#features"
								className="text-gray-600 hover:text-gray-900 flex items-center gap-2 group transition-colors"
							>
								Learn more
								<ExternalLink
									size={16}
									className="inline-block group-hover:translate-x-1 transition-transform"
								/>
							</a>
						</div>

						<div className="mt-10 flex items-center gap-2 justify-center lg:justify-start text-gray-500 text-sm">
							<Check size={16} className="text-green-500" />
							No credit card required
							<span className="mx-2">•</span>
							<Check size={16} className="text-green-500" />
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
							<div className="absolute bottom-6 left-6 right-6 z-10 bg-white/90 backdrop-blur-md rounded-lg p-4 border border-gray-200 shadow-lg">
								<div className="flex items-center gap-3">
									<Globe className="text-indigo-500" />
									<div>
										<div className="text-indigo-600 text-sm font-medium">
											Your Next Adventure
										</div>
										<div className="text-xs text-gray-600">
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
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
						Everything you need to{" "}
						<span className={styles.gradientText}>organize your travels</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
								<MapIcon className="text-indigo-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">
								Place Tracking
							</h3>
							<p className="text-gray-600">
								Save all the restaurants, cafes, museums, and destinations you
								love or want to visit.
							</p>
						</div>
					</motion.div>

					<motion.div variants={fadeIn}>
						<div className={`${styles.card} h-full p-6`}>
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<List className="text-indigo-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">
								Custom Lists
							</h3>
							<p className="text-gray-600">
								Create beautiful, organized lists for different trips, cities,
								or categories of places.
							</p>
						</div>
					</motion.div>

					<motion.div variants={fadeIn}>
						<div className={`${styles.card} h-full p-6`}>
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<Users className="text-indigo-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">
								Invite Friends
							</h3>
							<p className="text-gray-600">
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
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
						What our <span className={styles.gradientText}>users say</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
					{testimonials.map((testimonial) => (
						<motion.div key={testimonial.id} variants={fadeIn}>
							<div className={`${styles.card} h-full p-6`}>
								<div className="flex gap-1 mb-4">
									{testimonial.starsArray.map((index) => (
										<Star
											key={index}
											size={16}
											fill="#6366f1"
											className="text-indigo-500"
										/>
									))}
								</div>
								<p className="text-gray-700 mb-6 italic">
									"{testimonial.quote}"
								</p>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white">
										{testimonial.name[0]}
									</div>
									<div>
										<div className="font-medium text-gray-900">
											{testimonial.name}
										</div>
										<div className="text-sm text-gray-500">
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
