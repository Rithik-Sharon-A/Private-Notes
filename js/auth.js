import { supabase } from './supabase.js';

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

  // Google OAuth login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        alert(`Google login failed: ${error.message}`);
      }
    });
  }

  // Email/password login with sign-up fallback
  if (authForm) {
    authForm.addEventListener('submit', async (event) => {
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

      // Try login first
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!loginError && loginData?.session) {
        window.location.href = 'notes.html';
        return;
      }

      // Login failed - try sign up
      if (loginError) {
        alert(`Login failed: ${loginError.message}`);

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signupError) {
          alert(`Sign up failed: ${signupError.message}`);
          return;
        }

        // Handle different sign-up outcomes
        if (signupData?.user && !signupData?.session) {
          alert('Account created! Check your email to confirm, then log in.');
        } else if (signupData?.session) {
          alert('Account created and logged in!');
          window.location.href = 'notes.html';
        } else {
          alert('Account created. Please log in.');
        }
      }
    });
  }
});
