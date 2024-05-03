import styled from "@emotion/styled";
import Loading from "@hominem/components/Loading";
import {
	Link,
	createFileRoute,
	createLazyFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { Eye, Globe2, Heart, Pin } from "lucide-react";
import api from "src/services/api";
import { AuthStatus, loadAuth } from "src/services/auth";

import { mediaQueries } from "src/services/constants/styles";
import { AuthContext } from "src/services/hooks";
import { useAppDispatch } from "src/services/store";

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
	loader: async () => {
		const response = await api.get("/me");

		if (!response.data || !response.data.id) {
			return { status: AuthStatus.Unauthenticated };
		}

		return { status: AuthStatus.Authenticated, user: response.data };
	},
	pendingComponent: () => <Loading size="xl" />,
	component: () => {
		const data = Route.useLoaderData();
		const navigate = useNavigate();

		if (data.status === AuthStatus.Authenticated) {
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
