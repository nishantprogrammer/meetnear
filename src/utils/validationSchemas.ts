import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registrationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const profileSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
});

export const eventSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  date: Yup.date().min(new Date(), 'Event date must be in the future').required('Date is required'),
  location: Yup.object().shape({
    latitude: Yup.number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude')
      .required('Latitude is required'),
    longitude: Yup.number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude')
      .required('Longitude is required'),
    address: Yup.string().required('Address is required'),
  }),
  maxParticipants: Yup.number()
    .min(1, 'Must have at least 1 participant')
    .required('Maximum participants is required'),
});

export const messageSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long')
    .required('Message is required'),
});
