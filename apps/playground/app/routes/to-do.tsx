import { motion } from "framer-motion";
import { ProjectFormModal } from "~/components/ProjectFormModal";
import { TodoFormModal } from "~/components/TodoFormModal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import type { TodoCreateData, TodoItem } from "~/lib/todos";
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

	const handleAddTodo = (todo: TodoCreateData) => {
		createTodoMutation.mutate(todo);
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
			const project = todo.projectId;
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

	// Empty state when no todos exist
	if (todos.length === 0) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-center mb-6">
					Project Todo Manager
				</h1>
				<div className="mb-6 flex justify-center gap-4">
					<ProjectFormModal />
					<TodoFormModal
						onSubmit={handleAddTodo}
						isLoading={createTodoMutation.isPending}
					/>
				</div>
				<div className="text-center py-12">
					<div className="max-w-md mx-auto">
						<div className="text-gray-400 mb-4">
							<svg
								className="mx-auto h-12 w-12"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No todos yet
						</h3>
						<p className="text-gray-500 mb-6">
							Get started by creating your first project and adding some todos to keep track of your tasks.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold text-center mb-6">
				Project Todo Manager
			</h1>
			<div className="mb-6 flex justify-center gap-4">
				<ProjectFormModal />
				<TodoFormModal
					onSubmit={handleAddTodo}
					isLoading={createTodoMutation.isPending}
				/>
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
