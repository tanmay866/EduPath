import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { PhoneInput } from './form';

/**
 * These go through the rendered field rather than calling normalizePhone,
 * which phone.test.mjs already covers. The bugs here were not in the
 * normaliser: `maxLength` truncated a paste before the change handler ever
 * saw it, and the handler spread a DOM element expecting to pass the field
 * through. Neither shows up in a unit test of the pure function.
 */
const Controlled = ({ onValue }) => {
  const [value, setValue] = useState('');
  return (
    <PhoneInput
      name="phone"
      value={value}
      onChange={(e) => { setValue(e.target.value); onValue?.(e.target.value); }}
    />
  );
};

describe('PhoneInput', () => {
  test('shows the country code beside the field, not inside it', async () => {
    render(<Controlled />);
    expect(screen.getByText('+91')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  test('a pasted number carrying the country code keeps the right ten digits', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const field = screen.getByRole('textbox');

    await user.click(field);
    await user.paste('+91 98765 43210');

    expect(field).toHaveValue('9876543210');
  });

  test('the field carries no maxLength, which is what makes the paste above work', () => {
    render(<Controlled />);
    // Asserted directly rather than by pasting. In a real browser maxLength
    // truncates the paste to "+91 93139 " before the change handler ever runs,
    // and it normalises to 9313928 — seven digits, silently wrong. jsdom does
    // not apply maxLength to a controlled React input, so the paste test above
    // passes either way and cannot be the guard. The attribute's absence is
    // the thing to hold onto.
    expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength');
  });

  test('a pasted number with a trunk zero keeps the right ten digits', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('091-98765-43210');
    expect(screen.getByRole('textbox')).toHaveValue('9876543210');
  });

  test('an eleventh keystroke is ignored rather than dropping the first digit', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const field = screen.getByRole('textbox');
    await user.click(field);
    await user.type(field, '98765432101');
    expect(field).toHaveValue('9876543210');
  });

  test('letters never reach the field', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const field = screen.getByRole('textbox');
    await user.click(field);
    await user.type(field, '98a76b54c3210');
    expect(field).toHaveValue('9876543210');
  });

  test('the change handler reports name and value, which is all callers read', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput name="phone" value="" onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), '9');

    // The handler used to spread the synthetic event and its target. Spreading
    // a DOM element copies almost nothing — its properties live on the
    // prototype — so this only looked like it passed the field through.
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target).toMatchObject({ name: 'phone', value: '9' });
  });

  test('a value stored before this field existed is shown without a doubled code', () => {
    render(<PhoneInput name="phone" value="+91 9876543210" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('9876543210');
    expect(screen.getAllByText('+91')).toHaveLength(1);
  });

  test('a caller passing its own onFocus still gets the focus ring', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(<PhoneInput name="phone" value="" onChange={() => {}} onFocus={onFocus} />);
    await user.click(screen.getByRole('textbox'));
    // `{...rest}` used to be spread after the handlers, so a caller's own
    // onFocus replaced the one that draws the ring instead of extending it.
    expect(onFocus).toHaveBeenCalled();
  });
});
