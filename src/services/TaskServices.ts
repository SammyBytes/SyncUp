import type { TaskResponseDto } from "../dtos/TaskResponseDto";

export const create = (
  listId: string,
  taskResponse: TaskResponseDto,
  token: string
) => {
  return fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: taskResponse.title,
      description: taskResponse.body,
    }),
  });
};
