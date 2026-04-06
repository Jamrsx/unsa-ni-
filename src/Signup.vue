<template>
    <div class="window-left">
      <section class="form-container">
        <h1 class="form-title">Create your new account</h1>
      
        <form id="signupForm" class="form signup-form" @submit.prevent="handleSignUp($event)">
          <!-- username -->
          <div class="form-group">
            <label for="username">Username</label>
            <br>
            <input class="form-control rounded-5" type="text" id="username" name="username" placeholder="Enter your username" required>
          </div>
          
          <!-- email -->
          <div class="form-group">
            <label for="email">Email</label>
            <br>
            <input class="form-control rounded-5" type="email" id="email" name="email" placeholder="Enter your email" required>
          </div>
          
          <!-- password -->
          <div class="form-group">
            <label for="password">Password</label>
            <br>
            <input class="form-control rounded-5" type="password" id="password" name="password" placeholder="Enter your password" autocomplete="new-password" required>
          </div>
          
          <!-- confirmPassword -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <br>
            <input class="form-control rounded-5" type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" autocomplete="new-password" required>
          </div>
          
          <div class="form-group d-flex flex-column text-center">
            <button type="submit" class="btn btn-dark rounded-5 btn-submit">Sign Up</button>
            
            <p class="redirect-text">
              Already have an account?
              <a href="signin.html">Login</a>
            </p>
          </div>
        </form>
      </section>
    </div>

    <div class="background background-outer"></div>
    <div class="background background-shape-right"></div>
    <div class="background background-shape-left"></div>
</template>
<script setup>
  import { onMounted } from 'vue';
  import { handleSignUp, response } from '../src/js/signup.js';

  onMounted(()=>{
    response();
  })
</script>
