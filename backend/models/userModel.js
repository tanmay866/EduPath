import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [3, 'Password must be at least 3 characters'],
      select: false, // Don't return password by default in queries
    },
    loginId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'developer', 'designer', 'teacher', 'manager', 'entrepreneur', 'other'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: String,
      trim: true,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    language: {
      type: String,
      default: 'Eng',
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ loginId: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

// Static method to get the next serial number for user ID generation
userSchema.statics.getNextSerialNumber = async function (year) {
  const lastUser = await this.findOne({
    loginId: new RegExp(`^[A-Z]{4}${year}`),
  })
    .sort({ loginId: -1 })
    .select('loginId');

  if (!lastUser) {
    return 1;
  }

  const lastSerial = parseInt(lastUser.loginId.slice(-3));
  return lastSerial + 1;
};

const User = mongoose.model('User', userSchema);

export default User;