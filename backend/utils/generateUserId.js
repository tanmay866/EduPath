import User from '../models/userModel.js';

/**
 * Generate unique login ID based on user's name and year
 * Format: First 2 letters of first name + First 2 letters of last name + Year + Serial Number (3 digits)
 * Example: Mihir Patel => MIPA2026001
 * 
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<string>} Generated login ID
 */
const generateUserId = async (firstName, lastName, offset = 0) => {
  try {
    // Extract first 2 letters from first name and last name
    const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
    const lastNamePrefix = lastName.substring(0, 2).toUpperCase();

    // Get current year from environment or use current year
    const year = process.env.CURRENT_YEAR || new Date().getFullYear();

    // Get the next serial number for this year. `offset` steps past serials that
    // a concurrent signup claimed between our read and our insert.
    const serialNumber = (await User.getNextSerialNumber(year)) + offset;

    // Format serial number to 3 digits (001, 002, etc.). Past 999 it simply
    // grows rather than wrapping onto an id that is already taken.
    const formattedSerial = serialNumber.toString().padStart(3, '0');

    // Combine all parts to create login ID
    const loginId = `${firstNamePrefix}${lastNamePrefix}${year}${formattedSerial}`;

    return loginId;
  } catch (error) {
    throw new Error(`Failed to generate user ID: ${error.message}`);
  }
};

/**
 * True when an error is a duplicate-key violation on the loginId index.
 *
 * @param {Error} error - error thrown by a create/save call
 * @returns {boolean}
 */
export const isDuplicateLoginIdError = (error) =>
  error?.code === 11000 && Object.keys(error?.keyPattern || {}).includes('loginId');

/**
 * Validate if a login ID already exists
 * 
 * @param {string} loginId - Login ID to validate
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export const isLoginIdExists = async (loginId) => {
  try {
    const user = await User.findOne({ loginId: loginId.toUpperCase() });
    return !!user;
  } catch (error) {
    throw new Error(`Failed to validate login ID: ${error.message}`);
  }
};

export default generateUserId;