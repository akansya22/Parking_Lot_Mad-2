export default {
    template: `
    <div class="row border bg-dark text-white py-2">
        <div class="col-md-6 fs-4">
            Vehicle Parking
            <span v-if="isAdmin" class="ms-3">Welcome, {{ username }}</span>
        </div>
        <div class="col-md-6 text-end">
            <router-link v-if="loggedIn && isAdmin" class="btn btn-outline-light btn-sm me-2" to="/">Home</router-link>
            <router-link v-if="loggedIn && isAdmin" class="btn btn-outline-light btn-sm me-2" to="/admin-users">Users</router-link>
            <router-link v-if="loggedIn && isAdmin" class="btn btn-outline-light btn-sm me-2" to="/admin-summary">Summary</router-link>
            <button v-if="loggedIn" class="btn btn-danger btn-sm" @click="logout">Logout</button>
            <router-link v-if="!loggedIn" class="btn btn-primary btn-sm me-2" to="/login">Login</router-link>
            <router-link v-if="!loggedIn" class="btn btn-warning btn-sm" to="/register">Register</router-link>
        </div>
    </div>
    `,
    data() {
        return {
            loggedIn: !!localStorage.getItem('auth_token'),
            username: localStorage.getItem('username') || '',
            roles: []
        };
    },
    computed: {
        isAdmin() {
            const roles = JSON.parse(localStorage.getItem("roles") || "[]");
            return roles.includes("admin");
        }
    },
    methods: {
        logout() {
            localStorage.clear();
            this.$router.push('/login');
        }
    }
};
