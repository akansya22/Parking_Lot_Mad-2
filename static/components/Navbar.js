export default {
  template: `
    <div class="row border bg-dark text-white py-2">
      <div class="col-md-6 fs-4">
        Vehicle Parking
      </div>
      <div class="col-md-6 text-end">
        <span v-if="loggedIn" class="me-3">Welcome, {{ username }}</span>

        <!-- ADMIN NAVIGATION -->
        <template v-if="loggedIn && isAdmin">
          <router-link class="btn btn-outline-light btn-sm me-2" to="/admin">Home</router-link>
          <router-link class="btn btn-outline-light btn-sm me-2" to="/admin-users">Users</router-link>
          <router-link class="btn btn-outline-light btn-sm me-2" to="/admin-summary">Summary</router-link>
        </template>

        <!-- USER NAVIGATION -->
        <template v-else-if="loggedIn && isUser">
          <router-link class="btn btn-outline-light btn-sm me-2" to="/user">Home</router-link>
          <router-link class="btn btn-outline-light btn-sm me-2" to="/user-summary">Summary</router-link>
        </template>

        <!-- COMMON LOGOUT -->
        <button v-if="loggedIn" class="btn btn-danger btn-sm" @click="logout">Logout</button>

        <!-- GUEST NAVIGATION -->
        <template v-if="!loggedIn">
          <router-link class="btn btn-primary btn-sm me-2" to="/login">Login</router-link>
          <router-link class="btn btn-warning btn-sm" to="/register">Register</router-link>
        </template>

      </div>
    </div>
  `,

  data() {
    return {
      loggedIn: false,
      username: '',
      roles: []
    };
  },

  computed: {
    isAdmin() {
      return this.roles.includes('admin');
    },
    isUser() {
      return this.roles.includes('user');
    }
  },

  methods: {
    updateAuthInfo() {
      this.loggedIn = !!localStorage.getItem('auth_token');
      this.username = localStorage.getItem('username') || '';
      this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
    },

    logout() {
      localStorage.clear();
      this.updateAuthInfo();
      this.$router.push('/');
    }
  },

  created() {
    this.updateAuthInfo();
    this.$router.afterEach(() => {
      this.updateAuthInfo();
    });
  }
};
