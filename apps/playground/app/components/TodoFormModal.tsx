import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { useProjects } from "~/lib/projects";
import type { TodoCreateData } from "~/lib/todos";

interface TodoFormModalProps {
	onSubmit: (todo: TodoCreateData) => void;
	isLoading?: boolean;
	trigger?: React.ReactNode;
}

export function TodoFormModal({
	onSubmit,
	isLoading = false,
}: TodoFormModalProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		projectId: "",
		title: "",
		start: "",
		end: "",
	});

	const { data: projects = [], isLoading: projectsLoading } = useProjects();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.projectId || !formData.title) return;

		const projectId = Number.parseInt(formData.projectId);
		if (isNaN(projectId)) {
			alert("Please select a valid project");
			return;
		}

		const startDate = new Date(
			formData.start || new Date().toISOString().split("T")[0],
		);
		const endDate = new Date(formData.end || startDate);
		const duration = Math.max(
			1,
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
			) + 1,
		);

		const newTodo: TodoCreateData = {
			projectId: projectId,
			title: formData.title,
			start: formData.start || new Date().toISOString().split("T")[0],
			end: formData.end || new Date().toISOString().split("T")[0],
			completed: false,
		};

		onSubmit(newTodo);
		setFormData({ projectId: "", title: "", start: "", end: "" });
		setOpen(false);
	};

	const handleCancel = () => {
		setFormData({ projectId: "", title: "", start: "", end: "" });
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">Add New Todo</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Todo</DialogTitle>
					<DialogDescription>
						Create a new todo item. Fill in the details below.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="project" className="text-right">
								Project
							</Label>
							<Select
								id="project"
								value={formData.projectId}
								onChange={(e) =>
									setFormData({ ...formData, projectId: e.target.value })
								}
								className="col-span-3"
								required
								disabled={projectsLoading}
								aria-describedby="project-error"
							>
								<option value="">Select a project</option>
								{projects.map((project) => (
									<option key={project.id} value={project.id}>
										{project.name}
									</option>
								))}
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="title" className="text-right">
								Title
							</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								className="col-span-3"
								placeholder="Enter task title"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="start" className="text-right">
								Start Date
							</Label>
							<Input
								id="start"
								type="date"
								value={formData.start}
								onChange={(e) =>
									setFormData({ ...formData, start: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="end" className="text-right">
								End Date
							</Label>
							<Input
								id="end"
								type="date"
								value={formData.end}
								onChange={(e) =>
									setFormData({ ...formData, end: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || projectsLoading}>
							{isLoading ? "Adding..." : "Add Todo"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
