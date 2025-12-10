import { useState, useEffect } from 'react';
import { Users, Search, Activity } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAllUsers } from '../../services/userService';
import { getTasksByUser } from '../../services/taskService';
import { formatDate } from '../../utils/formatters';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [workerTasks, setWorkerTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const users = await getAllUsers();
      const workerList = users.filter(u => u.role === 'WORKER');
      setWorkers(workerList);

      // Fetch tasks for each worker
      const tasksPromises = workerList.map(async (worker) => {
        try {
          const tasks = await getTasksByUser(worker.id);
          return { workerId: worker.id, tasks };
        } catch (err) {
          return { workerId: worker.id, tasks: [] };
        }
      });

      const tasksResults = await Promise.all(tasksPromises);
      const tasksMap = {};
      tasksResults.forEach(({ workerId, tasks }) => {
        tasksMap[workerId] = tasks;
      });
      setWorkerTasks(tasksMap);
    } catch (err) {
      setError('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActiveTasksCount = (workerId) => {
    const tasks = workerTasks[workerId] || [];
    return tasks.filter(t => t.status !== 'COMPLETED').length;
  };

  if (loading) return <Loading text="Loading workers..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Worker Management</h1>
        <p className="text-gray-600 mt-1">Monitor worker performance and activity</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search workers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search size={20} className="mr-2" />
            Search
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active Tasks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.map((worker) => {
              const activeTasks = getActiveTasksCount(worker.id);
              return (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">#{worker.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {worker.name}
                    </div>
                  </TableCell>
                  <TableCell>{worker.email}</TableCell>
                  <TableCell>
                    <Badge variant={activeTasks > 0 ? 'orange' : 'green'}>
                      {activeTasks} active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="green">Active</Badge>
                  </TableCell>
                  <TableCell>{formatDate(worker.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Activity size={16} className="mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredWorkers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workers found
          </div>
        )}
      </Card>
    </div>
  );
}

