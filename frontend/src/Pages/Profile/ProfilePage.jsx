import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadProfilePicture } from '../Services/profileService';
import { getProfilePictureUrl } from '../../utils/cloudinaryHelper';
import {
  LearnerShell, Card, Button, Input, InlineMessage, MicroLabel,
  Avatar, Badge, Modal, PhoneInput,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';
import { useCareerRoles } from '../../hooks/useCareerRoles';

/** current_skills entries are either plain strings or { skill, level } objects. */
const toSkillList = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (typeof item === 'string' ? item : item?.skill))
    .map((skill) => String(skill || '').trim())
    .filter(Boolean);

/**
 * Spec §7 Profile.
 *
 * Centred 860px, one card: a 28px/30px header with a 60 × 60px navy square,
 * a Newsreader 30px name and a 14.5px meta line, with a secondary action
 * right; a three-cell stat strip at 18px 30px; then a mono section label above
 * one bordered group whose rows are 17px 20px, each a title plus detail on the
 * left and its control on the right.
 *
 * The spec's row controls are steppers and toggles because its profile is a
 * preferences screen. This one edits identity, so most rows carry the field
 * they describe. The photo crop is square rather than circular — nothing in
 * this design system is round.
 */

const ROW = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  padding: '17px 20px',
  borderBottom: '1px solid var(--color-line-soft)',
};

const Row = ({ title, detail, titleTone, children, last = false }) => (
  <div style={{ ...ROW, borderBottom: last ? 'none' : ROW.borderBottom }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 15.5, fontWeight: 500, color: titleTone || 'var(--color-ink)' }}>{title}</div>
      {detail && <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 3 }}>{detail}</div>}
    </div>
    <div style={{ width: 300, flexShrink: 0 }}>{children}</div>
  </div>
);

const ZOOM_CELL = {
  border: '1px solid var(--color-line-btn)',
  background: '#fff',
  padding: '8px 12px',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  color: 'var(--color-ink)',
  lineHeight: 1,
  borderRadius: 0,
};

