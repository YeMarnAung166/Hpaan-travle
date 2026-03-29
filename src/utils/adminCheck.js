// List of admin emails – add your email(s) here
export const ADMIN_EMAILS = [
  'yemarnaung166@gmail.com',  
  'myathoneyko9@gmail.com',
];

export const isUserAdmin = (user) => {
  return user && ADMIN_EMAILS.includes(user.email);
};