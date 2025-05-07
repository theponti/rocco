import { getAuth } from "@clerk/react-router/ssr.server";
import styled from "@emotion/styled";
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

// Styled components for the landing page
const GradientText = styled.span`
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const HeroGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: radial-gradient(
    circle at 50% 0%, 
    rgba(99, 102, 241, 0.15) 0%, 
    rgba(13, 12, 34, 0) 50%
  );
  z-index: -1;
`;

const Card = styled.div`
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.2);
  }
`;

const PlanCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &.popular::before {
    content: 'POPULAR';
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
  }
`;

const HeroImage = styled.div`
  position: relative;
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  background: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80') center/cover no-repeat;
  box-shadow: 0 20px 80px -20px rgba(0, 0, 0, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(0deg, rgba(13, 12, 34, 1) 0%, rgba(13, 12, 34, 0) 50%);
  }
`;

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
			<HeroGradient />

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
							Track <GradientText>Places</GradientText> & Create Beautiful{" "}
							<GradientText>Lists</GradientText>
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
						<HeroImage className="relative">
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
						</HeroImage>
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
						<GradientText>organize your travels</GradientText>
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
						<Card className="h-full p-6">
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<MapIcon className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Place Tracking</h3>
							<p className="text-white/70">
								Save all the restaurants, cafes, museums, and destinations you
								love or want to visit.
							</p>
						</Card>
					</motion.div>

					<motion.div variants={fadeIn}>
						<Card className="h-full p-6">
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<List className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Custom Lists</h3>
							<p className="text-white/70">
								Create beautiful, organized lists for different trips, cities,
								or categories of places.
							</p>
						</Card>
					</motion.div>

					<motion.div variants={fadeIn}>
						<Card className="h-full p-6">
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
								<Users className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
							<p className="text-white/70">
								Collaborate on lists with friends and family to plan trips
								together.
							</p>
						</Card>
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
						What our <GradientText>users say</GradientText>
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
							<Card className="h-full p-6">
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
							</Card>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* Pricing Section */}
			<section
				id="pricing"
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
						Simple, <GradientText>transparent pricing</GradientText>
					</h2>
					<p className="text-xl text-white/70 max-w-2xl mx-auto">
						Start for free, upgrade when you need more features.
					</p>
				</motion.div>

				<motion.div
					className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
					variants={fadeInStagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<motion.div variants={fadeIn}>
						<PlanCard className="h-full p-6">
							<h3 className="text-xl font-semibold mb-1">Free</h3>
							<p className="text-white/60 mb-6">Perfect for getting started</p>
							<div className="text-3xl font-bold mb-6">
								$0
								<span className="text-white/50 text-lg font-normal">
									/month
								</span>
							</div>

							<ul className="mb-8 space-y-3">
								{[
									"Up to 50 saved places",
									"3 custom lists",
									"Basic sharing options",
								].map((feature) => (
									<li key={feature} className="flex items-start gap-2">
										<Check size={16} className="text-green-400 mt-1 shrink-0" />
										<span className="text-white/80">{feature}</span>
									</li>
								))}
							</ul>

							<Link
								to="/login"
								className="block w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-center transition-colors"
							>
								Get Started
							</Link>
						</PlanCard>
					</motion.div>

					<motion.div variants={fadeIn}>
						<PlanCard className="h-full p-6 popular">
							<h3 className="text-xl font-semibold mb-1">Premium</h3>
							<p className="text-white/60 mb-6">For serious travelers</p>
							<div className="text-3xl font-bold mb-6">
								$9
								<span className="text-white/50 text-lg font-normal">
									/month
								</span>
							</div>

							<ul className="mb-8 space-y-3">
								{[
									"Unlimited saved places",
									"Unlimited custom lists",
									"Advanced sharing options",
									"Collaborative editing",
									"Priority support",
								].map((feature) => (
									<li key={feature} className="flex items-start gap-2">
										<Check size={16} className="text-green-400 mt-1 shrink-0" />
										<span className="text-white/80">{feature}</span>
									</li>
								))}
							</ul>

							<Link
								to="/login"
								className="block w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium text-center hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
							>
								Get Premium
							</Link>
						</PlanCard>
					</motion.div>

					<motion.div variants={fadeIn}>
						<PlanCard className="h-full p-6">
							<h3 className="text-xl font-semibold mb-1">Business</h3>
							<p className="text-white/60 mb-6">For teams and companies</p>
							<div className="text-3xl font-bold mb-6">
								$29
								<span className="text-white/50 text-lg font-normal">
									/month
								</span>
							</div>

							<ul className="mb-8 space-y-3">
								{[
									"Everything in Premium",
									"Team management",
									"Advanced analytics",
									"API access",
									"Dedicated support",
									"Custom branding",
								].map((feature) => (
									<li key={feature} className="flex items-start gap-2">
										<Check size={16} className="text-green-400 mt-1 shrink-0" />
										<span className="text-white/80">{feature}</span>
									</li>
								))}
							</ul>

							<Link
								to="/contact"
								className="block w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-center transition-colors"
							>
								Contact Sales
							</Link>
						</PlanCard>
					</motion.div>
				</motion.div>
			</section>

			{/* Final CTA */}
			<section className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto">
				<motion.div
					className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8 md:p-12 text-center"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Ready to organize your travel experiences?
					</h2>
					<p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
						Join thousands of travelers and start tracking your favorite places
						today.
					</p>
					<Link
						to="/login"
						className="inline-block py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1"
					>
						Start Your Free Account
					</Link>
				</motion.div>
			</section>

			{/* Footer */}
			<footer className="w-full py-12 px-4 md:px-8 border-t border-white/5">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
					<div className="mb-8 md:mb-0">
						<Link to="/" className="flex items-center gap-2.5 group mb-3">
							<Globe className="size-6 text-indigo-400" />
							<span className="font-bold text-xl">rocco</span>
						</Link>
						<p className="text-white/60 max-w-xs">
							For all the places you've been and will be. All in one place.
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
						<div>
							<h4 className="font-medium mb-3">Product</h4>
							<ul className="space-y-2">
								{["Features", "Pricing", "API", "FAQ"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-white/60 hover:text-white transition-colors"
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-3">Company</h4>
							<ul className="space-y-2">
								{["About", "Blog", "Careers", "Contact"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-white/60 hover:text-white transition-colors"
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-3">Legal</h4>
							<ul className="space-y-2">
								{["Privacy", "Terms", "Security"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-white/60 hover:text-white transition-colors"
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center">
					<p className="text-white/40 text-sm">
						© {new Date().getFullYear()} Rocco. All rights reserved.
					</p>

					<div className="flex gap-4 mt-4 sm:mt-0">
						{["Twitter", "GitHub", "LinkedIn"].map((platform) => (
							<a
								key={platform}
								href="#"
								className="text-white/40 hover:text-white transition-colors text-sm"
							>
								{platform}
							</a>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