const SELECT_STYLE = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-ink)',
  background: '#fff',
  border: '1px solid var(--color-line-input)',
  borderRadius: 0,
  outline: 'none',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Image Editor Modal State
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Profile Data
  const { roles: careerRoles } = useCareerRoles();

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    role: 'student',
    target_role: '',
    experience_level: '',
    hours_per_week: '',
    learning_style: 'mixed',
    profilePicture: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Load data from backend
    loadProfileDataFromBackend();
  }, [navigate]);

  const loadProfileDataFromBackend = async () => {
    try {
      setLoading(true);
      const response = await getProfile();

      if (response.success) {
        const profile = response.data;

        // Get userId from sessionStorage to construct Cloudinary URL
        const userId = sessionStorage.getItem('userId');
        const profilePictureUrl = sessionStorage.getItem('profilePicture') ||
                                  (userId ? getProfilePictureUrl(userId) : '');

        // Update state
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          // These two held the same idea in different shapes and had already
          // drifted, so the field falls back to whichever actually has data.
          // Without this, saving a profile whose display string was empty
          // would wipe the skills the roadmap reads.
          skills: profile.skills || toSkillList(profile.current_skills).join(', '),
          role: profile.role || 'student',
          target_role: profile.target_role || '',
          experience_level: profile.experience_level || '',
          hours_per_week: profile.hours_per_week ? String(profile.hours_per_week) : '',
          learning_style: profile.learning_style || 'mixed',
          profilePicture: profilePictureUrl
        });

        // Also update sessionStorage for quick access
        sessionStorage.setItem('firstName', profile.firstName || '');
        sessionStorage.setItem('lastName', profile.lastName || '');
        sessionStorage.setItem('email', profile.email || '');
        sessionStorage.setItem('phone', profile.phone || '');
        sessionStorage.setItem('skills', profile.skills || '');
        sessionStorage.setItem('role', profile.role || 'student');
        sessionStorage.setItem('targetRole', profile.target_role || '');
        sessionStorage.setItem('profileComplete', profile.profile_complete ? '1' : '0');
        sessionStorage.setItem('profilePicture', profilePictureUrl);
        sessionStorage.setItem('loginId', profile.loginId || '');

        // Notify other components that sessionStorage has been updated
        window.dispatchEvent(new Event('sessionStorageUpdated'));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to sessionStorage if API fails
      const firstName = sessionStorage.getItem('firstName') || '';
      const lastName = sessionStorage.getItem('lastName') || '';
      const email = sessionStorage.getItem('email') || '';
      const phone = sessionStorage.getItem('phone') || '';
      const skills = sessionStorage.getItem('skills') || '';
      const role = sessionStorage.getItem('role') || 'student';
      const target_role = sessionStorage.getItem('targetRole') || '';
      const userId = sessionStorage.getItem('userId');
      const profilePicture = sessionStorage.getItem('profilePicture') ||
                            (userId ? getProfilePictureUrl(userId) : '');

      setProfileData({ firstName, lastName, email, phone, skills, role, target_role, profilePicture });

      setError('Could not load profile from server');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    // For phone field, only allow numbers
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setProfileData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowImageEditor(true);
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditedImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    if (!image) return;

    // Square crop — the avatar is a square everywhere in this design system.
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const scaledWidth = image.width * imageScale;
    const scaledHeight = image.height * imageScale;
    const x = (size - scaledWidth) / 2 + imagePosition.x;
    const y = (size - scaledHeight) / 2 + imagePosition.y;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Get the cropped image as data URL
    const croppedImage = canvas.toDataURL('image/png');

    // Upload to Cloudinary
    setUploadingPicture(true);
    setError('');

    try {
      const response = await uploadProfilePicture(croppedImage);

      if (response.success) {
        // Update profile data with Cloudinary URL
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));

        // Reset image load error since we have a new valid image
        setImageLoadError(false);

        // Update sessionStorage
        sessionStorage.setItem('profilePicture', response.data.profilePicture);

        // Notify other components that sessionStorage has been updated
        window.dispatchEvent(new Event('sessionStorageUpdated'));

        setMessage('Profile picture updated');
        setTimeout(() => setMessage(''), 3000);

        // Close editor
        setShowImageEditor(false);
        setTempImage(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload profile picture');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCancelImageEdit = () => {
    setShowImageEditor(false);
    setTempImage(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    // Reset file input
    const input = document.getElementById('profile-picture-input');
    if (input) input.value = '';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (tempImage && showImageEditor) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawPreview();
      };
      img.src = tempImage;
    }
  }, [tempImage, showImageEditor, imageScale, imagePosition]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    if (!image) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#F4F2ED';
    ctx.fillRect(0, 0, size, size);

    const scaledWidth = image.width * imageScale;
    const scaledHeight = image.height * imageScale;
    const x = (size - scaledWidth) / 2 + imagePosition.x;
    const y = (size - scaledHeight) / 2 + imagePosition.y;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  };

  const handleImageClick = () => {
    document.getElementById('profile-picture-input').click();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // `role` is deliberately not sent: it is the account's permission level,
      // not something the profile owns, and the API rejects changes to it.
      //
      // `skills` and `current_skills` are the same list in two shapes — a
      // display string and the array the roadmap reads — so both are written
      // from the one field rather than letting them drift apart.
      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        skills: profileData.skills,
        current_skills: profileData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        target_role: profileData.target_role,
        learning_style: profileData.learning_style,
      };

      // Only sent when set: the API rejects an empty experience level or a
      // zero hours-per-week, and a profile part-way through setup should
      // still be savable.
      if (profileData.experience_level) payload.experience_level = profileData.experience_level;
      if (Number(profileData.hours_per_week) > 0) payload.hours_per_week = Number(profileData.hours_per_week);

      const response = await updateProfile(payload);

      if (response.success) {
        setMessage('Profile updated');

        // Update sessionStorage with the returned data
        const updatedProfile = response.data;
        sessionStorage.setItem('firstName', updatedProfile.firstName || profileData.firstName);
        sessionStorage.setItem('lastName', updatedProfile.lastName || profileData.lastName);
        // `??`, not `||`: phone and skills can legitimately be cleared, and
        // `||` treated an empty string as "nothing came back" and restored the
        // old value. Deleting your number left it in the session, which the
        // contact form now reads to prefill itself — you would have to delete
        // it a second time, somewhere else.
        sessionStorage.setItem('phone', updatedProfile.phone ?? profileData.phone);
        sessionStorage.setItem('skills', updatedProfile.skills ?? profileData.skills);
        sessionStorage.setItem('targetRole', updatedProfile.target_role ?? profileData.target_role);
        sessionStorage.setItem('profileComplete', updatedProfile.profile_complete ? '1' : '0');

        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Your name';
  const initials = `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.trim()
    || sessionInitials();
  const loginId = sessionStorage.getItem('loginId') || '—';
  const skillCount = profileData.skills
    ? profileData.skills.split(',').map((s) => s.trim()).filter(Boolean).length
    : 0;

  const stats = [
    { label: 'Login ID', value: loginId, mono: true },
    { label: 'Target role', value: profileData.target_role || 'Not set' },
    { label: 'Skills listed', value: skillCount },
  ];

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Account"
      title="Profile"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
        {message && <InlineMessage tone="success" style={{ marginBottom: 22 }}>{message}</InlineMessage>}
        {error && <InlineMessage tone="error" style={{ marginBottom: 22 }}>{error}</InlineMessage>}

        <Card>
          {/* Header */}
          <div
            style={{
              padding: '28px 30px',
              borderBottom: '1px solid var(--color-line)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <input
              type="file"
              id="profile-picture-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {profileData.profilePicture && !imageLoadError ? (
              <img
                src={profileData.profilePicture}
                alt=""
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
                style={{ width: 60, height: 60, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-line)' }}
              />
            ) : (
              <Avatar initials={initials} size={60} fontSize={20} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 30,
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.1,
                  margin: 0,
                  color: 'var(--color-ink)',
                }}
              >
                {fullName}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 14.5, color: 'var(--color-text-3)' }}>{profileData.email}</span>
                <Badge tone="green">Active</Badge>
              </div>
            </div>

            <Button variant="secondary" onClick={handleImageClick} style={{ flexShrink: 0 }}>
              {profileData.profilePicture && !imageLoadError ? 'Change photo' : 'Add photo'}
            </Button>
          </div>

          {/* Stat strip — inline rather than <StatStrip> because one value is a
              login ID, which needs mono at a smaller size than 28px. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid var(--color-line)',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: '18px 30px',
                  borderRight: i === stats.length - 1 ? 'none' : '1px solid var(--color-line)',
                }}
              >
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-3)" style={{ display: 'block', marginBottom: 10 }}>
                  {stat.label}
                </MicroLabel>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: stat.mono ? 17 : 28,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-ink)',
                    textTransform: stat.mono ? 'none' : 'capitalize',
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Editable details */}
          <form onSubmit={handleSaveProfile}>
            <div style={{ padding: '22px 20px 0' }}>
              <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 14 }}>
                Your details
              </MicroLabel>
            </div>

            <div style={{ border: '1px solid var(--color-line)', margin: '0 20px' }}>
              <Row title="First name" detail="Shown on your resume and portfolio.">
                <Input
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  placeholder="First name"
                  style={{ padding: '11px 14px' }}
                />
              </Row>

              <Row title="Last name">
                <Input
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  placeholder="Last name"
                  style={{ padding: '11px 14px' }}
                />
              </Row>

              <Row title="Email" detail="Used to sign in. It cannot be changed here.">
                <Input value={profileData.email} disabled style={{ padding: '11px 14px', color: 'var(--color-text-4)' }} />
              </Row>

              <Row title="Mobile number" detail="Digits only, up to ten.">
                <PhoneInput
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  inputStyle={{ padding: '11px 14px' }}
                />
              </Row>

              <Row title="Target role" detail="The track your roadmap and assessments are built from.">
                <select
                  name="target_role"
                  value={profileData.target_role}
                  onChange={handleProfileChange}
                  style={SELECT_STYLE}
                >
                  <option value="">Not chosen yet</option>
                  {/* Keeps the saved value selectable while the list loads,
                      so the field never looks empty on a slow connection. */}
                  {(careerRoles.length ? careerRoles : [profileData.target_role].filter(Boolean))
                    .map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                </select>
              </Row>

              <Row title="Experience level" detail="Sets the starting point of your plan.">
                <select
                  name="experience_level"
                  value={profileData.experience_level}
                  onChange={handleProfileChange}
                  style={SELECT_STYLE}
                >
                  <option value="">Not set</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Row>

              <Row title="Hours per week" detail="How fast your roadmap is paced.">
                <Input
                  type="number"
                  name="hours_per_week"
                  min="1"
                  value={profileData.hours_per_week}
                  onChange={handleProfileChange}
                  placeholder="10"
                  style={{ padding: '11px 14px' }}
                />
              </Row>

              <Row title="Learning style" detail="What your weekly plan leans on.">
                <select
                  name="learning_style"
                  value={profileData.learning_style}
                  onChange={handleProfileChange}
                  style={SELECT_STYLE}
                >
                  <option value="mixed">Mixed</option>
                  <option value="video">Video</option>
                  <option value="reading">Reading</option>
                  <option value="project">Projects</option>
                </select>
              </Row>

              {/* One skills field, not two. This used to write only the
                  display string while the roadmap read a separate array, so
                  editing it here had no effect on the plan. Both are now
                  written from this one input. */}
              <Row title="Skills you have" detail="Comma separated. Used when building your roadmap." last>
                <Input
                  name="skills"
                  value={profileData.skills}
                  onChange={handleProfileChange}
                  placeholder="JavaScript, React, Node.js"
                  style={{ padding: '11px 14px' }}
                />
              </Row>
            </div>

            <div
              style={{
                padding: '22px 20px',
                marginTop: 22,
                borderTop: '1px solid var(--color-line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Button variant="quiet" onClick={() => navigate('/settings')}>Account and security</Button>
              <Button type="submit" loading={loading} loadingLabel="Saving…">Save changes</Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        open={showImageEditor}
        onClose={handleCancelImageEdit}
        title="Adjust your photo"
        actions={
          <>
            <Button variant="secondary" onClick={handleCancelImageEdit} disabled={uploadingPicture}>Cancel</Button>
            <Button onClick={handleSaveEditedImage} loading={uploadingPicture} loadingLabel="Uploading…">Save photo</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            style={{ width: 300, height: 300, border: '1px solid var(--color-line)', cursor: 'move' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <p style={{ fontSize: 13.5, color: 'var(--color-text-4)', margin: '10px 0 0' }}>
            Drag the image to reposition it.
          </p>

          {/* Zoom — the §5 stepper's collapsed-border shape, but stepping by a
              tenth so the range is reachable in a few clicks. */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <MicroLabel size={11} tracking="0.12em">Zoom</MicroLabel>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <button type="button" style={ZOOM_CELL} onClick={() => setImageScale((s) => Math.max(0.2, +(s - 0.1).toFixed(1)))} aria-label="Zoom out">−</button>
              <span style={{ ...ZOOM_CELL, cursor: 'default', padding: '8px 16px', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center' }}>
                {`${Math.round(imageScale * 100)}%`}
              </span>
              <button type="button" style={ZOOM_CELL} onClick={() => setImageScale((s) => Math.min(5, +(s + 0.1).toFixed(1)))} aria-label="Zoom in">+</button>
            </div>
          </div>
        </div>
      </Modal>
    </LearnerShell>
  );
};

export default ProfilePage;
