import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, CardFooterNote, TableHead, TableRow, NumCell,
  ActionCell, SegmentedFilter, Button, Input, InlineMessage, MicroLabel,
  Modal, Loading, Empty, TableScroll,
} from '../../design';
import { adminNav } from '../../design/nav';
import { shortDate } from '../format';
import { getUsers, toggleUserBlock, deleteUser } from '../services/adminService';
import { useAdminData } from '../useAdminData';

/**
 * Spec §7 Admin · Users.
 *
 * One card. The header strip holds a search field that takes the free space
 * and a segmented filter. Columns `1.2fr 1.4fr 0.7fr 0.7fr 0.8fr`: a name that
 * drops to text-4 when blocked, the address in 13.5px text-2, a mono joined
 * date, a mono status, and right-aligned actions. Footer counts what is shown.
 *
 * Blocking flips `isActive` on the account. Deleting takes the person's quiz
 * results and roadmaps with them, so it asks first.
 *
 * The API refuses an admin blocking or deleting their own account, but a
 * button that is clickable and then fails is a worse interface than one that
 * was never clickable — Block/Delete are disabled outright on the signed-in
 * admin's own row rather than relying on the round trip to say no.
 */
const COLUMNS = '1.2fr 1.4fr 0.7fr 0.7fr 0.8fr';
const STATUSES = ['All', 'Active', 'Blocked'];

const ManageUsers = () => {
  const { data, loading, error, reload, setData } = useAdminData(getUsers);
  const currentUserId = sessionStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionError, setActionError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const users = data || [];

  const handleToggleBlock = async (user) => {
    setActionError('');
    setBusyId(user._id);
    try {
      const updated = await toggleUserBlock(user._id);
      setData(users.map((u) => (u._id === user._id ? { ...u, isBlocked: updated.isBlocked } : u)));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setActionError('');
    setDeleting(true);
    try {
      await deleteUser(pendingDelete._id);
      setData(users.filter((u) => u._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setPendingDelete(null);
      setActionError(err.message);
    } finally {
      setDeleting(false);
    }
  };

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
    <AdminShell items={adminNav} title="Users">
      {actionError && <InlineMessage tone="error">{actionError}</InlineMessage>}

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

        {loading ? (
          <Loading />
        ) : error ? (
          <Empty action={<Button onClick={reload}>Try again</Button>}>{error}</Empty>
        ) : (
          <>
            <TableScroll minWidth={680}>
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
              filteredUsers.map((user) => {
                // The server marks the caller's own row. Comparing against a
                // stored id here failed whenever sessionStorage did not carry
                // one, which is exactly when the guard was needed.
                const isSelf = user.isSelf ?? (user._id === currentUserId);
                return (
                  <TableRow key={user._id} columns={COLUMNS}>
                    <span style={{ color: user.isBlocked ? 'var(--color-text-4)' : 'var(--color-ink)' }}>
                      {user.name}
                      {isSelf && (
                        <span style={{ fontSize: 12, color: 'var(--color-text-4)' }}> (you)</span>
                      )}
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
                        loading={busyId === user._id}
                        loadingLabel="…"
                        disabled={isSelf}
                        title={isSelf ? 'You cannot block your own account' : undefined}
                        onClick={() => handleToggleBlock(user)}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </Button>
                      <Button
                        variant="destructive"
                        style={{ padding: '7px 13px', fontSize: 13 }}
                        disabled={isSelf}
                        title={isSelf ? 'You cannot delete your own account here' : undefined}
                        onClick={() => setPendingDelete(user)}
                      >
                        Delete
                      </Button>
                    </ActionCell>
                  </TableRow>
                );
              })
            )}
            </TableScroll>

            <CardFooterNote>
              {/* The endpoint returns the 500 newest accounts, so this counts
                  what was loaded rather than every user on the install — a
                  flat total here would disagree with the overview once there
                  are more than that. */}
              {`Showing ${filteredUsers.length} of the ${users.length} newest account${users.length === 1 ? '' : 's'}.`}
            </CardFooterNote>
          </>
        )}
      </Card>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this account?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting} loadingLabel="Deleting…">
              Delete forever
            </Button>
          </>
        }
      >
        {pendingDelete
          && `${pendingDelete.name} (${pendingDelete.email}) will be removed, along with their quiz results and roadmaps. This cannot be undone.`}
      </Modal>
    </AdminShell>
  );
};

export default ManageUsers;
