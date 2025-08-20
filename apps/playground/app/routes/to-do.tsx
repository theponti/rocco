import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import type { TodoItem } from "~/lib/todos";
import {
	useCreateTodo,
	useDeleteTodo,
	useTodos,
	useUpdateTodo,
} from "~/lib/todos";

export default function App() {
	const { data: todos = [], isLoading, error } = useTodos();
	const createTodoMutation = useCreateTodo();
	const updateTodoMutation = useUpdateTodo();
	const deleteTodoMutation = useDeleteTodo();

	const [newTodo, setNewTodo] = useState({
		project: "",
		title: "",
		start: "",
		end: "",
		duration: "",
	});

	const addTodo = () => {
		if (!newTodo.project || !newTodo.title) return;

		const newTodoItem = {
			project: newTodo.project,
			title: newTodo.title,
			start: newTodo.start || new Date().toISOString().split("T")[0],
			end: newTodo.end || new Date().toISOString().split("T")[0],
			duration: Number.parseInt(newTodo.duration) || 1,
			completed: false,
		};

		createTodoMutation.mutate(newTodoItem);
		setNewTodo({ project: "", title: "", start: "", end: "", duration: "" });
	};

	const toggleComplete = (todo: TodoItem) => {
		updateTodoMutation.mutate({
			...todo,
			completed: !todo.completed,
		});
	};

	const deleteTodo = (id: number) => {
		deleteTodoMutation.mutate(id);
	};

	// Sort todos by start date and group by project
	const sortedTodos = [...todos].sort(
		(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
	);
	const groupedTodos = sortedTodos.reduce(
		(groups: Record<string, TodoItem[]>, todo: TodoItem) => {
			const project = todo.project;
			if (!groups[project]) {
				groups[project] = [];
			}
			groups[project].push(todo);
			return groups;
		},
		{} as Record<string, TodoItem[]>,
	);

	if (isLoading) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<div className="text-center">Loading todos...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<div className="text-center text-red-500">
					Error loading todos: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold text-center mb-6">
				Project Todo Manager
			</h1>
			<div className="mb-6">
				<Input
					placeholder="Project"
					value={newTodo.project}
					onChange={(e) => setNewTodo({ ...newTodo, project: e.target.value })}
					className="mb-2"
				/>
				<Input
					placeholder="Task Title"
					value={newTodo.title}
					onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
					className="mb-2"
				/>
				<div className="grid grid-cols-2 gap-2 mb-2">
					<Input
						type="date"
						placeholder="Start Date"
						value={newTodo.start}
						onChange={(e) => setNewTodo({ ...newTodo, start: e.target.value })}
					/>
					<Input
						type="date"
						placeholder="End Date"
						value={newTodo.end}
						onChange={(e) => setNewTodo({ ...newTodo, end: e.target.value })}
					/>
				</div>
				<Input
					placeholder="Duration (days)"
					value={newTodo.duration}
					onChange={(e) => setNewTodo({ ...newTodo, duration: e.target.value })}
					className="mb-2"
				/>
				<Button onClick={addTodo} disabled={createTodoMutation.isPending}>
					{createTodoMutation.isPending ? "Adding..." : "Add Todo"}
				</Button>
			</div>
			{Object.entries(groupedTodos).map(([project, projectTodos]) => (
				<div key={project} className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{(projectTodos as TodoItem[]).map((todo: TodoItem) => (
							<motion.div
								key={todo.id}
								whileHover={{ scale: 1.05 }}
								className="transition-transform"
							>
								<Card
									className={`p-4 shadow-md rounded-lg border border-gray-200 ${todo.completed ? "opacity-60" : ""}`}
								>
									<CardContent>
										<div className="flex items-center justify-between mb-2">
											<Badge className={todo.completed ? "line-through" : ""}>
												{project}
											</Badge>
											<div className="flex gap-2">
												<input
													type="checkbox"
													checked={todo.completed}
													onChange={() => toggleComplete(todo)}
													className="w-4 h-4"
													disabled={updateTodoMutation.isPending}
												/>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => deleteTodo(todo.id)}
													disabled={deleteTodoMutation.isPending}
												>
													{deleteTodoMutation.isPending
														? "Deleting..."
														: "Delete"}
												</Button>
											</div>
										</div>
										<h3
											className={`text-lg font-medium ${todo.completed ? "line-through" : ""}`}
										>
											{todo.title}
										</h3>
										<p
											className={`text-sm text-gray-600 ${todo.completed ? "line-through" : ""}`}
										>
											{todo.start} - {todo.end}
										</p>
										<p
											className={`text-sm text-gray-500 ${todo.completed ? "line-through" : ""}`}
										>
											Duration: {todo.duration} days
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
