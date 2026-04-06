<template>
    <div class="window-left">
      <section class="form-container">
        <h1 class="form-title">Welcome back</h1>
      
        <form id="signinForm" class="form signin-form" @submit.prevent="handleSignIn($event)">
          <div class="form-group">
            <label for="email">Email</label>
            <br>
            <input class="form-control rounded-5" type="email" id="email" name="email" placeholder="Enter your email" required>
          </div>
      
          <div class="form-group">
            <label for="password">Password</label>
            <br>
            <input class="form-control rounded-5" type="password" id="password" name="password" placeholder="Enter your password" required>
          </div>
      
          <div class="form-group d-flex flex-column text-center">
            <button type="submit" class="btn btn-dark rounded-5 btn-submit">Login</button>
            
            <p class="redirect-text">
              Don’t have an account?
              <a href="signup.html">Sign up</a>
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
    import { handleSignIn, response } from '../src/js/signin.js';

    onMounted(()=>{
      response();
    })
</script>
