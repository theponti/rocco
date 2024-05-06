import styled from "@emotion/styled";
import Loading from "@hominem/components/Loading";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, Globe2, Heart, Pin } from "lucide-react";
import api from "src/services/api";
import { useAuth } from "src/services/auth";

import { mediaQueries } from "src/services/constants/styles";

const Wrap = styled.div`
  position: relative;
  display: flex;
  justify-items: center;
  align-items: center;
  margin-bottom: 4rem;
  width: 100%;

  ${mediaQueries.belowMedium} {
    flex-direction: column;
  }

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

export const Route = createFileRoute("/")({
	loader: ({ context }) => api.get("/me").then((response) => response.data),
	pendingComponent: () => <Loading size="xl" />,
	component: () => {
		const { setUser } = useAuth();
		const user = Route.useLoaderData();
		const navigate = Route.useNavigate();

		if (user) {
			setUser(user);
			navigate({ to: "/dashboard" });
		}

		return (
			<Wrap>
				<div className="flex flex-col items-center justify-center w-full">
					<div className="flex text-primary font-extrabold text-4xl mb-8">
						<div>
							<Globe2 className="animate-spin-slow" size={40} />
						</div>
						<p className="ml-2">Make the world yours.</p>
					</div>
					<div className="flex flex-col gap-4 mb-4 font-extrabold text-xl">
						<div className="flex items-center font-extrabold text-xl">
							<Pin size={20} />
							<p className="ml-2">
								Never forget the places you love and want to visit.
							</p>
						</div>
						<div className="flex items-center font-extrabold text-xl">
							<Eye size={20} />
							<p className="ml-2">Discover your friend&apos;s fave places</p>
						</div>
						<div className="flex font-extrabold text-md">
							<Heart size={20} />
							<p className="ml-2">Never wonder where to go again</p>
						</div>
					</div>
					<div className="mt-2">
						<Link to="/login" className="btn btn-primary text-white">
							Get Started
						</Link>
					</div>
				</div>
			</Wrap>
		);
	},
});
