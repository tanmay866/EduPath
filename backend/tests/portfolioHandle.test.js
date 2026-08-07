import test from 'node:test';
import assert from 'node:assert/strict';

import { slugify, uniqueHandle } from '../utils/portfolioHandle.js';

/**
 * Portfolios stored `user.username`, and users have no username field, so
 * every portfolio ever published saved an empty string and the public route
 * that looks one up by handle could never match anything.
 *
 * The failures that matter now: two people colliding on one handle, and a
 * name that reduces to nothing being published at a blank address.
 */
test('a name becomes something that can sit in a URL', () => {
    assert.equal(slugify('Tanmay Patel'), 'tanmay-patel');
    assert.equal(slugify('  Jane   Smith  '), 'jane-smith');
    assert.equal(slugify("O'Brien-Jones"), 'o-brien-jones');
});

test('accents keep their letters instead of losing them', () => {
    assert.equal(slugify('José Álvarez'), 'jose-alvarez');
    assert.equal(slugify('Zoë'), 'zoe');
});

test('a name that reduces to nothing says so rather than returning a blank handle', () => {
    // The caller has to be able to tell this apart from a working handle.
    for (const junk of ['', '   ', '!!!', '###', null, undefined]) {
        assert.equal(slugify(junk), '');
    }
});

test('a handle never ends in a dangling separator', () => {
    assert.ok(!slugify('Bob !!!').endsWith('-'));
    assert.ok(!slugify('a'.repeat(45) + ' extra').endsWith('-'));
});

test('a free handle is taken as is', async () => {
    const handle = await uniqueHandle('Jane Smith', async () => false);
    assert.equal(handle, 'jane-smith');
});

test('a taken handle counts up so the reason is legible', async () => {
    const used = new Set(['jane-smith', 'jane-smith-2']);
    const handle = await uniqueHandle('Jane Smith', async (h) => used.has(h));
    assert.equal(handle, 'jane-smith-3');
});

test('an unusable name falls back rather than publishing at a blank address', async () => {
    const handle = await uniqueHandle('!!!', async () => false, 'a1b2c3d4');
    assert.equal(handle, 'a1b2c3d4');

    const last = await uniqueHandle('!!!', async () => false, '');
    assert.equal(last, 'portfolio');
});

test('relentless collisions still end, with a handle that is still unique', async () => {
    // An unbounded loop against a database is not something to leave running.
    const handle = await uniqueHandle('Jane Smith', async () => true);
    assert.ok(handle.startsWith('jane-smith-'));
    assert.ok(handle.length > 'jane-smith-'.length);
});
