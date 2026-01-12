import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    window.location.href = 'notes.html';
    return;
  }

  const authForm = document.getElementById('authForm');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  // OAuth redirect handler - redirects to notes.html after successful sign in
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      window.location.href = 'notes.html';
    }
  });

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      // Explicitly set redirectTo for production deployments
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/notes.html'
        }
      });
      if (error) {
        alert(`Google login failed: ${error.message}`);
      }
    });
  }

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

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (!error && signInData?.session) {
      window.location.href = 'notes.html';
      return;
    }

    if (error) {
      alert(`Login failed: ${error.message}`);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (signUpError) {
        alert(`Sign up failed: ${signUpError.message}`);
        return;
      }

      if (signUpData?.user && !signUpData?.session) {
        alert('Account created! Check your email to confirm, then log in.');
      } else if (signUpData?.session) {
        alert('Account created and logged in!');
        window.location.href = 'notes.html';
      } else {
        alert('Account created. Please log in.');
      }
    }
  });
  }
});
