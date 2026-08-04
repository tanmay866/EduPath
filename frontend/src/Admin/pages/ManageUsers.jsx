import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, CardFooterNote, TableHead, TableRow, NumCell,
  ActionCell, SegmentedFilter, Button, Input, MicroLabel, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { users as seedUsers } from '../mockData';
import { shortDate } from '../format';

/**
 * Spec §7 Admin · Users.
 *
 * One card. The header strip holds a search field that takes the free space
 * and a segmented filter. Columns `1.2fr 1.4fr 0.7fr 0.7fr 0.8fr`: a name that
 * drops to text-4 when blocked, the address in 13.5px text-2, a mono joined
 * date, a mono status, and right-aligned actions. Footer counts what is shown.
 */
const COLUMNS = '1.2fr 1.4fr 0.7fr 0.7fr 0.8fr';
const STATUSES = ['All', 'Active', 'Blocked'];

const ManageUsers = () => {
  const [users, setUsers] = useState(seedUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleDelete = (id) => setUsers(users.filter((user) => user._id !== id));

  const handleToggleBlock = (id) =>
    setUsers(users.map((user) => (user._id === id ? { ...user, isBlocked: !user.isBlocked } : user)));

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'All'
      || (statusFilter === 'Active' && !user.isBlocked)
      || (statusFilter === 'Blocked' && user.isBlocked);

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminShell items={adminNav} title="Users" chip="SAMPLE DATA">
      <Card>
        <CardHeader
          label={
            <Input
              admin
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              style={{ padding: '9px 12px', fontSize: 14, flex: 1 }}
            />
          }
          right={<SegmentedFilter options={STATUSES} value={statusFilter} onChange={setStatusFilter} />}
        />

        <TableHead columns={COLUMNS} align={['left', 'left', 'right', 'left', 'right']}>
          <span>Name</span>
          <span>Email</span>
          <span>Joined</span>
          <span>Status</span>
          <span>Actions</span>
        </TableHead>

        {filteredUsers.length === 0 ? (
          <Empty>No user matches that search.</Empty>
        ) : (
          filteredUsers.map((user) => (
            <TableRow key={user._id} columns={COLUMNS}>
              <span style={{ color: user.isBlocked ? 'var(--color-text-4)' : 'var(--color-ink)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: 13.5, color: 'var(--color-text-2)' }}>{user.email}</span>
              <NumCell tone="var(--color-text-4)" size={12.5}>{shortDate(user.createdAt)}</NumCell>
              <MicroLabel
                size={11}
                tracking="0.1em"
                color={user.isBlocked ? 'var(--color-clay)' : 'var(--color-green)'}
              >
                {user.isBlocked ? 'Blocked' : 'Active'}
              </MicroLabel>
              <ActionCell>
                <Button
                  variant="secondary"
                  style={{ padding: '7px 13px', fontSize: 13 }}
                  onClick={() => handleToggleBlock(user._id)}
                >
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </Button>
                <Button
                  variant="destructive"
                  style={{ padding: '7px 13px', fontSize: 13 }}
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </Button>
              </ActionCell>
            </TableRow>
          ))
        )}

        <CardFooterNote>
          {`Showing ${filteredUsers.length} of ${users.length} user${users.length === 1 ? '' : 's'}.`}
        </CardFooterNote>
      </Card>
    </AdminShell>
  );
};

export default ManageUsers;
