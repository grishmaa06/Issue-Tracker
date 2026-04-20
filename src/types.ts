/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface KanbanState {
  tasks: Task[];
}
