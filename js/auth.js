import { supabase } from './supabase.js';

// Google OAuth login handler
async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) {
    alert(`Google login failed: ${error.message}`);
  }
}

// Email/password login attempt
async function attemptLogin(email, password) {
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!loginError && loginData?.session) {
    window.location.href = 'notes.html';
    return true;
  }

  if (loginError) {
    await handleLoginFailure(loginError, email, password);
  }

  return false;
}

// Handle login failure and signup fallback
async function handleLoginFailure(loginError, email, password) {
  if (loginError.message.toLowerCase().includes('invalid login credentials')) {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password
    });

    if (!signupError && signupData?.user) {
      alert('Account created! Please verify your email before logging in.');
      return;
    }

    alert('Please verify your email before logging in.');
    return;
  }

  alert(`Login failed: ${loginError.message}`);

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signupError) {
    alert(`Sign up failed: ${signupError.message}`);
    return;
  }

  if (signupData?.user && !signupData?.session) {
    alert('Account created! Please verify your email before logging in.');
  } else if (signupData?.session) {
    alert('Account created and logged in!');
    window.location.href = 'notes.html';
  } else {
    alert('Account created. Please log in.');
  }
}

// Form submit handler
async function handleEmailPasswordSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!emailInput || !passwordInput) return;

  const email = (emailInput.value || '').trim();
  const password = passwordInput.value || '';

  if (!email || !password) {
    alert('Please enter email and password.');
    return;
  }

  await attemptLogin(email, password);
}

document.addEventListener('DOMContentLoaded', async () => {
  const authForm = document.getElementById('authForm');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  // Handle OAuth callback redirects
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      window.location.replace('notes.html');
    }
  });

  // Redirect if already logged in
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    window.location.href = 'notes.html';
    return;
  }

  // Setup event listeners
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }

  if (authForm) {
    authForm.addEventListener('submit', handleEmailPasswordSubmit);
  }
});
