import { List as ListIcon, Mail, Search } from "lucide-react";

import NavLink from "src/components/NavLink";

const Footer = () => {
	return (
		<div className="visible md:hidden btm-nav z-[55]">
			<NavLink href="/">
				<Search className="inline-block" />
			</NavLink>
			<NavLink href="/lists/">
				<span className="inline-block relative">
					<ListIcon className="inline-block" />
				</span>
			</NavLink>
			<NavLink href="/invites/">
				<Mail className="inline-block" />
			</NavLink>
		</div>
	);
};

export default Footer;
